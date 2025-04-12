import express from 'express';

const app = express();
const port = process.env.PORT || 3000; // Define and initialize the port variable

// Simple route to check if the server is running
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start the server with error handling
app.listen(port, (err) => {
    if (err) {
        console.error('Failed to start server:', err);
    } else {
        console.log(`Server running at http://localhost:${port}/`);
    }
});