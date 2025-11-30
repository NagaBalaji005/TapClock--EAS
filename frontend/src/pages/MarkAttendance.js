import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkIn, checkOut, getTodayStatus, clearError } from '../store/slices/attendanceSlice';

const MarkAttendance = () => {
  const dispatch = useDispatch();
  const { todayStatus, loading, error } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(getTodayStatus());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleCheckIn = () => {
    dispatch(checkIn()).then(() => {
      dispatch(getTodayStatus());
    });
  };

  const handleCheckOut = () => {
    dispatch(checkOut()).then(() => {
      dispatch(getTodayStatus());
    });
  };

  return (
    <div className="container">
      <h1>Mark Attendance</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h2 style={{ marginBottom: '30px' }}>Today's Attendance</h2>
        
        {todayStatus && (
          <div style={{ marginBottom: '30px' }}>
            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            {todayStatus.attendance?.check_in_time && (
              <p><strong>Check In:</strong> {new Date(todayStatus.attendance.check_in_time).toLocaleString()}</p>
            )}
            {todayStatus.attendance?.check_out_time && (
              <p><strong>Check Out:</strong> {new Date(todayStatus.attendance.check_out_time).toLocaleString()}</p>
            )}
            {todayStatus.attendance?.status && (
              <p>
                <strong>Status:</strong>{' '}
                <span className={`badge badge-${todayStatus.attendance.status === 'present' ? 'success' : todayStatus.attendance.status === 'late' ? 'warning' : 'danger'}`}>
                  {todayStatus.attendance.status}
                </span>
              </p>
            )}
            {todayStatus.attendance?.total_hours && (
              <p><strong>Total Hours:</strong> {todayStatus.attendance.total_hours}</p>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          {!todayStatus?.checkedIn && (
            <button
              className="btn btn-success"
              onClick={handleCheckIn}
              disabled={loading}
              style={{ padding: '15px 40px', fontSize: '18px' }}
            >
              {loading ? 'Processing...' : 'Check In'}
            </button>
          )}
          {todayStatus?.checkedIn && !todayStatus?.checkedOut && (
            <button
              className="btn btn-danger"
              onClick={handleCheckOut}
              disabled={loading}
              style={{ padding: '15px 40px', fontSize: '18px' }}
            >
              {loading ? 'Processing...' : 'Check Out'}
            </button>
          )}
          {todayStatus?.checkedOut && (
            <p style={{ color: '#28a745', fontSize: '18px' }}>✓ You have completed today's attendance</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;

