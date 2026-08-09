const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// In-memory OTP store (for simplicity; use Redis or DB table in production)
const otpStore = new Map();

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via Brevo transactional email
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store OTP
  otpStore.set(email.toLowerCase(), { otp, expiresAt, attempts: 0 });

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: "Pastor's Diary", email: 'noreply@pastorsdiary.app' },
        to: [{ email: email }],
        subject: `Your Pastor's Diary Login Code: ${otp}`,
        htmlContent: `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="width: 56px; height: 56px; border-radius: 16px; background: #000000; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <span style="font-size: 24px; color: white;">📖</span>
              </div>
              <h1 style="font-size: 1.5rem; font-weight: 700; color: #000000; margin: 0;">Pastor's Diary</h1>
              <p style="color: #888888; font-size: 0.875rem; margin: 4px 0 0;">Shepherd's Library</p>
            </div>
            <div style="background: #f5f5f5; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
              <p style="color: #555555; font-size: 0.875rem; margin: 0 0 16px;">Your one-time login code is:</p>
              <div style="font-size: 2.5rem; font-weight: 800; letter-spacing: 12px; color: #000000; font-family: monospace;">${otp}</div>
              <p style="color: #999999; font-size: 0.75rem; margin: 16px 0 0;">This code expires in 10 minutes.</p>
            </div>
            <p style="color: #aaaaaa; font-size: 0.75rem; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
          </div>
        `
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Brevo API error:', errorBody);
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ error: 'Failed to send OTP email' });
  }
});

// Verify OTP and sign in
router.post('/verify-otp', async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  const stored = otpStore.get(email.toLowerCase());

  if (!stored) {
    return res.status(400).json({ error: 'No OTP found. Please request a new code.' });
  }

  // Check expiration
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
  }

  // Check attempts (max 5)
  if (stored.attempts >= 5) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ error: 'Too many attempts. Please request a new code.' });
  }

  // Verify
  if (stored.otp !== otp) {
    stored.attempts++;
    return res.status(400).json({ error: 'Invalid code. Please try again.' });
  }

  // OTP is valid! Clean up
  otpStore.delete(email.toLowerCase());

  try {
    // Check if user exists in Supabase
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    let user = null;
    if (!listError && existingUsers?.users) {
      user = existingUsers.users.find(u => u.email === email.toLowerCase());
    }

    if (!user) {
      // Create user in Supabase with the password provided during sign up (or generate a random one if not provided)
      const userPassword = password || require('crypto').randomBytes(32).toString('hex');
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email.toLowerCase(),
        password: userPassword,
        email_confirm: true
      });
      if (createError) {
        console.error('Failed to create user:', createError);
        return res.status(500).json({ error: createError.message || 'Failed to create account' });
      }
      user = newUser.user;
    } else if (password) {
      // If user exists and password was supplied, update their password
      await supabase.auth.admin.updateUserById(user.id, { password, email_confirm: true });
    }

    // Generate a session for the user
    const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email.toLowerCase()
    });

    // Since we can't directly create a session with the anon key, 
    // we return the user info and let the frontend handle sign-in
    res.json({ 
      success: true, 
      message: 'OTP verified successfully',
      user: { id: user.id, email: user.email }
    });
  } catch (err) {
    console.error('Error during OTP verification:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;
