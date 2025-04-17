import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Blogservice } from "../../services/api";

// Async thunks
export const fetchBlogs = createAsyncThunk(
  "blogs/fetchBlogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await Blogservice.getBlogs(params);
      return {
        Blogs: response.data.Blogs,
        totalBlogs: response.data.totalBlogs,
        numOfPages: response.data.numOfPages,
        currentPage: params.page || 1,
      };
    } catch (error) {
      console.error("fetchBlogs Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.msg || error.message || "Failed to fetch Blogs"
      );
    }
  }
);

export const fetchBlogById = createAsyncThunk(
  "blogs/fetchBlogById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await Blogservice.getPostById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch blog");
    }
  }
);

// FIX: Change function name to match import in components while keeping action type the same
export const createBlog = createAsyncThunk(
  "blogs/CreateBlog",
  async (blogData, { rejectWithValue }) => {
    try {
      const response = await Blogservice.CreateBlog(blogData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create blog"
      );
    }
  }
);

export const updateBlog = createAsyncThunk(
  "blogs/updateBlog",
  async ({ id, blogData }, { rejectWithValue }) => {
    try {
      const response = await Blogservice.updateBlog(id, blogData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update blog"
      );
    }
  }
);

export const deleteBlog = createAsyncThunk(
  "blogs/deleteBlog",
  async (id, { rejectWithValue }) => {
    try {
      await Blogservice.deleteBlog(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete blog");
    }
  }
);

// Initial state
const initialState = {
  Blogs: [],
  currentBlog: null,
  totalBlogs: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,
  categories: [],
  tags: [],
  filters: {
    category: "all",
    tags: [],
    sortBy: "newest",
  },
  currentBlogId: null, // Added for tracking current blog ID
};

const blogSlice = createSlice({
  name: "blogs",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearBlogError: (state) => {
      state.error = null;
    },
    setCurrentBlogId: (state, action) => {
      state.currentBlogId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.Blogs = action.payload.Blogs;
        state.totalBlogs = action.payload.totalBlogs;
        state.totalPages = action.payload.numOfPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single blog
      .addCase(fetchBlogById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBlog = action.payload.blog;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create blog
      .addCase(createBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.Blogs.unshift(action.payload.blog);
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update blog
      .addCase(updateBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBlog = action.payload.blog;

        // Update in the blogs list
        const index = state.Blogs.findIndex(
          (blog) => blog._id === action.payload.blog._id
        );
        if (index !== -1) {
          state.Blogs[index] = action.payload.blog;
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete blog
      .addCase(deleteBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.Blogs = state.Blogs.filter((blog) => blog._id !== action.payload);
        if (state.currentBlog && state.currentBlog._id === action.payload) {
          state.currentBlog = null;
        }
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, setPage, clearBlogError, setCurrentBlogId } =
  blogSlice.actions;
export default blogSlice.reducer;
