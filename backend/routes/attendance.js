const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { pool } = require('../config/database');
const { auth, isManager } = require('../middleware/auth');

const router = express.Router();

// Helper function to calculate hours
const calculateHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;
  const diff = new Date(checkOut) - new Date(checkIn);
  return (diff / (1000 * 60 * 60)).toFixed(2);
};

// Helper function to determine status on check-in (10am expected time)
const determineStatus = (checkInTime, expectedTime = '10:00:00') => {
  if (!checkInTime) return 'absent';
  const checkIn = new Date(checkInTime);
  const expected = new Date(checkIn);
  const [hours, minutes] = expectedTime.split(':');
  expected.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  if (checkIn > expected) {
    return 'late'; // Late if after 10am
  }
  return 'present';
};

// Helper function to determine if full day or half day based on checkout time
const determineDayStatus = (checkOutTime) => {
  if (!checkOutTime) return 'half-day';
  const checkOut = new Date(checkOutTime);
  const cutoff = new Date(checkOut);
  cutoff.setHours(14, 0, 0, 0); // 2pm cutoff
  
  if (checkOut >= cutoff) {
    return 'full-day'; // Full day if checkout after 2pm
  }
  return 'half-day'; // Half day if checkout before 2pm
};

// Check In
router.post('/checkin', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const checkInTime = new Date();

    // Check if already checked in today
    const existing = await pool.query(
      'SELECT * FROM attendance WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    if (existing.rows.length > 0 && existing.rows[0].check_in_time) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    // Determine status: present or late (based on 10am)
    let status = determineStatus(checkInTime);
    // If late, we still mark as present but status will be 'late'
    // This way it shows in both present and late counts

    if (existing.rows.length > 0) {
      // Update existing record
      await pool.query(
        'UPDATE attendance SET check_in_time = $1, status = $2 WHERE user_id = $3 AND date = $4',
        [checkInTime, status, userId, today]
      );
    } else {
      // Create new record - mark as present when checking in
      await pool.query(
        'INSERT INTO attendance (user_id, date, check_in_time, status) VALUES ($1, $2, $3, $4)',
        [userId, today, checkInTime, status]
      );
    }

    const result = await pool.query(
      'SELECT * FROM attendance WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    res.json({ message: 'Checked in successfully', attendance: result.rows[0] });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check Out
router.post('/checkout', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const checkOutTime = new Date();

    // Get today's attendance
    const result = await pool.query(
      'SELECT * FROM attendance WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    if (result.rows.length === 0 || !result.rows[0].check_in_time) {
      return res.status(400).json({ message: 'Please check in first' });
    }

    if (result.rows[0].check_out_time) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const checkInTime = result.rows[0].check_in_time;
    const totalHours = calculateHours(checkInTime, checkOutTime);
    let status = result.rows[0].status; // Keep original status (present or late)

    // Determine if full day or half day based on checkout time (2pm cutoff)
    const dayStatus = determineDayStatus(checkOutTime);
    if (dayStatus === 'half-day') {
      status = 'half-day';
    }
    // If full day, keep the original status (present or late)

    await pool.query(
      'UPDATE attendance SET check_out_time = $1, total_hours = $2, status = $3 WHERE user_id = $4 AND date = $5',
      [checkOutTime, totalHours, status, userId, today]
    );

    const updated = await pool.query(
      'SELECT * FROM attendance WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    res.json({ message: 'Checked out successfully', attendance: updated.rows[0] });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// My attendance history
router.get('/my-history', auth, [
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('year').optional().isInt({ min: 2000, max: 3000 }),
], async (req, res) => {
  try {
    const userId = req.user.id;
    const month = req.query.month || new Date().getMonth() + 1;
    const year = req.query.year || new Date().getFullYear();

    const result = await pool.query(
      `SELECT * FROM attendance 
       WHERE user_id = $1 
       AND EXTRACT(MONTH FROM date) = $2 
       AND EXTRACT(YEAR FROM date) = $3 
       ORDER BY date DESC`,
      [userId, month, year]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// My monthly summary
router.get('/my-summary', auth, [
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('year').optional().isInt({ min: 2000, max: 3000 }),
], async (req, res) => {
  try {
    const userId = req.user.id;
    const month = req.query.month || new Date().getMonth() + 1;
    const year = req.query.year || new Date().getFullYear();

    const result = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'present' OR status = 'late') as present,
        COUNT(*) FILTER (WHERE status = 'absent') as absent,
        COUNT(*) FILTER (WHERE status = 'late') as late,
        COUNT(*) FILTER (WHERE status = 'half-day') as half_day,
        COALESCE(SUM(total_hours), 0) as total_hours
       FROM attendance 
       WHERE user_id = $1 
       AND EXTRACT(MONTH FROM date) = $2 
       AND EXTRACT(YEAR FROM date) = $3`,
      [userId, month, year]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Today's status
router.get('/today', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const result = await pool.query(
      'SELECT * FROM attendance WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    if (result.rows.length === 0) {
      return res.json({ checkedIn: false, checkedOut: false, attendance: null });
    }

    const attendance = result.rows[0];
    res.json({
      checkedIn: !!attendance.check_in_time,
      checkedOut: !!attendance.check_out_time,
      attendance,
    });
  } catch (error) {
    console.error('Today status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// All employees attendance (Manager only)
router.get('/all', auth, isManager, [
  query('employeeId').optional(),
  query('startDate').optional(),
  query('endDate').optional(),
  query('status').optional(),
  query('department').optional(),
  query('search').optional(),
], async (req, res) => {
  try {
    let query = `
      SELECT a.*, u.name, u.email, u.employee_id, u.department 
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (req.query.employeeId) {
      query += ` AND u.employee_id = $${paramCount}`;
      params.push(req.query.employeeId);
      paramCount++;
    }

    if (req.query.startDate) {
      query += ` AND a.date >= $${paramCount}`;
      params.push(req.query.startDate);
      paramCount++;
    }

    if (req.query.endDate) {
      query += ` AND a.date <= $${paramCount}`;
      params.push(req.query.endDate);
      paramCount++;
    }

    if (req.query.status) {
      query += ` AND a.status = $${paramCount}`;
      params.push(req.query.status);
      paramCount++;
    }

    if (req.query.department) {
      query += ` AND u.department = $${paramCount}`;
      params.push(req.query.department);
      paramCount++;
    }

    if (req.query.search) {
      const searchTerm = `%${req.query.search}%`;
      query += ` AND (u.name ILIKE $${paramCount} OR u.employee_id ILIKE $${paramCount + 1} OR u.email ILIKE $${paramCount + 2})`;
      params.push(searchTerm);
      params.push(searchTerm);
      params.push(searchTerm);
      paramCount += 3;
    }

    query += ' ORDER BY a.date DESC, u.name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('All attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Specific employee attendance (Manager only)
router.get('/employee/:id', auth, isManager, async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await pool.query(
      `SELECT a.*, u.name, u.email, u.employee_id, u.department 
       FROM attendance a
       JOIN users u ON a.user_id = u.id
       WHERE a.user_id = $1 
       ORDER BY a.date DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Employee attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Team summary (Manager only)
router.get('/summary', auth, isManager, [
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('year').optional().isInt({ min: 2000, max: 3000 }),
], async (req, res) => {
  try {
    const month = req.query.month || new Date().getMonth() + 1;
    const year = req.query.year || new Date().getFullYear();

    const result = await pool.query(
      `SELECT 
        COUNT(DISTINCT user_id) as total_employees,
        COUNT(*) FILTER (WHERE status = 'present' OR status = 'late') as present,
        COUNT(*) FILTER (WHERE status = 'absent') as absent,
        COUNT(*) FILTER (WHERE status = 'late') as late,
        COUNT(*) FILTER (WHERE status = 'half-day') as half_day,
        COALESCE(SUM(total_hours), 0) as total_hours
       FROM attendance 
       WHERE EXTRACT(MONTH FROM date) = $1 
       AND EXTRACT(YEAR FROM date) = $2`,
      [month, year]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Team summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark absent employees (called at 12pm or manually)
// Only marks absent if current time is after 12pm (noon)
router.post('/mark-absent', auth, isManager, async (req, res) => {
  try {
    const { date } = req.body;
    const now = new Date();
    const targetDate = date || now.toISOString().split('T')[0];
    
    // Check if it's after 12pm (noon) - only mark absent after 12pm
    const noon = new Date(now);
    noon.setHours(12, 0, 0, 0);
    
    // If manually calling with a date, check if that date is today and it's past 12pm
    const isToday = targetDate === now.toISOString().split('T')[0];
    if (isToday && now < noon) {
      return res.json({ 
        message: 'Cannot mark absent before 12pm. Please try again after noon.',
        count: 0 
      });
    }

    // Get all employees who haven't checked in today
    const employeesResult = await pool.query(
      `SELECT u.id FROM users u
       LEFT JOIN attendance a ON u.id = a.user_id AND a.date = $1
       WHERE u.role = 'employee' AND (a.id IS NULL OR a.check_in_time IS NULL)`,
      [targetDate]
    );

    // Mark them as absent
    for (const emp of employeesResult.rows) {
      const existing = await pool.query(
        'SELECT id FROM attendance WHERE user_id = $1 AND date = $2',
        [emp.id, targetDate]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          'INSERT INTO attendance (user_id, date, status) VALUES ($1, $2, $3)',
          [emp.id, targetDate, 'absent']
        );
      } else {
        await pool.query(
          'UPDATE attendance SET status = $1 WHERE user_id = $2 AND date = $3',
          ['absent', emp.id, targetDate]
        );
      }
    }

    res.json({ message: 'Absent employees marked successfully', count: employeesResult.rows.length });
  } catch (error) {
    console.error('Mark absent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Auto-check and mark absent at 12pm (can be called by cron job)
router.post('/auto-mark-absent', async (req, res) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Check if it's after 12pm (noon)
    const noon = new Date(now);
    noon.setHours(12, 0, 0, 0);
    
    if (now < noon) {
      return res.json({ 
        message: 'Not yet 12pm. Will mark absent after noon.',
        count: 0 
      });
    }

    // Get all employees who haven't checked in today
    const employeesResult = await pool.query(
      `SELECT u.id FROM users u
       LEFT JOIN attendance a ON u.id = a.user_id AND a.date = $1
       WHERE u.role = 'employee' AND (a.id IS NULL OR a.check_in_time IS NULL)`,
      [today]
    );

    // Mark them as absent
    for (const emp of employeesResult.rows) {
      const existing = await pool.query(
        'SELECT id FROM attendance WHERE user_id = $1 AND date = $2',
        [emp.id, today]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          'INSERT INTO attendance (user_id, date, status) VALUES ($1, $2, $3)',
          [emp.id, today, 'absent']
        );
      } else {
        await pool.query(
          'UPDATE attendance SET status = $1 WHERE user_id = $2 AND date = $3',
          ['absent', emp.id, today]
        );
      }
    }

    res.json({ message: 'Absent employees marked successfully', count: employeesResult.rows.length });
  } catch (error) {
    console.error('Auto mark absent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export CSV (Manager only)
router.get('/export', auth, isManager, [
  query('startDate').optional(),
  query('endDate').optional(),
  query('employeeId').optional(),
  query('department').optional(),
  query('status').optional(),
], async (req, res) => {
  try {
    let query = `
      SELECT 
        u.employee_id as "Employee ID",
        u.name as "Name",
        u.email as "Email",
        u.department as "Department",
        a.date as "Date",
        a.check_in_time as "Check In",
        a.check_out_time as "Check Out",
        a.status as "Status",
        a.total_hours as "Total Hours"
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (req.query.startDate) {
      query += ` AND a.date >= $${paramCount}`;
      params.push(req.query.startDate);
      paramCount++;
    }

    if (req.query.endDate) {
      query += ` AND a.date <= $${paramCount}`;
      params.push(req.query.endDate);
      paramCount++;
    }

    if (req.query.employeeId) {
      query += ` AND u.employee_id = $${paramCount}`;
      params.push(req.query.employeeId);
      paramCount++;
    }

    if (req.query.department) {
      query += ` AND u.department = $${paramCount}`;
      params.push(req.query.department);
      paramCount++;
    }

    if (req.query.status) {
      query += ` AND a.status = $${paramCount}`;
      params.push(req.query.status);
      paramCount++;
    }

    query += ' ORDER BY a.date DESC, u.name';

    const result = await pool.query(query, params);

    // Convert to CSV
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No data to export' });
    }

    const headers = Object.keys(result.rows[0]).join(',');
    const rows = result.rows.map(row => 
      Object.values(row).map(val => 
        val === null ? '' : typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );

    const csv = [headers, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Today's status (Manager only)
router.get('/today-status', auth, isManager, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await pool.query(
      `SELECT 
        u.id, u.name, u.email, u.employee_id, u.department,
        a.check_in_time, a.check_out_time, a.status
       FROM users u
       LEFT JOIN attendance a ON u.id = a.user_id AND a.date = $1
       WHERE u.role = 'employee'
       ORDER BY u.name`,
      [today]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Today status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

