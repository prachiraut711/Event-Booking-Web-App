const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail, formatEmailErrorMessage } = require('../utils/email');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        if (typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Extra protection: prevent public registration on admin email
        if (normalizedEmail === 'prachiraut711@gmail.com') {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Reject registration for any already-registered email
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Always enforce role 'user'; never accept role from client input
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: 'user',
            isVerified: true
        });

        const token = generateToken(user.id, user.role);

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
            message: 'Account created successfully!'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const validOTP = await OTP.findOne({ email: normalizedEmail, otp: otp.trim(), action: 'account_verification' });

        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP. Please try again or request a new code.' });
        }

        const user = await User.findOneAndUpdate({ email: normalizedEmail }, { isVerified: true }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await OTP.deleteOne({ _id: validOTP._id });

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role),
            message: 'Account verified successfully'
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'Server error during OTP verification' });
    }
};

// POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
    try {
        const { email, action = 'account_verification' } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Rate limiting: check if an OTP was sent in the last 60 seconds
        const existingOTP = await OTP.findOne({ email: normalizedEmail, action });
        if (existingOTP) {
            const timeDiffSeconds = Math.floor((Date.now() - new Date(existingOTP.createdAt).getTime()) / 1000);
            if (timeDiffSeconds < 60) {
                const waitTime = 60 - timeDiffSeconds;
                return res.status(429).json({
                    message: `Please wait ${waitTime} second${waitTime > 1 ? 's' : ''} before requesting another OTP`,
                    retryAfter: waitTime
                });
            }
        }

        const otp = generateOTP();
        await OTP.findOneAndDelete({ email: normalizedEmail, action });
        await OTP.create({ email: normalizedEmail, otp, action });

        if (process.env.NODE_ENV === 'development') {
            console.log(`🔑 [DEV ONLY] Resent OTP for ${normalizedEmail} (${action}): ${otp}`);
        }

        try {
            await sendOTPEmail(normalizedEmail, otp, action);
            return res.json({ message: 'A new verification code has been sent to your email.' });
        } catch (emailErr) {
            console.error('Email delivery error on resend OTP:', emailErr.message);
            const userFriendlyMessage = formatEmailErrorMessage(emailErr);
            return res.status(502).json({
                message: userFriendlyMessage,
                emailDeliveryFailed: true
            });
        }
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: 'Server error while resending OTP' });
    }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error retrieving user profile' });
    }
};