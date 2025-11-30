import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance, exportAttendance } from '../store/slices/attendanceSlice';
import { fetchEmployees, fetchDepartments } from '../utils/apiHelpers';

const Reports = () => {
  const dispatch = useDispatch();
  const { allAttendance, loading } = useSelector((state) => state.attendance);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employeeFilter, setEmployeeFilter] = useState('all'); // 'all' or 'search'
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0], // Today
    department: '',
    status: '',
  });

  React.useEffect(() => {
    const loadData = async () => {
      const employeesData = await fetchEmployees();
      const departmentsData = await fetchDepartments();
      setEmployees(employeesData);
      setDepartments(departmentsData);
    };
    loadData();
  }, []);

  const handleFilter = () => {
    const params = {};
    if (employeeFilter === 'search' && searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.department) params.department = filters.department;
    if (filters.status) params.status = filters.status;
    dispatch(getAllAttendance(params));
  };

  const handleExport = () => {
    const exportFilters = {
      ...filters,
      search: employeeFilter === 'search' && searchTerm.trim() ? searchTerm.trim() : undefined,
    };
    dispatch(exportAttendance(exportFilters));
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  React.useEffect(() => {
    handleFilter();
  }, []);

  // Clear search when switching to "all"
  React.useEffect(() => {
    if (employeeFilter === 'all') {
      setSearchTerm('');
    }
  }, [employeeFilter]);

  return (
    <div className="container">
      <h1>Attendance Reports</h1>

      <div className="card">
        <h2>Report Filters</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div className="form-group">
            <label>Employee</label>
            <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
              <option value="all">All Employees</option>
              <option value="search">Search</option>
            </select>
          </div>
          {employeeFilter === 'search' && (
            <div className="form-group">
              <label>Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleFilter();
                  }
                }}
                placeholder="Name, ID, or Email"
              />
            </div>
          )}
          <div className="form-group">
            <label>Department</label>
            <select name="department" value={filters.department} onChange={handleChange}>
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleChange}>
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={handleFilter}>
            Generate Report
          </button>
          <button className="btn btn-success" onClick={handleExport}>
            Export to CSV
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Report Data</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <p style={{ marginBottom: '15px' }}>
              <strong>Total Records:</strong> {allAttendance.length}
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Date</th>
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
                        <td>{record.employee_id}</td>
                        <td>{record.name}</td>
                        <td>{record.email}</td>
                        <td>{record.department || 'N/A'}</td>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>{record.check_in_time ? new Date(record.check_in_time).toLocaleString() : '-'}</td>
                        <td>{record.check_out_time ? new Date(record.check_out_time).toLocaleString() : '-'}</td>
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
                      <td colSpan="9" style={{ textAlign: 'center' }}>No attendance records found for the selected criteria</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;

