import axios from "axios";

//this match where your backend is running
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// images and all --> axios instance for multipart/form-data
const multiPartApi = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Longer timeout for uploads
  headers: {
    "Content-Type": "multipart/form-data", // Important for file uploads
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add interceptor for multipart requests too
multiPartApi.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response;
  },

  register: async (userData) => {
    // Make sure userData contains: name, email, password, role
    const dataToSend = {
      ...userData,
      role: userData.role || "reader", // default role
    };
    console.log("Registration data:", dataToSend);
    const response = await api.post("/auth/register", dataToSend);
    return response;
  },

  logout: () => {
    console.log("Clearing auth data from storage..."); // For debugging
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

// Post service
export const postService = {
  // Modify this function
  getPosts: async (params = {}) => {
    // Default page and limit if not provided
    const page = params.page || 1;
    const limit = params.limit || 10;

    // Build query string from params object
    const queryParts = [`page=${page}`, `limit=${limit}`];
    if (params.search)
      queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.category)
      queryParts.push(`category=${encodeURIComponent(params.category)}`);
    if (params.tag) queryParts.push(`tag=${encodeURIComponent(params.tag)}`);
    if (params.sort) queryParts.push(`sort=${encodeURIComponent(params.sort)}`);

    const queryString = queryParts.join("&");
    console.log("API Request URL:", `/posts?${queryString}`);
    return await api.get(`/posts?${queryString}`);
  },

  getPostById: async (id) => {
    return await api.get(`/posts/${id}`);
  },

  createPost: async (postData) => {
    return await api.post(`/posts`, postData);
  },

  updatePost: async (id, postData) => {
    return await api.put(`/posts/${id}`, postData);
  },

  deletePost: async (id) => {
    return await api.delete(`/posts/${id}`);
  },

  getPostMetadata: () => api.get("/posts/metadata"),
};

export const commentService = {
  getComments: async (postId, page = 1, limit = 10) => {
    return await api.get(
      `/comments/post/${postId}?page=${page}&limit=${limit}`
    );
  },

  createComment: async (commentData) => {
    const { postId, content, parentId } = commentData;
    return await api.post(`/comments/post/${postId}`, {
      content,
      parentId,
    });
  },

  updateComment: async (id, commentData) => {
    return await api.put(`/comments/${id}`, commentData);
  },

  deleteComment: async (id) => {
    return await api.delete(`/comments/${id}`);
  },
};

// User service
export const userService = {
  getProfile: async () => {
    return await api.get(`/users/profile`);
  },

  updateProfile: async (userData) => {
    return await api.put(`/users/profile`, userData);
  },

  getUserById: async (id) => {
    return await api.get(`/users/${id}`);
  },
};

// Fix the image service with correct API paths
export const imageService = {
  // Use the multiPartApi instance for file uploads
  uploadProfileImage: async (formData) => {
    return await multiPartApi.post("/images/upload/profile", formData);
  },

  uploadPostImage: async (formData) => {
    return await multiPartApi.post("/images/upload/post", formData);
  },

  deleteImage: async (public_id) => {
    return await api.delete("/images/delete", { data: { public_id } });
  },
};

export default {
  authService,
  postService,
  commentService,
  userService,
  imageService,
};
