const { pool } = require('../config/database');
require('dotenv').config();

const testDashboard = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    console.log('Testing Manager Dashboard Queries...');
    console.log('Today:', today);
    
    // Test total employees
    const totalResult = await pool.query("SELECT COUNT(DISTINCT employee_id) as count FROM users WHERE role = 'employee'");
    console.log('\n1. Total Employees:', totalResult.rows[0]?.count);
    
    // Test all employees
    const allEmployees = await pool.query("SELECT id, name, employee_id, department FROM users WHERE role = 'employee'");
    console.log('\n2. All Employees:', allEmployees.rows);
    
    // Test today's attendance
    const todayQuery = `
      SELECT 
        COALESCE(COUNT(DISTINCT CASE WHEN a.check_in_time IS NOT NULL AND a.status != 'absent' THEN u.id END), 0)::int as present,
        COALESCE(COUNT(DISTINCT CASE WHEN (a.status = 'absent' OR a.check_in_time IS NULL) THEN u.id END), 0)::int as absent,
        COALESCE(COUNT(DISTINCT CASE WHEN a.status = 'late' THEN u.id END), 0)::int as late
       FROM users u
       LEFT JOIN attendance a ON u.id = a.user_id AND a.date = $1
       WHERE u.role = 'employee'
    `;
    const todayResult = await pool.query(todayQuery, [today]);
    console.log('\n3. Today\'s Attendance:', todayResult.rows[0]);
    
    // Test attendance records for today
    const attendanceToday = await pool.query(
      `SELECT a.*, u.name, u.employee_id, u.department 
       FROM attendance a
       JOIN users u ON a.user_id = u.id
       WHERE a.date = $1 AND u.role = 'employee'
       ORDER BY u.name`,
      [today]
    );
    console.log('\n4. Attendance Records Today:', attendanceToday.rows);
    
    // Test late arrivals
    const lateResult = await pool.query(
      `SELECT u.id, u.name, u.employee_id, u.department, a.check_in_time
       FROM users u
       JOIN attendance a ON u.id = a.user_id AND a.date = $1
       WHERE u.role = 'employee' AND a.status = 'late'
       ORDER BY a.check_in_time`,
      [today]
    );
    console.log('\n5. Late Arrivals:', lateResult.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testDashboard();

