import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config/api';

export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/attendance/checkin`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Check-in failed');
    }
  }
);

export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/attendance/checkout`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Check-out failed');
    }
  }
);

export const getTodayStatus = createAsyncThunk(
  'attendance/getTodayStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/attendance/today`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get today status');
    }
  }
);

export const getMyHistory = createAsyncThunk(
  'attendance/getMyHistory',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/attendance/my-history`, {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get history');
    }
  }
);

export const getMySummary = createAsyncThunk(
  'attendance/getMySummary',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/attendance/my-summary`, {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get summary');
    }
  }
);

export const getAllAttendance = createAsyncThunk(
  'attendance/getAllAttendance',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/attendance/all`, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get attendance');
    }
  }
);

export const getTodayStatusAll = createAsyncThunk(
  'attendance/getTodayStatusAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/attendance/today-status`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get today status');
    }
  }
);

export const exportAttendance = createAsyncThunk(
  'attendance/export',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/attendance/export`, {
        params: filters,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with date range
      let filename = 'attendance';
      if (filters.startDate && filters.endDate) {
        const startDateStr = filters.startDate.replace(/-/g, '');
        const endDateStr = filters.endDate.replace(/-/g, '');
        filename = `attendance_${startDateStr}_to_${endDateStr}.csv`;
      } else if (filters.startDate) {
        const startDateStr = filters.startDate.replace(/-/g, '');
        filename = `attendance_from_${startDateStr}.csv`;
      } else if (filters.endDate) {
        const endDateStr = filters.endDate.replace(/-/g, '');
        filename = `attendance_until_${endDateStr}.csv`;
      } else {
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
        filename = `attendance_${today}.csv`;
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return 'Export successful';
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Export failed');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    todayStatus: null,
    myHistory: [],
    mySummary: null,
    allAttendance: [],
    todayStatusAll: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.loading = false;
        state.todayStatus = action.payload.attendance;
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.loading = false;
        state.todayStatus = action.payload.attendance;
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTodayStatus.fulfilled, (state, action) => {
        state.todayStatus = action.payload;
      })
      .addCase(getMyHistory.fulfilled, (state, action) => {
        state.myHistory = action.payload;
      })
      .addCase(getMySummary.fulfilled, (state, action) => {
        state.mySummary = action.payload;
      })
      .addCase(getAllAttendance.fulfilled, (state, action) => {
        state.allAttendance = action.payload;
      })
      .addCase(getTodayStatusAll.fulfilled, (state, action) => {
        state.todayStatusAll = action.payload;
      });
  },
});

export const { clearError } = attendanceSlice.actions;
export default attendanceSlice.reducer;

