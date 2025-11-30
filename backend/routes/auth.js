const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate employee ID
const generateEmployeeId = async () => {
  const result = await pool.query('SELECT COUNT(*) FROM users');
  const count = parseInt(result.rows[0].count);
  return `EMP${String(count + 1).padStart(3, '0')}`;
};

// Register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['employee', 'manager']).withMessage('Role must be employee or manager'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, department } = req.body;

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate employee ID
    const employeeId = await generateEmployeeId();

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, employee_id, department) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, employee_id, department',
      [name, email, hashedPassword, role, employeeId, department || null]
    );

    const user = result.rows[0];

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employee_id,
        department: user.department,
        dateOfJoining: user.date_of_joining,
        contactNumber: user.contact_number,
        address: user.address,
        workLocation: user.work_location,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employee_id,
        department: user.department,
        dateOfJoining: user.date_of_joining,
        contactNumber: user.contact_number,
        address: user.address,
        workLocation: user.work_location,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, email, role, employee_id, department, date_of_joining, contact_number, address, work_location FROM users WHERE id = $1',
    [req.user.id]
  );
  
  const user = result.rows[0];
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employee_id,
      department: user.department,
      dateOfJoining: user.date_of_joining,
      contactNumber: user.contact_number,
      address: user.address,
      workLocation: user.work_location,
    },
  });
});

// Update profile
router.put('/profile', auth, [
  body('name').optional().trim().notEmpty(),
  body('contactNumber').optional(),
  body('address').optional(),
  body('workLocation').optional(),
  body('dateOfJoining').optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, contactNumber, address, workLocation, dateOfJoining } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (contactNumber !== undefined) {
      updates.push(`contact_number = $${paramCount}`);
      values.push(contactNumber || null);
      paramCount++;
    }
    if (address !== undefined) {
      updates.push(`address = $${paramCount}`);
      values.push(address || null);
      paramCount++;
    }
    if (workLocation !== undefined) {
      updates.push(`work_location = $${paramCount}`);
      values.push(workLocation || null);
      paramCount++;
    }
    if (dateOfJoining !== undefined) {
      updates.push(`date_of_joining = $${paramCount}`);
      values.push(dateOfJoining || null);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(req.user.id);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email, role, employee_id, department, date_of_joining, contact_number, address, work_location`,
      values
    );

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employee_id,
        department: user.department,
        dateOfJoining: user.date_of_joining,
        contactNumber: user.contact_number,
        address: user.address,
        workLocation: user.work_location,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

