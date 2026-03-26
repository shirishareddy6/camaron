import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    toasts: [],
  },
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar(state, action) {
      state.sidebarOpen = action.payload;
    },
    addToast(state, action) {
      state.toasts.push({
        id: Date.now(),
        type: 'info',
        duration: 4000,
        ...action.payload,
      });
    },
    removeToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { toggleSidebar, setSidebar, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;

export const selectToasts      = (s) => s.ui.toasts;
export const selectSidebarOpen = (s) => s.ui.sidebarOpen;
