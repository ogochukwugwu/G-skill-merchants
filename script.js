const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', // Replace with your email
        pass: 'your-email-password'   // Replace with your email password
    }
});

app.post('/confirm-bank-transfer', upload.single('proof'), (req, res) => {
    const { doctor, name, email, amount } = req.body;
    const proofPath = req.file.path;

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: 'your-email@gmail.com', // Replace with your email
        subject: 'Manual Bank Transfer Confirmation',
        text: `Name: ${name}\nEmail: ${email}\nDoctor: ${doctor}\nAmount: ${amount}`,
        attachments: [
            {
                filename: req.file.originalname,
                path: proofPath
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Failed to send email');
        }

        // Append to booking log
        const bookingLog = {
            name,
            doctor,
            link: 'your-omm-link' // Replace with actual OMM link
        };

        fs.appendFile(
            'booking-log.json',
            JSON.stringify(bookingLog) + '\n',
            (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Failed to log booking');
                }

                res.send('Payment confirmation sent!');
            }
        );
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});