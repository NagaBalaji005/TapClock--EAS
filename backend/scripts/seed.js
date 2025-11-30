const bcrypt = require('bcryptjs');
const { pool, initDatabase } = require('../config/database');
require('dotenv').config();

const seedData = async () => {
  try {
    await initDatabase();

    // Clear existing data
    await pool.query('DELETE FROM attendance');
    await pool.query('DELETE FROM users');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create manager
    const managerResult = await pool.query(
      `INSERT INTO users (name, email, password, role, employee_id, department) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['John Manager', 'manager@example.com', hashedPassword, 'manager', 'MGR001', 'Management']
    );
    const managerId = managerResult.rows[0].id;

    // Create employees
    const employees = [
      ['Alice Smith', 'alice@example.com', 'EMP001', 'Engineering'],
      ['Bob Johnson', 'bob@example.com', 'EMP002', 'Engineering'],
      ['Charlie Brown', 'charlie@example.com', 'EMP003', 'Sales'],
      ['Diana Prince', 'diana@example.com', 'EMP004', 'Sales'],
      ['Eve Wilson', 'eve@example.com', 'EMP005', 'HR'],
    ];

    const employeeIds = [];
    for (const [name, email, empId, dept] of employees) {
      const result = await pool.query(
        `INSERT INTO users (name, email, password, role, employee_id, department) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [name, email, hashedPassword, 'employee', empId, dept]
      );
      employeeIds.push(result.rows[0].id);
    }

    // Create sample attendance data (last 30 days)
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();

      // Skip weekends for some employees
      for (let j = 0; j < employeeIds.length; j++) {
        const userId = employeeIds[j];
        const shouldSkip = dayOfWeek === 0 || dayOfWeek === 6; // Weekend

        if (!shouldSkip || Math.random() > 0.3) {
          const checkIn = new Date(date);
          checkIn.setHours(9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);

          let status = 'present';
          if (checkIn.getHours() > 9 || (checkIn.getHours() === 9 && checkIn.getMinutes() > 15)) {
            status = 'late';
          }

          const checkOut = new Date(checkIn);
          checkOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);

          const totalHours = ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2);

          await pool.query(
            `INSERT INTO attendance (user_id, date, check_in_time, check_out_time, status, total_hours) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, dateStr, checkIn, checkOut, status, totalHours]
          );
        } else {
          // Absent
          await pool.query(
            `INSERT INTO attendance (user_id, date, status) 
             VALUES ($1, $2, $3)`,
            [userId, dateStr, 'absent']
          );
        }
      }
    }

    console.log('Seed data created successfully!');
    console.log('Manager: manager@example.com / password123');
    console.log('Employees: alice@example.com, bob@example.com, etc. / password123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

