import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyHistory, getMySummary } from '../store/slices/attendanceSlice';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

const MyAttendanceHistory = () => {
  const dispatch = useDispatch();
  const { myHistory, mySummary } = useSelector((state) => state.attendance);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'

  const currentMonth = selectedDate.getMonth() + 1;
  const currentYear = selectedDate.getFullYear();

  useEffect(() => {
    dispatch(getMyHistory({ month: currentMonth, year: currentYear }));
    dispatch(getMySummary({ month: currentMonth, year: currentYear }));
  }, [dispatch, currentMonth, currentYear]);

  // Add date selection option
  const handleDateSelect = (e) => {
    const selected = new Date(e.target.value);
    setSelectedDate(selected);
  };

  const handleMonthChange = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const getAttendanceForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return myHistory.find((record) => record.date === dateStr);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'present':
        return 'present';
      case 'absent':
        return 'absent';
      case 'late':
        return 'late';
      case 'half-day':
        return 'half-day';
      default:
        return '';
    }
  };

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week for the month
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>My Attendance History</h1>
        <div>
          <button className="btn btn-secondary" onClick={() => setViewMode(viewMode === 'calendar' ? 'table' : 'calendar')}>
            {viewMode === 'calendar' ? 'Table View' : 'Calendar View'}
          </button>
        </div>
      </div>

      {mySummary && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Present</h3>
            <div className="value">{mySummary.present || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Absent</h3>
            <div className="value">{mySummary.absent || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Late</h3>
            <div className="value">{mySummary.late || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Half Day</h3>
            <div className="value">{mySummary.half_day || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Total Hours</h3>
            <div className="value">{parseFloat(mySummary.total_hours || 0).toFixed(1)}</div>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h2>{format(selectedDate, 'MMMM yyyy')}</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="month"
              value={`${currentYear}-${String(currentMonth).padStart(2, '0')}`}
              onChange={handleDateSelect}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <button className="btn btn-secondary" onClick={() => handleMonthChange(-1)}>← Prev</button>
            <button className="btn btn-secondary" onClick={() => setSelectedDate(new Date())}>
              Today
            </button>
            <button className="btn btn-secondary" onClick={() => handleMonthChange(1)}>Next →</button>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <div>
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="calendar-day-header">
                  {day}
                </div>
              ))}
              {emptyDays.map((_, index) => (
                <div key={`empty-${index}`}></div>
              ))}
              {daysInMonth.map((day) => {
                const attendance = getAttendanceForDate(day);
                const isToday = isSameDay(day, new Date());
                const statusClass = attendance ? getStatusClass(attendance.status) : '';
                
                // Determine background color based on status
                let bgColor = '#ffffff';
                if (statusClass === 'present') bgColor = '#d4edda';
                else if (statusClass === 'absent') bgColor = '#f8d7da';
                else if (statusClass === 'late') bgColor = '#fff3cd';
                else if (statusClass === 'half-day') bgColor = '#ffeaa7';
                
                // Remove status classes that might override inline styles
                const classNameWithoutStatus = `calendar-day ${isToday ? 'today' : ''}`;
                
                // Calculate percentage if we have summary data
                const totalDays = daysInMonth.length;
                const presentCount = mySummary?.present || 0;
                const absentCount = mySummary?.absent || 0;
                const percentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(0) : 0;
                
                return (
                  <div
                    key={day.toISOString()}
                    className={classNameWithoutStatus}
                    style={{
                      border: isToday ? '2px solid #007bff' : '1px solid #ddd',
                      cursor: 'pointer',
                      backgroundColor: bgColor,
                      borderRadius: '4px',
                      minHeight: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '5px',
                    }}
                    title={attendance ? 
                      `Date: ${attendance.date}\nStatus: ${attendance.status}\nCheck In: ${attendance.check_in_time ? format(new Date(attendance.check_in_time), 'hh:mm a') : 'N/A'}\nCheck Out: ${attendance.check_out_time ? format(new Date(attendance.check_out_time), 'hh:mm a') : 'N/A'}\nHours: ${attendance.total_hours || '0'}` : 
                      'No record'}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{format(day, 'd')}</div>
                    {attendance && (
                      <div style={{ fontSize: '9px', lineHeight: '1.2' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                          {attendance.status === 'present' ? '✓ Present' : 
                           attendance.status === 'late' ? '⚠ Late' : 
                           attendance.status === 'absent' ? '✗ Absent' : 
                           'H Half-Day'}
                        </div>
                        {attendance.check_in_time && (
                          <div>In: {format(new Date(attendance.check_in_time), 'hh:mm a')}</div>
                        )}
                        {attendance.check_out_time && (
                          <div>Out: {format(new Date(attendance.check_out_time), 'hh:mm a')}</div>
                        )}
                        {attendance.total_hours && parseFloat(attendance.total_hours) > 0 && (
                          <div style={{ marginTop: '2px', fontWeight: 'bold' }}>
                            {parseFloat(attendance.total_hours).toFixed(1)}h
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span><span className="calendar-day present" style={{ width: '20px', height: '20px', display: 'inline-block' }}></span> Present</span>
              <span><span className="calendar-day absent" style={{ width: '20px', height: '20px', display: 'inline-block' }}></span> Absent</span>
              <span><span className="calendar-day late" style={{ width: '20px', height: '20px', display: 'inline-block' }}></span> Late</span>
              <span><span className="calendar-day half-day" style={{ width: '20px', height: '20px', display: 'inline-block' }}></span> Half Day</span>
            </div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {myHistory.length > 0 ? (
                myHistory.map((record) => (
                  <tr key={record.id}>
                    <td>{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                    <td>{record.check_in_time ? format(new Date(record.check_in_time), 'hh:mm a') : '-'}</td>
                    <td>{record.check_out_time ? format(new Date(record.check_out_time), 'hh:mm a') : '-'}</td>
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
                  <td colSpan="5" style={{ textAlign: 'center' }}>No attendance records for this month</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyAttendanceHistory;

