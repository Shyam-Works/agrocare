// pages/api/auth/forgot-password.js

// TO-DO --- need to add security step in email also resent OTP. 
import {dbConnect} from '../../../lib/dbConnect';
import User from '../../../models/User';
import nodemailer from 'nodemailer';
import path from 'path';

// This will correctly resolve to your project root, then to public/leafy.jpg
const imagePath = path.join(process.cwd(), 'public', 'leafy.jpg');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    await dbConnect();
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      return res.status(200).json({ message: 'If the email exists, an OTP has been sent' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000); // 4-digit OTP
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetToken = otp.toString();
    user.resetTokenExpiry = otpExpiry;
    await user.save();

await transporter.sendMail({
  from: process.env.GMAIL_USER,
  to: email,
  subject: '🌱 Your Password Reset Code from Leafy - AgroCare',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f0f9f4;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: linear-gradient(135deg, #ffffff 0%, #f8fffe 100%);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(34, 139, 34, 0.15);
        }
        .header {
          background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
          padding: 30px 20px;
          text-align: center;
        }
        .leafy-image {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 5px solid white;
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          margin-bottom: 15px;
        }
        .greeting {
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin: 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .content {
          padding: 40px 30px;
          text-align: center;
          color: black
        }
        .message {
          color: #1e293b;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .otp-box {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 3px dashed #22c55e;
          border-radius: 15px;
          padding: 25px;
          margin: 30px 0;
        }
        .otp-label {
          color: #059669;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }
        .otp-code {
          font-size: 36px;
          font-weight: bold;
          color: #047857;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
          margin: 10px 0;
        }
        .timer {
          color: #f59e0b;
          font-size: 14px;
          font-weight: 600;
          margin-top: 10px;
        }
        .warning {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: left;
        }
        .warning-text {
          color: #92400e;
          font-size: 14px;
          margin: 0;
        }
        .footer {
          background: #f8fafc;
          padding: 25px;
          text-align: center;
          border-top: 2px solid #e2e8f0;
        }
        .footer-text {
          color: #64748b;
          font-size: 13px;
          line-height: 1.6;
          margin: 5px 0;
        }
        .brand {
          color: #22c55e;
          font-weight: bold;
        }
        .leaf-icon {
          display: inline-block;
          margin: 0 5px;
        }
          .message{
          color: #1e293b;
          }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="cid:leafyImage" alt="Leafy" class="leafy-image" />
          <h1 class="greeting">🌿 Hi! I'm Leafy from AgroCare 🌿</h1>
        </div>
        
        <div class="content">
          
          
          <div class="otp-box">
            <div class="otp-label">Your Verification Code</div>
            <div class="otp-code">${otp}</div>
            <div class="timer">⏰ This code expires in 10 minutes</div>
          </div>
          
          <div class="warning">
            <p class="warning-text">
              <strong>🛡️ Security Reminder:</strong><br>
              Please don't share this code with anyone! Not even with me, Leafy. 
              Keep your account safe and secure. 🌱
            </p>
          </div>
          
         
        </div>
        
        <div class="footer">
          <p class="footer-text">
            <span class="leaf-icon">🌱</span>
            <strong class="brand">AgroCare</strong> - Growing together, protecting together
            <span class="leaf-icon">🌱</span>
          </p>
          <p class="footer-text">
            This is an automated message from your friendly plant companion, Leafy!
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
  attachments: [{
    filename: 'leafy.jpg',
    path: imagePath,
    cid: 'leafyImage'
  }]
});

    res.status(200).json({ message: 'OTP sent', email });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

