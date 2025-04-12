import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Enhanced code storage with request tracking
const verificationCodes = {};
const pendingRequests = new Set(); // Track in-progress requests

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate a random 6-digit code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Endpoint to send the verification code
app.post('/api/send-code', async (req, res) => {
  const { email, name, personNumber } = req.body;

  // Check if request is already in progress for this email
  if (pendingRequests.has(email)) {
    return res.status(429).json({ error: 'Request already in progress' });
  }

  try {
    // Mark this request as pending
    pendingRequests.add(email);

    // Check if a valid code already exists
    if (verificationCodes[email] && 
        (Date.now() - verificationCodes[email].timestamp) < 60000) { // 1 minute cooldown
      return res.json({ 
        success: true, 
        message: 'Code already sent recently',
        code: verificationCodes[email].code // Only for debugging, remove in production
      });
    }

    const code = generateCode();
    verificationCodes[email] = { 
      code, 
      timestamp: Date.now(),
      personNumber 
    };

    await transporter.sendMail({
      to: email,
      subject: 'Your Verification Code',
      html: `<p>Hello ${name},</p>
             <p>Your verification code for Person ${personNumber} is: <strong>${code}</strong></p>
             <p>This code will expire in 1 hour.</p>`
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  } finally {
    // Remove from pending requests
    pendingRequests.delete(email);
  }
});

// Endpoint to verify the code
app.post('/api/verify-code', (req, res) => {
  const { email, code, personNumber } = req.body;

  if (!verificationCodes[email]) {
    return res.status(400).json({ error: 'No code found for this email' });
  }

  const { code: storedCode, timestamp, personNumber: storedPersonNumber } = verificationCodes[email];

  // Verify all conditions
  if (storedCode !== code) {
    return res.status(400).json({ error: 'Invalid code' });
  }

  if (storedPersonNumber !== personNumber) {
    return res.status(400).json({ error: 'Code not valid for this person' });
  }

  const timeElapsed = (Date.now() - timestamp) / 1000;
  if (timeElapsed > 3600) { // 1 hour expiration
    return res.status(400).json({ error: 'Code has expired' });
  }

  // Code is valid - remove it to prevent reuse
  delete verificationCodes[email];
  res.json({ success: true });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});