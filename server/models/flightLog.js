const mongoose = require('mongoose');

const flightLogSchema = new mongoose.Schema({
    tail_number: { type: String, required: true },
    direction: { type: String, required: true },
    status: { type: String, required: true },
    timestamp: { type: Date, required: true }
}, { collection: 'flight_log' }); // Explicitly set the collection name

module.exports = (connection) => {
    return connection.model('FlightLog', flightLogSchema);
};
