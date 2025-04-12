import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 3000; // Use a different port if PORT environment variable is set

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let clientRecords = {}; // Store client records

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

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ogochukwugwu@gmail.com',
        pass: 'mtes jvff ruzu hktk'   // Replace with your email password
    }
});

// Configure Multer for file uploads
const upload = multer({
    dest: path.join(__dirname, 'uploads'), // Directory to store uploaded files
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.pdf') {
            return cb(new Error('Only images and PDFs are allowed'));
        }
        cb(null, true);
    }
});

// Mock function to simulate admin approval
function approvePayment(clientCode) {
    const client = clientRecords[clientCode];
    if (client) {
        client.approved = true;
        notifyClient(client, clientCode);
    }
}

// Notify client with Zoom link and unique name
function notifyClient(client, clientCode) {
    const mailOptions = {
        from: 'your-Email.com',
        to: client.email,
        subject: 'Booking Confirmed',
        text: `Dear ${client.name},

        Your booking with ${client.professional} has been confirmed. Your unique client code is ${clientCode}.
        Zoom Link: ${zoomLinks[client.professional]}
        
        Thank you for choosing our service!
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email to client:', error);
        } else {
            console.log('Client email sent:', info.response);
        }
    });
}

// Endpoint to confirm payment
app.post('/api/confirm-payment', (req, res) => {
    const { professional, clientName, clientEmail, amount, paymentMethod } = req.body;

    const clientCode = uuidv4();
    clientRecords[clientCode] = { name: clientName, email: clientEmail, professional, amount, paymentMethod, approved: false };

    // Notify admin
    const adminMailOptions = {
        from: 'Your-Email.com',
        to: 'ogochukwugwu@yahoo.com',
        subject: 'New Payment Received',
        text: `A new payment has been received from ${clientName} (${clientEmail}) for ${professional}.
        Amount: $${amount}
        Payment Method: ${paymentMethod}
        
        Please approve the payment to confirm the booking.
        Client Code: ${clientCode}`
    };

    transporter.sendMail(adminMailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email to admin:', error);
            res.status(500).json({ message: 'Error sending email to admin' });
        } else {
            console.log('Admin email sent:', info.response);
            res.json({ message: 'Payment successful, your booking is confirmed!', clientCode, zoomLink: zoomLinks[professional] });
        }
    });
});

// Endpoint to upload proof of payment
app.post('/api/upload-proof', upload.single('proof'), (req, res) => {
    const { clientCode } = req.body;

    if (!clientRecords[clientCode]) {
        return res.status(404).json({ message: 'Client record not found.' });
    }

    const proofPath = req.file.path;
    clientRecords[clientCode].proofPath = proofPath;

    // Notify admin with proof of payment link
    const adminMailOptions = {
        from: 'Your-Email.com',
        to: 'ogochukwugwu@yahoo.com',
        subject: 'Proof of Payment Uploaded',
        text: `Proof of payment has been uploaded for client code: ${clientCode}. Please review and approve the payment.

        Proof of Payment Link: http://localhost:${port}/uploads/${req.file.filename}`
    };

    transporter.sendMail(adminMailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email to admin:', error);
        } else {
            console.log('Admin email sent:', info.response);
        }
    });

    res.json({ message: 'Proof of payment uploaded successfully.' });
});

// Endpoint to serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Endpoint to approve payment
app.post('/api/approve-payment', (req, res) => {
    const { clientCode } = req.body;

    if (clientRecords[clientCode]) {
        approvePayment(clientCode);
        res.json({ message: 'Payment approved and client notified.' });
    } else {
        res.status(404).json({ message: 'Client record not found.' });
    }
});

// Endpoint to get client records for admin view
app.get('/api/client-records', (req, res) => {
    res.json(clientRecords);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.post('/generate-code', (req, res) => {
    const code = generateCode();
    const expirationTime = Date.now() + 5 * 60 * 1000;  // 5 minutes expiration time
    codes[code] = expirationTime;
    
    console.log(`Generated code: ${code}`);  // You can see the generated code in the console

    res.json({ success: true });
});


// Start the server with error handling
app.listen(port, (err) => {
    if (err) {
        console.error('Failed to start server:', err);
    } else {
        console.log(`Server running at http://localhost:${port}/`);
    }
});
