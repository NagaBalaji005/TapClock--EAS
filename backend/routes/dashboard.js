const express = require('express');
const { pool } = require('../config/database');
const { auth, isManager } = require('../middleware/auth');

const router = express.Router();

// Employee dashboard
router.get('/employee', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Today's status
    const todayResult = await pool.query(
      'SELECT * FROM attendance WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    // Monthly summary - late counts as present
    const summaryResult = await pool.query(
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
      [userId, currentMonth, currentYear]
    );

    // Recent attendance (last 7 days)
    const recentResult = await pool.query(
      `SELECT * FROM attendance 
       WHERE user_id = $1 
       AND date >= CURRENT_DATE - INTERVAL '7 days'
       ORDER BY date DESC`,
      [userId]
    );

    const monthlySummary = summaryResult.rows[0] || {
      present: 0,
      absent: 0,
      late: 0,
      half_day: 0,
      total_hours: 0
    };

    res.json({
      today: {
        checkedIn: todayResult.rows.length > 0 && !!todayResult.rows[0].check_in_time,
        checkedOut: todayResult.rows.length > 0 && !!todayResult.rows[0].check_out_time,
        attendance: todayResult.rows[0] || null,
      },
      monthlySummary: monthlySummary,
      recentAttendance: recentResult.rows || [],
    });
  } catch (error) {
    console.error('Employee dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manager dashboard
router.get('/manager', auth, isManager, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const department = req.query.department;

    // Total employees - count unique employee IDs (with or without department filter)
    let totalEmployeesQuery = "SELECT COUNT(DISTINCT employee_id)::int as count FROM users WHERE role = 'employee'";
    const totalEmployeesParams = [];
    if (department) {
      totalEmployeesQuery += " AND department = $1";
      totalEmployeesParams.push(department);
    }
    const totalEmployeesResult = await pool.query(totalEmployeesQuery, totalEmployeesParams);
    
    // Debug: Also get list of employees to verify
    let debugQuery = "SELECT id, name, employee_id, department, role FROM users WHERE role = 'employee'";
    if (department) {
      debugQuery += " AND department = $1";
    }
    const debugResult = await pool.query(debugQuery, totalEmployeesParams);
    console.log('Debug - Employees found:', debugResult.rows.length, debugResult.rows);

    // Today's attendance - count distinct employees who checked in (present or late)
    let todayQuery = `
      SELECT 
        COALESCE(COUNT(DISTINCT CASE WHEN a.check_in_time IS NOT NULL AND a.status != 'absent' THEN u.id END), 0)::int as present,
        COALESCE(COUNT(DISTINCT CASE WHEN (a.status = 'absent' OR a.check_in_time IS NULL) THEN u.id END), 0)::int as absent,
        COALESCE(COUNT(DISTINCT CASE WHEN a.status = 'late' THEN u.id END), 0)::int as late
       FROM users u
       LEFT JOIN attendance a ON u.id = a.user_id AND a.date = $1
       WHERE u.role = 'employee'
    `;
    const todayParams = [today];
    if (department) {
      todayQuery += ' AND u.department = $2';
      todayParams.push(department);
    }
    const todayResult = await pool.query(todayQuery, todayParams);

    // Late arrivals today
    let lateQuery = `
      SELECT u.id, u.name, u.employee_id, u.department, a.check_in_time
       FROM users u
       JOIN attendance a ON u.id = a.user_id AND a.date = $1
       WHERE u.role = 'employee' AND a.status = 'late'
    `;
    const lateParams = [today];
    if (department) {
      lateQuery += ' AND u.department = $2';
      lateParams.push(department);
    }
    lateQuery += ' ORDER BY a.check_in_time';
    const lateResult = await pool.query(lateQuery, lateParams);

    // Weekly attendance trend (last 7 days) - get full week data for all employees
    let weeklyQuery = `
      SELECT 
        daily_attendance.date::date as date,
        COALESCE(COUNT(DISTINCT CASE WHEN daily_attendance.check_in_time IS NOT NULL AND daily_attendance.status != 'absent' THEN daily_attendance.id END), 0)::int as present,
        COALESCE(COUNT(DISTINCT CASE WHEN (daily_attendance.status = 'absent' OR daily_attendance.check_in_time IS NULL) THEN daily_attendance.id END), 0)::int as absent
       FROM (
         SELECT DISTINCT u.id, u.employee_id, date_series.date::date as date, a.check_in_time, a.status
         FROM users u
         CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval) AS date_series
         LEFT JOIN attendance a ON u.id = a.user_id AND a.date = date_series.date::date
         WHERE u.role = 'employee'
    `;
    const weeklyParams = [];
    if (department) {
      weeklyQuery += ` AND u.department = $1`;
      weeklyParams.push(department);
    }
    weeklyQuery += `
       ) AS daily_attendance
       GROUP BY daily_attendance.date
       ORDER BY daily_attendance.date
    `;
    const weeklyResult = await pool.query(weeklyQuery, weeklyParams);

    // Department-wise attendance - count distinct employees
    let deptQuery = `
      SELECT 
        COALESCE(u.department, 'No Department') as department,
        COUNT(DISTINCT u.employee_id)::int as total_employees,
        COALESCE(COUNT(DISTINCT CASE WHEN a.check_in_time IS NOT NULL AND a.status != 'absent' THEN u.id END), 0)::int as present,
        COALESCE(COUNT(DISTINCT CASE WHEN (a.status = 'absent' OR a.check_in_time IS NULL) THEN u.id END), 0)::int as absent
       FROM users u
       LEFT JOIN attendance a ON u.id = a.user_id AND a.date = $1
       WHERE u.role = 'employee'
    `;
    const deptParams = [today];
    if (department) {
      deptQuery += ' AND u.department = $2';
      deptParams.push(department);
    }
    deptQuery += ' GROUP BY u.department';
    const deptResult = await pool.query(deptQuery, deptParams);

    // Absent employees today - those who haven't checked in or marked absent
    let absentQuery = `
      SELECT u.id, u.name, u.employee_id, u.department, u.email
       FROM users u
       LEFT JOIN attendance a ON u.id = a.user_id AND a.date = $1
       WHERE u.role = 'employee' 
       AND (a.check_in_time IS NULL OR a.status = 'absent')
    `;
    const absentParams = [today];
    if (department) {
      absentQuery += ' AND u.department = $2';
      absentParams.push(department);
    }
    absentQuery += ' ORDER BY u.name';
    const absentResult = await pool.query(absentQuery, absentParams);

    const totalEmployeesCount = totalEmployeesResult.rows[0]?.count || 0;
    const todayAttendanceData = todayResult.rows[0] || { present: 0, absent: 0, late: 0 };
    
    // Ensure all values are integers
    const totalEmployees = typeof totalEmployeesCount === 'string' ? parseInt(totalEmployeesCount, 10) : (totalEmployeesCount || 0);
    const present = parseInt(todayAttendanceData.present, 10) || 0;
    const absent = parseInt(todayAttendanceData.absent, 10) || 0;
    const late = parseInt(todayAttendanceData.late, 10) || 0;
    
    // Debug logging
    console.log('Manager Dashboard Data:', {
      today: today,
      totalEmployees: totalEmployees,
      todayAttendance: { present, absent, late },
      lateArrivalsCount: lateResult.rows.length,
      absentCount: absentResult.rows.length,
      deptCount: deptResult.rows.length,
      weeklyCount: weeklyResult.rows.length
    });
    
    res.json({
      totalEmployees: totalEmployees,
      todayAttendance: {
        present: present,
        absent: absent,
        late: late,
      },
      lateArrivals: lateResult.rows || [],
      weeklyTrend: weeklyResult.rows || [],
      departmentWise: deptResult.rows || [],
      absentToday: absentResult.rows || [],
    });
  } catch (error) {
    console.error('Manager dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

