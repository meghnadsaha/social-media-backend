// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Register Route with Validation
router.post('/register',
    // Validation rules
    [
        body('username').isString().notEmpty().withMessage('Username is required'),
        body('email').isEmail().withMessage('Invalid email format'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        try {
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 8);

            // Create a new user
            const user = new User({
                username,
                email,
                password: hashedPassword,
                // friendRequests: []  // Initialize as an empty array
            });

            await user.save();

            // Send success response
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            // Handle errors
            console.log(error);
            if (error.code === 11000) { // Duplicate key error
                const field = Object.keys(error.keyPattern)[0]; // Determine which field caused the error
                if (field === 'email') {
                    return res.status(400).json({ error: 'Email is already registered' });
                } else if (field === 'friendRequests.requestId') {
                    return res.status(400).json({ error: 'Duplicate requestId detected' });
                } else {
                    return res.status(400).json({ error: 'Duplicate key error' });
                }
            }
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Unable to login');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Unable to login');
        }
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');
        res.send({ token });
    } catch (error) {
        res.status(400).send({ error: 'Unable to login' });
    }
});

module.exports = router;
