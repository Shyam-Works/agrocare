import { dbConnect } from '../../../lib/dbConnect';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, otp, newPassword } = req.body; // Include OTP for final verification

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' });
  }

  try {
    await dbConnect();
    
    // Final OTP check before password reset
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetToken: String(otp).trim(),
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password_hash = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}