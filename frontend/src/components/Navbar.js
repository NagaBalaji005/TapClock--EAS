import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isManager = user?.role === 'manager';

  return (
    <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
      {/* Left: TAP CLOCK */}
      <div>
        <Link 
          to={isManager ? "/manager/dashboard" : "/dashboard"} 
          style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            textDecoration: 'none',
            color: 'white'
          }}
        >
          TAP CLOCK
        </Link>
      </div>
      
      {/* Center: Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
        {!isManager && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/mark-attendance">Mark Attendance</Link>
            <Link to="/my-attendance">My Attendance</Link>
            <Link to="/profile">Profile</Link>
          </>
        )}
        {isManager && (
          <>
            <Link to="/manager/dashboard">Dashboard</Link>
            <Link to="/manager/attendance">All Attendance</Link>
            <Link to="/manager/calendar">Calendar</Link>
            <Link to="/manager/reports">Reports</Link>
            <Link to="/profile">Profile</Link>
          </>
        )}
      </div>
      
      {/* Right: User Info and Logout */}
      <div className="navbar-right">
        <span>Hello! {user?.name}</span>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

