import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, getMe } from '../store/slices/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    address: '',
    workLocation: '',
    dateOfJoining: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        contactNumber: user.contactNumber || '',
        address: user.address || '',
        workLocation: user.workLocation || '',
        dateOfJoining: user.dateOfJoining ? user.dateOfJoining.split('T')[0] : '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateProfile(formData));
    if (!result.error) {
      setIsEditing(false);
      dispatch(getMe()); // Refresh user data
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name || '',
        contactNumber: user.contactNumber || '',
        address: user.address || '',
        workLocation: user.workLocation || '',
        dateOfJoining: user.dateOfJoining ? user.dateOfJoining.split('T')[0] : '',
      });
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>My Profile</h1>
        {!isEditing && (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                style={{ backgroundColor: '#f5f5f5' }}
              />
            </div>
            <div className="form-group">
              <label>Employee ID</label>
              <input
                type="text"
                value={user?.employeeId}
                disabled
                style={{ backgroundColor: '#f5f5f5' }}
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input
                type="text"
                value={user?.role}
                disabled
                style={{ backgroundColor: '#f5f5f5' }}
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                value={user?.department || 'N/A'}
                disabled
                style={{ backgroundColor: '#f5f5f5' }}
              />
            </div>
            <div className="form-group">
              <label>Date of Joining</label>
              <input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div className="form-group">
              <label>Work Location</label>
              <input
                type="text"
                name="workLocation"
                value={formData.workLocation}
                onChange={handleChange}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <table className="table" style={{ maxWidth: '800px' }}>
            <tbody>
              <tr>
                <td style={{ width: '200px' }}><strong>Full Name</strong></td>
                <td>{user?.name}</td>
              </tr>
              <tr>
                <td><strong>Employee ID</strong></td>
                <td>{user?.employeeId}</td>
              </tr>
              <tr>
                <td><strong>Email</strong></td>
                <td>{user?.email}</td>
              </tr>
              <tr>
                <td><strong>Role</strong></td>
                <td>
                  <span className={`badge badge-${user?.role === 'manager' ? 'info' : 'success'}`}>
                    {user?.role}
                  </span>
                </td>
              </tr>
              <tr>
                <td><strong>Department</strong></td>
                <td>{user?.department || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Date of Joining</strong></td>
                <td>{user?.dateOfJoining ? new Date(user.dateOfJoining).toLocaleDateString() : 'Not set'}</td>
              </tr>
              <tr>
                <td><strong>Contact Number</strong></td>
                <td>{user?.contactNumber || 'Not set'}</td>
              </tr>
              <tr>
                <td><strong>Address</strong></td>
                <td>{user?.address || 'Not set'}</td>
              </tr>
              <tr>
                <td><strong>Work Location</strong></td>
                <td>{user?.workLocation || 'Not set'}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Profile;
