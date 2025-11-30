import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getTodayStatusAll } from '../store/slices/attendanceSlice';
import axios from 'axios';
import { API_URL } from '../config/api';

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const { todayStatusAll } = useSelector((state) => state.attendance);
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedDept, setSelectedDept] = React.useState('');

  useEffect(() => {
    dispatch(getTodayStatusAll());
    fetchDashboardData();
  }, [dispatch]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDept]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const url = selectedDept ? `${API_URL}/dashboard/manager?department=${selectedDept}` : `${API_URL}/dashboard/manager`;
      const response = await axios.get(url);
      console.log('Manager Dashboard Response:', response.data);
      console.log('Total Employees:', response.data?.totalEmployees);
      console.log('Today Attendance:', response.data?.todayAttendance);
      
      // Ensure data is set even if some fields are missing
      setDashboardData({
        totalEmployees: response.data?.totalEmployees ?? 0,
        todayAttendance: response.data?.todayAttendance ?? { present: 0, absent: 0, late: 0 },
        lateArrivals: response.data?.lateArrivals ?? [],
        weeklyTrend: response.data?.weeklyTrend ?? [],
        departmentWise: response.data?.departmentWise ?? [],
        absentToday: response.data?.absentToday ?? [],
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboardData) {
    return <div className="container loading">Loading...</div>;
  }

  const departments = dashboardData?.departmentWise?.map(d => d.department).filter(Boolean) || [];

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Welcome, {user?.name}!</h1>
        {departments.length > 0 && (
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Employees</h3>
          <div className="value">{dashboardData?.totalEmployees || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Present Today</h3>
          <div className="value" style={{ color: '#28a745' }}>
            {dashboardData?.todayAttendance?.present || 0}
          </div>
        </div>
        <div className="stat-card">
          <h3>Absent Today</h3>
          <div className="value" style={{ color: '#dc3545' }}>
            {dashboardData?.todayAttendance?.absent || 0}
          </div>
        </div>
        <div className="stat-card">
          <h3>Late Today</h3>
          <div className="value" style={{ color: '#ffc107' }}>
            {dashboardData?.todayAttendance?.late || 0}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Quick Actions</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/mark-attendance" className="btn btn-primary">
            Mark Attendance
          </Link>
          <Link to="/my-attendance" className="btn btn-secondary">
            View History
          </Link>
        </div>
      </div>

      <div className="card">
        <h2>Late Arrivals Today</h2>
        {dashboardData?.lateArrivals?.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Check In Time</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.lateArrivals.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.employee_id}</td>
                  <td>{emp.name}</td>
                  <td>{emp.department || 'N/A'}</td>
                  <td>{emp.check_in_time ? new Date(emp.check_in_time).toLocaleTimeString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No late arrivals today</p>
        )}
      </div>

      <div className="card">
        <h2>Absent Employees Today</h2>
        {dashboardData?.absentToday?.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.absentToday.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.employee_id}</td>
                  <td>{emp.name}</td>
                  <td>{emp.department || 'N/A'}</td>
                  <td>{emp.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>All employees are present today</p>
        )}
      </div>

      <div className="card">
        <h2>Department-wise Attendance</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Total Employees</th>
              <th>Present</th>
              <th>Absent</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData?.departmentWise?.map((dept, index) => (
              <tr key={index}>
                <td>{dept.department}</td>
                <td>{dept.total_employees}</td>
                <td>{dept.present}</td>
                <td>{dept.absent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Weekly Attendance Trend</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Present</th>
              <th>Absent</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData?.weeklyTrend?.map((day, index) => (
              <tr key={index}>
                <td>{new Date(day.date).toLocaleDateString()}</td>
                <td>{day.present}</td>
                <td>{day.absent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerDashboard;

