const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import model factories
const createUserModel = require('./models/user');
const createFlightLogModel = require('./models/flightLog');

const app = express();
app.use(express.json());
app.use(cors());

// 🔌 DATABASE CONNECTIONS
const userConnection = mongoose.createConnection("mongodb://127.0.0.1:27017/user");

const flightConnection = mongoose.createConnection("mongodb+srv://tanugarima712:tanu2004@cluster0.4glcoq0.mongodb.net/flight_database", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// 🧠 MODELS
const User = createUserModel(userConnection);
const FlightLog = createFlightLogModel(flightConnection);

// Connection event listeners
userConnection.on('connected', () => {
    console.log('✅ Connected to user database!');
});
userConnection.on('error', (err) => {
    console.error('❌ User DB connection error:', err);
});

flightConnection.on('connected', () => {
    console.log('✅ Connected to flight database!');
});
flightConnection.on('error', (err) => {
    console.error('❌ Flight DB connection error:', err);
});

console.log('User model collection name:', User.collection.name);
console.log('Flight model collection name:', FlightLog.collection.name);

// 🛂 SIGNUP
app.post('/signup', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const newUser = await User.create({ name, email, password, confirmPassword });
        res.status(201).json({ message: "User created", user: newUser });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// 🔐 LOGIN
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("📥 Login attempt:", email, password);
  
    try {
        const user = await User.findOne({ email });
        console.log("🔍 Lookup result:", user);
  
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password (email not found)" });
        }
  
        if (user.password !== password) {
            console.log("❌ Password mismatch:", user.password, password);
            return res.status(401).json({ message: "Invalid email or password (wrong password)" });
        }
  
        console.log("✅ Login success");
        res.json({ message: "Login successful", user });
  
    } catch (error) {
        console.error("❗ Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✈️ GET FLIGHT LOGS - SIMPLIFIED VERSION WITH DATE FIX
app.get('/flights', async (req, res) => {
    try {
        // Explicitly specify the collection for debugging
        console.log('Attempting to query flight logs from collection:', FlightLog.collection.name);
        
        const logs = await FlightLog.find().sort({ timestamp: -1 });
        console.log(`Found ${logs.length} flight logs`);
        
        // Print a sample for debugging
        if (logs.length > 0) {
            console.log('Sample flight log:', logs[0]);
        }

        const formatted = logs.map(flight => {
            // Explicitly handle ISO string conversion for better date parsing
            let dateObj;
            try {
                // Handle different timestamp formats
                const timestamp = flight.timestamp;
                if (typeof timestamp === 'string') {
                    dateObj = new Date(timestamp);
                } else if (timestamp instanceof Date) {
                    dateObj = timestamp;
                } else {
                    console.error('Unknown timestamp format:', timestamp);
                    dateObj = new Date(); // Fallback to current date
                }
                
                // Check if date is valid
                if (isNaN(dateObj.getTime())) {
                    console.error('Invalid date created from timestamp:', timestamp);
                    dateObj = new Date(); // Fallback to current date
                }
            } catch (err) {
                console.error('Error parsing date:', err);
                dateObj = new Date(); // Fallback to current date
            }

            // Format date and time with explicit options
            const date = dateObj.toLocaleDateString('en-US', {
                year: "numeric",
                month: "long",
                day: "numeric"
            });
            
            const time = dateObj.toLocaleTimeString('en-US', {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            });
            
            return {
                date,
                tailNumber: flight.tail_number,
                outboundTime: flight.status === "departing" ? time : "—",
                inboundTime: flight.status === "arriving" ? time : "—",
                duration: "—",
                status: flight.status,
                departureVideo: "Not Available",
                arrivalVideo: "Not Available",
                direction: flight.direction
            };
        });

        res.json(formatted);
    } catch (err) {
        console.error("Flight log error:", err);
        res.status(500).json({ message: "Error fetching flight logs", error: err.message });
    }
});

// ✈️ GET FLIGHT LOGS WITH DURATIONS - IMPROVED VERSION
app.get('/flights-with-durations', async (req, res) => {
    try {
        const logs = await FlightLog.find().sort({ timestamp: 1 });
        
        // Group by tail number and date
        const flights = {};
        const completeFlights = [];
        
        logs.forEach(log => {
            try {
                const dateObj = new Date(log.timestamp);
                // Ensure dateObj is valid
                if (isNaN(dateObj.getTime())) {
                    console.error('Invalid date from timestamp:', log.timestamp);
                    return; // Skip this record
                }
                
                const dateStr = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
                const key = `${log.tail_number}_${dateStr}`;
                
                if (!flights[key]) {
                    flights[key] = [];
                }
                
                flights[key].push({
                    ...log.toObject(),
                    parsedDate: dateObj // Add the parsed date for reliable sorting
                });
            } catch (err) {
                console.error('Error processing flight log:', err);
            }
        });
        
        // Process each tail number's daily flights
        Object.values(flights).forEach(tailFlights => {
            // Sort by timestamp to ensure proper sequence
            tailFlights.sort((a, b) => a.parsedDate - b.parsedDate);
            
            // Find departure/arrival pairs
            for (let i = 0; i < tailFlights.length - 1; i++) {
                const current = tailFlights[i];
                const next = tailFlights[i + 1];
                
                if (current.status === 'departing' && next.status === 'arriving') {
                    const departureTime = current.parsedDate;
                    const arrivalTime = next.parsedDate;
                    const durationMs = arrivalTime - departureTime;
                    const durationMinutes = Math.floor(durationMs / 60000);
                    const hours = Math.floor(durationMinutes / 60);
                    const minutes = durationMinutes % 60;
                    
                    completeFlights.push({
                        tailNumber: current.tail_number,
                        date: departureTime.toLocaleDateString('en-US', {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        }),
                        outboundTime: departureTime.toLocaleTimeString('en-US', {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                        }),
                        inboundTime: arrivalTime.toLocaleTimeString('en-US', {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                        }),
                        duration: `${hours}h ${minutes}m`,
                        status: "Completed",
                        departureVideo: "Not Available",
                        arrivalVideo: "Not Available",
                        departureTimestamp: departureTime,
                        arrivalTimestamp: arrivalTime
                    });
                    
                    // Skip the next flight since we've used it as an arrival
                    i++;
                } else {
                    // Handle unpaired flights
                    const flightTime = current.parsedDate;
                    completeFlights.push({
                        tailNumber: current.tail_number,
                        date: flightTime.toLocaleDateString('en-US', {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        }),
                        outboundTime: current.status === "departing" ? flightTime.toLocaleTimeString('en-US', {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                        }) : "—",
                        inboundTime: current.status === "arriving" ? flightTime.toLocaleTimeString('en-US', {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                        }) : "—",
                        duration: "—",
                        status: current.status === "departing" ? "In Progress" : "Arrived",
                        departureVideo: "Not Available",
                        arrivalVideo: "Not Available",
                        timestamp: flightTime
                    });
                }
            }
            
            // Handle the last flight if it wasn't paired
            if (tailFlights.length % 2 !== 0) {
                const lastFlight = tailFlights[tailFlights.length - 1];
                const flightTime = lastFlight.parsedDate;
                
                completeFlights.push({
                    tailNumber: lastFlight.tail_number,
                    date: flightTime.toLocaleDateString('en-US', {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }),
                    outboundTime: lastFlight.status === "departing" ? flightTime.toLocaleTimeString('en-US', {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true
                    }) : "—",
                    inboundTime: lastFlight.status === "arriving" ? flightTime.toLocaleTimeString('en-US', {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true
                    }) : "—",
                    duration: "—",
                    status: lastFlight.status === "departing" ? "In Progress" : "Arrived",
                    departureVideo: "Not Available",
                    arrivalVideo: "Not Available",
                    timestamp: flightTime
                });
            }
        });
        
        // Sort all flights by date/time descending (most recent first)
        completeFlights.sort((a, b) => {
            const dateA = a.departureTimestamp || a.timestamp;
            const dateB = b.departureTimestamp || b.timestamp;
            return dateB - dateA;
        });
        
        res.json(completeFlights);
    } catch (err) {
        console.error("Flight log error:", err);
        res.status(500).json({ message: "Error fetching flight logs", error: err.message });
    }
});

// 📊 GET FLIGHT STATS BY DAY
app.get('/flights', async (req, res) => {
  try {
      const logs = await FlightLog.find().sort({ timestamp: -1 });

      const formatted = logs.map(flight => {
          let dateObj;
          // 1. Parse string timestamp with microseconds and timezone
          if (typeof flight.timestamp === 'string') {
              // Remove microseconds beyond 3 digits (keep milliseconds)
              // Example: 2025-04-13T22:15:06.041784+05:30 -> 2025-04-13T22:15:06.041+05:30
              const clean = flight.timestamp.replace(
                  /\.(\d{3})\d*(\+|\-)/,
                  '.$1$2'
              );
              dateObj = new Date(clean);
          } else {
              dateObj = new Date(flight.timestamp);
          }

          // 2. Fallback if invalid
          if (isNaN(dateObj.getTime())) {
              return {
                  date: "Invalid Date",
                  time: "Invalid Time",
                  tailNumber: flight.tail_number,
                  outboundTime: "—",
                  inboundTime: "—",
                  duration: "—",
                  status: flight.status,
                  departureVideo: "Not Available",
                  arrivalVideo: "Not Available",
                  direction: flight.direction
              };
          }

          // 3. Format date and time for display (local time)
          const date = dateObj.toLocaleDateString('en-IN', {
              year: "numeric",
              month: "long",
              day: "numeric"
          });
          const time = dateObj.toLocaleTimeString('en-IN', {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false // or true for AM/PM
          });

          return {
              date,
              time,
              tailNumber: flight.tail_number,
              outboundTime: flight.status === "departing" ? time : "—",
              inboundTime: flight.status === "arriving" ? time : "—",
              duration: "—",
              status: flight.status,
              departureVideo: "Not Available",
              arrivalVideo: "Not Available",
              direction: flight.direction
          };
      });

      res.json(formatted);
  } catch (err) {
      console.error("Flight log error:", err);
      res.status(500).json({ message: "Error fetching flight logs", error: err.message });
  }
});


// 🚀 SERVER
app.listen(3001, () => {
    console.log("✅ Server running on http://localhost:3001");
});
