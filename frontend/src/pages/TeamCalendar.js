import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance } from '../store/slices/attendanceSlice';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';

const TeamCalendar = () => {
  const dispatch = useDispatch();
  const { allAttendance } = useSelector((state) => state.attendance);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDayRecords, setSelectedDayRecords] = useState([]);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'

  const currentMonth = selectedDate.getMonth() + 1;
  const currentYear = selectedDate.getFullYear();

  useEffect(() => {
    const startDate = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(selectedDate), 'yyyy-MM-dd');
    dispatch(getAllAttendance({ startDate, endDate }));
  }, [dispatch, selectedDate]);

  const handleMonthChange = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const handleDayClick = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const records = allAttendance.filter((record) => record.date === dateStr);
    setSelectedDayRecords(records);
  };

  const getDayStats = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayRecords = allAttendance.filter((record) => record.date === dateStr);
    const present = dayRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
    const absent = dayRecords.filter((r) => r.status === 'absent').length;
    const late = dayRecords.filter((r) => r.status === 'late').length;
    const halfDay = dayRecords.filter((r) => r.status === 'half-day').length;
    const totalHours = dayRecords.reduce((sum, r) => sum + (parseFloat(r.total_hours) || 0), 0);
    return { present, absent, late, halfDay, total: dayRecords.length, totalHours };
  };

  const handleDateSelect = (e) => {
    const [year, month] = e.target.value.split('-');
    setSelectedDate(new Date(parseInt(year), parseInt(month) - 1, 1));
  };

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Team Calendar View</h1>
        <button className="btn btn-secondary" onClick={() => setViewMode(viewMode === 'calendar' ? 'table' : 'calendar')}>
          {viewMode === 'calendar' ? 'Table View' : 'Calendar View'}
        </button>
      </div>

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
          <>

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
            const stats = getDayStats(day);
            const hasData = stats.total > 0;
            
            // Determine background color
            let bgColor = '#f5f5f5'; // No data
            if (hasData) {
              if (stats.absent === 0 && stats.present > 0) {
                bgColor = '#d4edda'; // All present (green)
              } else if (stats.present > stats.absent) {
                bgColor = '#fff3cd'; // More present than absent (yellow)
              } else if (stats.absent > 0) {
                bgColor = '#f8d7da'; // Has absentees (red)
              } else {
                bgColor = '#ffffff'; // Default white
              }
            }
            
            // Calculate percentage
            const totalEmployees = stats.present + stats.absent;
            const percentage = totalEmployees > 0 ? ((stats.present / totalEmployees) * 100).toFixed(0) : 0;
            
            return (
              <div
                key={day.toISOString()}
                className="calendar-day"
                style={{
                  cursor: 'pointer',
                  backgroundColor: bgColor,
                  padding: '5px',
                  fontSize: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  minHeight: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                onClick={() => handleDayClick(day)}
                title={hasData ? 
                  `Date: ${format(day, 'yyyy-MM-dd')}\nPresent: ${stats.present} | Absent: ${stats.absent} | Late: ${stats.late} | Half-Day: ${stats.halfDay} | Total Hours: ${stats.totalHours.toFixed(1)} | Percentage: ${percentage}%` :
                  `Date: ${format(day, 'yyyy-MM-dd')}\nNo attendance data`
                }
              >
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '3px' }}>{format(day, 'd')}</div>
                {hasData && (
                  <div style={{ fontSize: '9px', lineHeight: '1.3' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                      <div>P: {stats.present}</div>
                      <div>A: {stats.absent}</div>
                    </div>
                    {stats.late > 0 && <div style={{ color: '#856404' }}>L: {stats.late}</div>}
                    {stats.halfDay > 0 && <div style={{ color: '#856404' }}>H: {stats.halfDay}</div>}
                    {stats.totalHours > 0 && (
                      <div style={{ marginTop: '3px', fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: '2px' }}>
                        {stats.totalHours.toFixed(1)}h
                      </div>
                    )}
                    {totalEmployees > 0 && (
                      <div style={{ marginTop: '2px', fontWeight: 'bold', color: percentage >= 80 ? '#155724' : percentage >= 50 ? '#856404' : '#721c24' }}>
                        {percentage}%
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '20px' }}>
          <p><span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: '#d4edda', marginRight: '5px' }}></span> All Present</p>
          <p><span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: '#fff3cd', marginRight: '5px' }}></span> Mixed</p>
          <p><span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: '#f8d7da', marginRight: '5px' }}></span> Mostly Absent</p>
        </div>
          </>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {allAttendance.length > 0 ? (
                allAttendance.map((record) => (
                  <tr key={record.id}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.employee_id}</td>
                    <td>{record.name}</td>
                    <td>{record.department || 'N/A'}</td>
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
                  <td colSpan="8" style={{ textAlign: 'center' }}>No attendance records for this month</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedDayRecords.length > 0 && (
        <div className="card">
          <h2>Attendance for {format(new Date(selectedDayRecords[0].date), 'MMMM dd, yyyy')}</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedDayRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.employee_id}</td>
                  <td>{record.name}</td>
                  <td>{record.department || 'N/A'}</td>
                  <td>{record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString() : '-'}</td>
                  <td>{record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : '-'}</td>
                  <td>
                    <span className={`badge badge-${record.status === 'present' ? 'success' : record.status === 'late' ? 'warning' : 'danger'}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeamCalendar;

