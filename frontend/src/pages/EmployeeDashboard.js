import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getTodayStatus } from '../store/slices/attendanceSlice';
import axios from 'axios';
import { API_URL } from '../config/api';

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { todayStatus } = useSelector((state) => state.attendance);
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Only fetch if user is an employee
    if (user?.role === 'employee') {
      dispatch(getTodayStatus());
      fetchDashboardData();
    } else if (user?.role === 'manager') {
      // Redirect managers to their dashboard
      navigate('/manager/dashboard', { replace: true });
    }
  }, [dispatch, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/employee`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container loading">Loading...</div>;
  }

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="container">
      <h1>Welcome, {user?.name}!</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Today's Status</h3>
          <div className="value" style={{ fontSize: '18px' }}>
            {todayStatus?.checkedIn ? (
              todayStatus?.checkedOut ? (
                <span className="badge badge-success">Checked Out</span>
              ) : (
                <span className="badge badge-info">Checked In</span>
              )
            ) : (
              <span className="badge badge-danger">Not Checked In</span>
            )}
          </div>
        </div>
        <div className="stat-card">
          <h3>Present ({currentMonth})</h3>
          <div className="value">{dashboardData?.monthlySummary?.present || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Absent ({currentMonth})</h3>
          <div className="value">{dashboardData?.monthlySummary?.absent || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Late ({currentMonth})</h3>
          <div className="value">{dashboardData?.monthlySummary?.late || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Total Hours ({currentMonth})</h3>
          <div className="value">{parseFloat(dashboardData?.monthlySummary?.total_hours || 0).toFixed(1)}</div>
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
        <h2>Recent Attendance (Last 7 Days)</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData?.recentAttendance?.length > 0 ? (
              dashboardData.recentAttendance.map((record) => (
                <tr key={record.id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString() : '-'}</td>
                  <td>{record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : '-'}</td>
                  <td>
                    <span className={`badge badge-${record.status === 'present' ? 'success' : record.status === 'late' ? 'warning' : 'danger'}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>{record.total_hours || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No attendance records</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

