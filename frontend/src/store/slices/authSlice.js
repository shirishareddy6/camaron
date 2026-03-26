import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../services/api';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const sendOTP = createAsyncThunk('auth/sendOTP', async (phone, { rejectWithValue }) => {
  try {
    await authApi.sendOTP(phone);
    return phone;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to send OTP');
  }
});

export const verifyOTP = createAsyncThunk('auth/verifyOTP', async ({ phone, otp }, { rejectWithValue }) => {
  try {
    const { data } = await authApi.verifyOTP(phone, otp);
    localStorage.setItem('accessToken',  data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Invalid OTP');
  }
});

export const refreshTokens = createAsyncThunk('auth/refresh', async (_, { rejectWithValue }) => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');
    const { data } = await authApi.refresh(refreshToken);
    localStorage.setItem('accessToken',  data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return data.data;
  } catch (err) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return rejectWithValue('Session expired');
  }
});

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  user:          null,
  accessToken:   localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  otpSent:       false,
  otpPhone:      null,
  loading:       false,
  error:         null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.otpSent = false;
      state.otpPhone = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    resetOtp(state) {
      state.otpSent = false;
      state.otpPhone = null;
    },
  },
  extraReducers: (builder) => {
    // sendOTP
    builder
      .addCase(sendOTP.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(sendOTP.fulfilled, (s, a) => { s.loading = false; s.otpSent = true; s.otpPhone = a.payload; })
      .addCase(sendOTP.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    // verifyOTP
    builder
      .addCase(verifyOTP.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(verifyOTP.fulfilled, (s, a) => {
        s.loading = false;
        s.accessToken = a.payload.accessToken;
        s.user = a.payload.user;
        s.isAuthenticated = true;
        s.otpSent = false;
      })
      .addCase(verifyOTP.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    // refresh
    builder
      .addCase(refreshTokens.fulfilled, (s, a) => {
        s.accessToken = a.payload.accessToken;
        s.user = a.payload.user;
        s.isAuthenticated = true;
      })
      .addCase(refreshTokens.rejected, (s) => {
        s.isAuthenticated = false;
        s.user = null;
        s.accessToken = null;
      });
  },
});

export const { logout, setUser, clearError, resetOtp } = authSlice.actions;
export default authSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAuth    = (s) => s.auth;
export const selectUser    = (s) => s.auth.user;
export const selectIsAuth  = (s) => s.auth.isAuthenticated;
export const selectRole    = (s) => s.auth.user?.role;
