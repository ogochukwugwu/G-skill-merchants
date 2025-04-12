import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ======================
// Combined Data Stores
// ======================
const availability = {};
const bookings = [];
const verificationCodes = {};
const zoomLinks = {
    "DrSmith": "https://zoom.us/j/1111111111",
    "DrSam": "https://zoom.us/j/2222222222",
    "DrJones": "https://zoom.us/j/3333333333",
    "Anne": "https://zoom.us/j/4444444444",
    "CoachMark": "https://zoom.us/j/5555555555",
    "DrJohn": "https://zoom.us/j/6666666666",
    "DrAdams": "https://zoom.us/j/7777777777",
    "Williams": "https://zoom.us/j/8888888888"
};

// ======================
// Email Configuration
// ======================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ======================
// Core Functions
// ======================
function generateClientCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "CL-";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function generateBookingId() {
    return 'BK-' + Date.now().toString(36).toUpperCase();
}

// ======================
// Unified API Endpoints
// ======================

// Root URL
app.get('/', (req, res) => {
    res.send('Welcome to the Appointment System API');
});

// [1] Availability Management
app.post('/api/set-availability', (req, res) => {
    const { professional, date, time } = req.body;
    
    if (!professional || !date || !time) {
        return res.status(400).json({ error: "Professional, date and time are required" });
    }

    const dateTime = `${date} ${time}`;
    
    if (!availability[professional]) {
        availability[professional] = [];
    }

    if (!availability[professional].includes(dateTime)) {
        availability[professional].push(dateTime);
    }

    res.json({ 
        success: true, 
        message: "Availability updated successfully",
        availability: availability[professional]
    });
});

app.get('/api/availability/:professional', (req, res) => {
    const professional = req.params.professional;
    res.json({
        availability: availability[professional] || []
    });
});

// [2] Verification System
app.post('/api/send-verification', async (req, res) => {
    const { email, professional } = req.body;
    const code = generateClientCode();
    
    verificationCodes[email] = {
        code,
        professional,
        expires: Date.now() + 3600000 // 1 hour expiration
    };
    
    try {
        await transporter.sendMail({
            to: email,
            subject: 'Your Verification Code',
            html: `Your code is: <strong>${code}</strong>`
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to send email" });
    }
});

// [3] Booking System
app.post('/api/book-appointment', async (req, res) => {
    const { code, email, name, professional, date, time, paymentMethod } = req.body;
    
    // Verify code matches
    if (!verificationCodes[email] || verificationCodes[email].code !== code) {
        return res.status(400).json({ error: "Invalid verification code" });
    }
    
    // Check availability
    const dateTime = `${date} ${time}`;
    if (!availability[professional] || !availability[professional].includes(dateTime)) {
        return res.status(400).json({ error: "Time slot no longer available" });
    }

    // Create booking
    const booking = {
        bookingId: generateBookingId(),
        clientCode: code,
        clientName: name,
        clientEmail: email,
        professional,
        date,
        time,
        paymentMethod,
        zoomLink: zoomLinks[professional],
        bookedAt: new Date()
    };
    
    bookings.push(booking);
    
    // Remove from availability
    availability[professional] = availability[professional].filter(slot => slot !== dateTime);
    
    // Send confirmation
    try {
        await transporter.sendMail({
            to: email,
            subject: 'Booking Confirmed',
            html: `
                <h2>Booking Confirmed</h2>
                <p>Your appointment with ${professional} on ${date} at ${time} is confirmed!</p>
                <p>Zoom Link: <a href="${zoomLinks[professional]}">Join Meeting</a></p>
                <p>Booking ID: ${booking.bookingId}</p>
            `
        });
        
        res.json({ 
            success: true, 
            booking: {
                id: booking.bookingId,
                professional,
                date,
                time,
                zoomLink: zoomLinks[professional]
            }
        });
    } catch (error) {
        console.error("Confirmation email failed:", error);
        res.status(500).json({ error: "Booking created but email failed" });
    }
});

// [4] Admin Endpoints
app.get('/api/admin/bookings', (req, res) => {
    res.json({ 
        bookings: bookings.map(b => ({
            id: b.bookingId,
            clientCode: b.clientCode,
            professional: b.professional,
            date: b.date,
            time: b.time,
            paymentMethod: b.paymentMethod,
            bookedAt: b.bookedAt
        }))
    });
});

app.get('/api/admin/availability', (req, res) => {
    res.json({ availability });
});

// ======================
// Server Start
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Combined backend running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log('- GET /');
    console.log('- POST /api/set-availability');
    console.log('- GET /api/availability/:professional');
    console.log('- POST /api/send-verification');
    console.log('- POST /api/book-appointment');
    console.log('- GET /api/admin/bookings');
    console.log('- GET /api/admin/availability');
});