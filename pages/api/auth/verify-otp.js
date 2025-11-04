import { dbConnect } from '../../../lib/dbConnect';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    await dbConnect();
    
    // Find user with valid reset token
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetToken: { $exists: true, $ne: null }
    });

    if (!user || !user.resetToken) {
      return res.status(400).json({ message: 'No reset request found' });
    }

    // Check expiry with buffer for timezone differences
    const now = Date.now();
    const expiryTime = new Date(user.resetTokenExpiry).getTime();
    
    if (expiryTime < now) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Compare OTP strings directly
    const storedOTP = String(user.resetToken).trim();
    const providedOTP = String(otp).trim();
    
    if (storedOTP !== providedOTP) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    res.status(200).json({ 
      message: 'OTP verified successfully', 
      verified: true 
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}