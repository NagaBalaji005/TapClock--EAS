// Utility functions for API calls
import axios from 'axios';
import { API_URL } from '../config/api';

/**
 * Fetch all employees from today's status
 * @returns {Promise<Array>} Array of unique employees
 */
export const fetchEmployees = async () => {
  try {
    const response = await axios.get(`${API_URL}/attendance/today-status`);
    const uniqueEmployees = [...new Map(response.data.map(emp => [emp.employee_id, emp])).values()];
    return uniqueEmployees;
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return [];
  }
};

/**
 * Fetch all departments from today's status
 * @returns {Promise<Array>} Sorted array of department names
 */
export const fetchDepartments = async () => {
  try {
    const response = await axios.get(`${API_URL}/attendance/today-status`);
    const deptSet = new Set(response.data.map(emp => emp.department).filter(Boolean));
    return Array.from(deptSet).sort();
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    return [];
  }
};


