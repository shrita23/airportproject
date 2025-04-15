const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userModel = require('./models/user.js');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/user", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    userModel.findOne({ email, password })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    return res.json({ message: "Success" });
                }
                else{
                    return res.status(401).json({ message: "Invalid password" });
                }
            }
            else {
                return res.status(404).json({ message: "User not found" });
            }
        })
        .catch(err => res.status(500).json(err));
}),
app.post('/signup', (req, res) => {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    userModel.create(req.body)
        .then(users => res.json(users))
        .catch(err => res.status(500).json(err));
}),

app.listen(3001, () => {
    console.log("Server is running on port 3001");
})
