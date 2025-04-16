import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  notifications: [], // For toast notifications
  viewMode: "grid", // For post list view mode (grid/list)
  searchQuery: "",
  isNavMenuOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Add notification
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        type: action.payload.type || "info", // info, success, warning, error
        message: action.payload.message,
        duration: action.payload.duration || 2000,
      });
    },

    // Remove notification
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },

    // Set view mode (grid/list)
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },

    // Set search query
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },

    // Toggle navigation menu
    toggleNavMenu: (state) => {
      state.isNavMenuOpen = !state.isNavMenuOpen;
    },

    // Close navigation menu
    closeNavMenu: (state) => {
      state.isNavMenuOpen = false;
    },
  },
});

export const {
  addNotification,
  removeNotification,
  setViewMode,
  setSearchQuery,
  toggleNavMenu,
  closeNavMenu,
} = uiSlice.actions;

export default uiSlice.reducer;
