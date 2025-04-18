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

// ✈️ GET FLIGHT LOGS WITH DURATIONS - IMPROVED VERSION
// ✈️ GET FLIGHT LOGS WITH DURATIONS - IMPROVED VERSION
app.get('/flights-with-durations', async (req, res) => {
    try {
        const logs = await FlightLog.find().sort({ timestamp: 1 });
        console.log('Fetched logs count:', logs.length); // Debug log
        
        const flights = {};
        const completeFlights = [];
        
        logs.forEach(log => {
            try {
                console.log('Processing log:', log); // Log the full document
                let dateObj;
                // Handle timestamp safely
                if (!log.timestamp || log.timestamp === 'undefined') {
                    console.warn('Missing or undefined timestamp for log:', log);
                    dateObj = new Date(); // Fallback to current date
                } else {
                    dateObj = new Date(log.timestamp);
                    if (isNaN(dateObj.getTime())) {
                        console.warn('Invalid timestamp format, falling back. Raw value:', log.timestamp, 'Log:', log);
                        dateObj = new Date(); // Fallback to current date
                    }
                }
                
                const dateStr = dateObj.toISOString().split('T')[0];
                const key = `${log.tail_number}_${dateStr}`;
                
                if (!flights[key]) {
                    flights[key] = [];
                }
                
                flights[key].push({
                    ...log.toObject(),
                    parsedDate: dateObj
                });
            } catch (err) {
                console.error('Error processing flight log:', err);
            }
        });
        
        Object.values(flights).forEach(tailFlights => {
            tailFlights.sort((a, b) => a.parsedDate - b.parsedDate);
            
            for (let i = 0; i < tailFlights.length; i++) {
                const current = tailFlights[i];
                let next = tailFlights[i + 1];
                
                if (current.status === 'departing' && next && next.status === 'arriving') {
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
                        departureVideo: "https://dummyvideo1.com",
                        arrivalVideo: "https://dummyvideo2.com"
                    });
                    i++; // Skip the next entry as it's paired
                } else if (current.status === 'departing') {
                    const flightTime = current.parsedDate;
                    completeFlights.push({
                        tailNumber: current.tail_number,
                        date: flightTime.toLocaleDateString('en-US', {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        }),
                        outboundTime: flightTime.toLocaleTimeString('en-US', {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                        }),
                        inboundTime: "—",
                        duration: "—",
                        status: "In Progress",
                        departureVideo: "https://dummyvideo1.com",
                        arrivalVideo: "Not Available"
                    });
                } else if (current.status === 'arriving' && !tailFlights[i - 1]?.status === 'departing') {
                    const flightTime = current.parsedDate;
                    completeFlights.push({
                        tailNumber: current.tail_number,
                        date: flightTime.toLocaleDateString('en-US', {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        }),
                        outboundTime: "—",
                        inboundTime: flightTime.toLocaleTimeString('en-US', {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                        }),
                        duration: "—",
                        status: "Arrived",
                        departureVideo: "Not Available",
                        arrivalVideo: "https://dummyvideo2.com"
                    });
                }
            }
        });
        
        completeFlights.sort((a, b) => new Date(b.date + " " + b.outboundTime) - new Date(a.date + " " + a.outboundTime));
        console.log('Processed flights count:', completeFlights.length); // Debug log
        res.json(completeFlights);
    } catch (err) {
        console.error("Flight log error:", err);
        res.status(500).json({ message: "Error fetching flight logs", error: err.message });
    }
});
app.get('/flight-costs', async (req, res) => {
    console.log('Received request for /flight-costs'); // Add this line
    try {
        const logs = await FlightLog.find().sort({ timestamp: -1 });
        console.log('Fetched logs count:', logs.length);
        if (logs.length === 0) {
            console.log('Warning: No logs found in FlightLog collection');
        }

        const flights = {};
        logs.forEach(log => {
            const dateObj = new Date(log.timestamp);
            const dateStr = dateObj.toISOString().split('T')[0];
            const key = `${log.tail_number}_${dateStr}`;

            if (!flights[key]) {
                flights[key] = [];
            }
            flights[key].push({
                ...log.toObject(),
                parsedDate: dateObj
            });
        });

        const completeFlights = [];
        Object.values(flights).forEach(tailFlights => {
            tailFlights.sort((a, b) => a.parsedDate - b.parsedDate);

            for (let i = 0; i < tailFlights.length; i++) {
                const current = tailFlights[i];
                let next = tailFlights[i + 1];

                if (current.status === 'departing' && next && next.status === 'arriving') {
                    const departureTime = current.parsedDate;
                    const arrivalTime = next.parsedDate;
                    const durationMs = arrivalTime - departureTime;
                    const durationMinutes = Math.floor(durationMs / 60000);
                    const flightHours = durationMinutes / 60;
                    const totalCost = flightHours * 8500;

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
                        flightHours: flightHours.toFixed(1),
                        totalCost: Math.round(totalCost),
                        school: "Sky Aviation",
                        status: "Completed"
                    });
                    i++;
                } else if (current.status === 'departing') {
                    const flightTime = current.parsedDate;
                    completeFlights.push({
                        tailNumber: current.tail_number,
                        date: flightTime.toLocaleDateString('en-US', {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        }),
                        outboundTime: flightTime.toLocaleTimeString('en-US', {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                        }),
                        inboundTime: "—",
                        flightHours: 0,
                        totalCost: 0,
                        school: "Sky Aviation",
                        status: "In Progress"
                    });
                }
            }
        });

        completeFlights.sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log('Processed flights count:', completeFlights.length);
        res.json(completeFlights.length > 0 ? completeFlights : { message: "No complete flight data available" });
    } catch (err) {
        console.error("Flight costs error:", err);
        res.status(500).json({ message: "Error fetching flight costs", error: err.message });
    }
});
        
// 🚀 SERVER
app.listen(3001, () => {
    console.log("✅ Server running on http://localhost:3001");
});