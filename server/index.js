const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import model factories
const createUserModel = require('./models/user');
const createFlightLogModel = require('./models/flightLog');

const app = express();
app.use(express.json());
app.use(cors());

// 🔌 Connections
const userConnection = mongoose.createConnection("mongodb://127.0.0.1:27017/user", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const flightConnection = mongoose.createConnection("mongodb+srv://<username>:<password>@cluster0.4glcoq0.mongodb.net/flight_database", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// 🧠 Models
const User = createUserModel(userConnection);
const FlightLog = createFlightLogModel(flightConnection);

// 🛂 User routes
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email, password })
        .then(user => {
            if (user) {
                return res.json({ message: "Success" });
            } else {
                return res.status(404).json({ message: "User not found" });
            }
        })
        .catch(err => res.status(500).json(err));
});

app.post('/signup', (req, res) => {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    User.create(req.body)
        .then(users => res.json(users))
        .catch(err => res.status(500).json(err));
});

// ✈️ Flight log route
app.get('/flights', (req, res) => {
    FlightLog.find()
        .then(flights => res.json(flights))
        .catch(err => res.status(500).json(err));
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
