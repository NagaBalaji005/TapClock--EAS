const { Pool } = require('pg');
require('dotenv').config();

// Create pool with DATABASE_URL support
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'attendance_system',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    };

const pool = new Pool(poolConfig);

const testDashboard = async () => {
  try {
    console.log('='.repeat(60));
    console.log('MANAGER DASHBOARD DATA TEST');
    console.log('='.repeat(60));
    
    const today = new Date().toISOString().split('T')[0];
    console.log('\n📅 Today\'s Date:', today);
    console.log('='.repeat(60));
    
    // Test 1: Count all employees
    console.log('\n1️⃣ Testing: Total Employees Count');
    const totalEmployeesResult = await pool.query(
      "SELECT COUNT(DISTINCT employee_id)::int as count FROM users WHERE role = 'employee'"
    );
    console.log('   Result:', totalEmployeesResult.rows[0]);
    console.log('   ✅ Total Employees:', totalEmployeesResult.rows[0]?.count || 0);
    
    // Test 2: List all employees
    console.log('\n2️⃣ Testing: List All Employees');
    const allEmployeesResult = await pool.query(
      "SELECT id, name, employee_id, department, role FROM users WHERE role = 'employee' ORDER BY employee_id"
    );
    console.log('   Found', allEmployeesResult.rows.length, 'employees:');
    allEmployeesResult.rows.forEach(emp => {
      console.log(`   - ${emp.employee_id}: ${emp.name} (${emp.department || 'No Dept'})`);
    });
    
    // Check all users to see what roles exist
    console.log('\n2b️⃣ Testing: All Users (all roles)');
    const allUsersResult = await pool.query(
      "SELECT id, name, employee_id, department, role FROM users ORDER BY employee_id"
    );
    console.log('   Found', allUsersResult.rows.length, 'total users:');
    allUsersResult.rows.forEach(emp => {
      console.log(`   - ${emp.employee_id}: ${emp.name} - Role: ${emp.role} (${emp.department || 'No Dept'})`);
    });
    
    // Test 3: Today's attendance summary
    console.log('\n3️⃣ Testing: Today\'s Attendance Summary');
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
    console.log('   Query Result:', todayResult.rows[0]);
    console.log('   ✅ Present:', todayResult.rows[0]?.present || 0);
    console.log('   ✅ Absent:', todayResult.rows[0]?.absent || 0);
    console.log('   ✅ Late:', todayResult.rows[0]?.late || 0);
    
    // Test 4: All attendance records for today
    console.log('\n4️⃣ Testing: All Attendance Records for Today');
    const attendanceTodayResult = await pool.query(
      `SELECT a.*, u.name, u.employee_id, u.department 
       FROM attendance a
       JOIN users u ON a.user_id = u.id
       WHERE a.date = $1 AND u.role = 'employee'
       ORDER BY u.name`,
      [today]
    );
    console.log('   Found', attendanceTodayResult.rows.length, 'attendance records:');
    attendanceTodayResult.rows.forEach(rec => {
      console.log(`   - ${rec.employee_id} (${rec.name}): ${rec.status || 'No status'} | Check In: ${rec.check_in_time ? 'Yes' : 'No'}`);
    });
    
    // Test 5: Late arrivals today
    console.log('\n5️⃣ Testing: Late Arrivals Today');
    const lateQuery = `
      SELECT u.id, u.name, u.employee_id, u.department, a.check_in_time, a.status
       FROM users u
       JOIN attendance a ON u.id = a.user_id AND a.date = $1
       WHERE u.role = 'employee' AND a.status = 'late'
       ORDER BY a.check_in_time
    `;
    const lateResult = await pool.query(lateQuery, [today]);
    console.log('   Found', lateResult.rows.length, 'late arrivals:');
    lateResult.rows.forEach(emp => {
      console.log(`   - ${emp.employee_id} (${emp.name}): ${emp.check_in_time ? new Date(emp.check_in_time).toLocaleString() : 'No time'}`);
    });
    
    // Test 6: Absent employees today
    console.log('\n6️⃣ Testing: Absent Employees Today');
    const absentQuery = `
      SELECT u.id, u.name, u.employee_id, u.department, u.email, a.status, a.check_in_time
       FROM users u
       LEFT JOIN attendance a ON u.id = a.user_id AND a.date = $1
       WHERE u.role = 'employee' 
       AND (a.check_in_time IS NULL OR a.status = 'absent')
       ORDER BY u.name
    `;
    const absentResult = await pool.query(absentQuery, [today]);
    console.log('   Found', absentResult.rows.length, 'absent employees:');
    absentResult.rows.forEach(emp => {
      console.log(`   - ${emp.employee_id} (${emp.name}): ${emp.check_in_time ? 'Has record but absent' : 'No check in'}`);
    });
    
    // Test 7: Department-wise attendance
    console.log('\n7️⃣ Testing: Department-wise Attendance');
    const deptQuery = `
      SELECT 
        COALESCE(u.department, 'No Department') as department,
        COUNT(DISTINCT u.employee_id)::int as total_employees,
        COALESCE(COUNT(DISTINCT CASE WHEN a.check_in_time IS NOT NULL AND a.status != 'absent' THEN u.id END), 0)::int as present,
        COALESCE(COUNT(DISTINCT CASE WHEN (a.status = 'absent' OR a.check_in_time IS NULL) THEN u.id END), 0)::int as absent
       FROM users u
       LEFT JOIN attendance a ON u.id = a.user_id AND a.date = $1
       WHERE u.role = 'employee'
       GROUP BY u.department
       ORDER BY u.department
    `;
    const deptResult = await pool.query(deptQuery, [today]);
    console.log('   Department Summary:');
    deptResult.rows.forEach(dept => {
      console.log(`   - ${dept.department}: ${dept.total_employees} total, ${dept.present} present, ${dept.absent} absent`);
    });
    
    // Test 8: Weekly trend (last 7 days)
    console.log('\n8️⃣ Testing: Weekly Attendance Trend (Last 7 Days)');
    const weeklyQuery = `
      SELECT 
        daily_attendance.date::date as date,
        COALESCE(COUNT(DISTINCT CASE WHEN daily_attendance.check_in_time IS NOT NULL AND daily_attendance.status != 'absent' THEN daily_attendance.id END), 0)::int as present,
        COALESCE(COUNT(DISTINCT CASE WHEN (daily_attendance.status = 'absent' OR daily_attendance.check_in_time IS NULL) THEN daily_attendance.id END), 0)::int as absent
       FROM (
         SELECT DISTINCT u.id, u.employee_id, date_series.date::date as date, a.check_in_time, a.status
         FROM users u
         CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE + INTERVAL '1 day', '1 day'::interval) AS date_series
         LEFT JOIN attendance a ON u.id = a.user_id AND a.date = date_series.date::date
         WHERE u.role = 'employee'
       ) AS daily_attendance
       GROUP BY daily_attendance.date
       ORDER BY daily_attendance.date
    `;
    const weeklyResult = await pool.query(weeklyQuery);
    console.log('   Weekly Trend:');
    weeklyResult.rows.forEach(day => {
      const dateStr = typeof day.date === 'string' ? day.date : day.date.toISOString().split('T')[0];
      console.log(`   - ${dateStr}: ${day.present} present, ${day.absent} absent`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('TEST COMPLETED');
    console.log('='.repeat(60));
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
};

testDashboard();

