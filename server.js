require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const userRoutes = require('./routes/userRoutes');
const spaceRoutes = require('./routes/spaceRoutes');

const app = express();
app.use(bodyParser.json());

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/user/space', spaceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    // Perform cleanup tasks, if needed
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Received termination signal. Cleaning up...');
    process.exit(0);
});

process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception:', err);
    process.exit(1);
});