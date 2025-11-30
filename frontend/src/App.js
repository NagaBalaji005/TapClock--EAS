import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import MarkAttendance from './pages/MarkAttendance';
import MyAttendanceHistory from './pages/MyAttendanceHistory';
import Profile from './pages/Profile';
import ManagerDashboard from './pages/ManagerDashboard';
import AllEmployeesAttendance from './pages/AllEmployeesAttendance';
import TeamCalendar from './pages/TeamCalendar';
import Reports from './pages/Reports';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(getMe());
    }
  }, [dispatch, token]);

  return (
    <div className="App">
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <EmployeeDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/mark-attendance"
          element={
            <PrivateRoute>
              <MarkAttendance />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-attendance"
          element={
            <PrivateRoute>
              <MyAttendanceHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/dashboard"
          element={
            <PrivateRoute role="manager">
              <ManagerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/attendance"
          element={
            <PrivateRoute role="manager">
              <AllEmployeesAttendance />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/calendar"
          element={
            <PrivateRoute role="manager">
              <TeamCalendar />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/reports"
          element={
            <PrivateRoute role="manager">
              <Reports />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;

