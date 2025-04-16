import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService, userService } from "../../services/api"; // Import userService

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);

      // Store token based on "Remember me" preference
      if (credentials.rememberMe) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } else {
        sessionStorage.setItem("token", response.data.token);
        sessionStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch user profile");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  // The service function handles storage clearing
  await authService.logout();
});

// Thunk for updating user profile
export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async (userData, { getState, rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(userData);
      const updatedUser = response.data.user;

      // Update user data in storage if it exists
      const { rememberMe } = getState().auth; // Check if rememberMe was used
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("user", JSON.stringify(updatedUser));

      return { user: updatedUser }; // Return updated user data
    } catch (error) {
      console.error(
        "Update User Error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.msg || error.message || "Failed to update profile"
      );
    }
  }
);

// Initial state
const initialState = {
  user: JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  ),
  token:
    localStorage.getItem("token") || sessionStorage.getItem("token") || null,
  isAuthenticated: !!(
    localStorage.getItem("token") || sessionStorage.getItem("token")
  ),
  loading: false,
  error: null,
  registrationSuccess: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuthState: (state) => {
      state.error = null;
      state.registrationSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.registrationSuccess = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false; // <-- This is crucial
        state.loading = false;
        state.error = null;
      })

      // Handle updateUser pending, fulfilled, rejected
      .addCase(updateUser.pending, (state) => {
        state.loading = true; // You might want a different loading state for profile updates
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user; // Update user in Redux state
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        // Keep existing user data on failure, but set error
        state.error = action.payload || "Profile update failed";
      });
  },
});

export const { clearError, clearAuthState } = authSlice.actions;
export default authSlice.reducer;
