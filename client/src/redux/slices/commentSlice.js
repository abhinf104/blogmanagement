import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { commentService } from "../../services/api";

// Async thunks
export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async ({ postId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      console.log(`Fetching comments for post ${postId}, page ${page}`);

      // Add debug logs
      console.log(
        "Using commentService.getComments with URL:",
        `/comments/post/${postId}?page=${page}&limit=${limit}`
      );

      const response = await commentService.getComments(postId, page, limit);

      // Log the response data structure
      console.log("Comments API response:", response.data);

      return {
        comments: response.data.comments || [],
        totalComments: response.data.count || 0,
        postId,
        page,
      };
    } catch (error) {
      console.error("Error fetching comments:", error);
      return rejectWithValue(
        error.response?.data?.msg || "Failed to load comments"
      );
    }
  }
);

export const createComment = createAsyncThunk(
  "comments/createComment",
  async (commentData, { rejectWithValue }) => {
    try {
      const response = await commentService.createComment(commentData);
      return response.data.comment;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create comment");
    }
  }
);

export const updateComment = createAsyncThunk(
  "comments/updateComment",
  async ({ id, content }, { rejectWithValue }) => {
    try {
      const response = await commentService.updateComment(id, { content });
      return response.data.comment;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update comment");
    }
  }
);

export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async (id, { rejectWithValue }) => {
    try {
      await commentService.deleteComment(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete comment");
    }
  }
);

// Initial state
const initialState = {
  comments: [],
  totalComments: 0,
  currentPage: 1,
  loading: false,
  error: null,
  hasMore: true,
  currentPostId: null,
};

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearComments: (state) => {
      state.comments = [];
      state.totalComments = 0;
      state.currentPage = 1;
      state.hasMore = true;
      state.currentPostId = null;
    },
    addSocketComment: (state, action) => {
      // Add a new comment received from socket
      if (state.currentPostId === action.payload.postId) {
        // Add to beginning if it's a top-level comment
        if (!action.payload.parentId) {
          state.comments.unshift(action.payload);
          state.totalComments++;
        } else {
          // Add as a reply to parent comment
          const parentIndex = state.comments.findIndex(
            (c) => c._id === action.payload.parentId
          );
          if (parentIndex !== -1) {
            if (!state.comments[parentIndex].replies) {
              state.comments[parentIndex].replies = [];
            }
            state.comments[parentIndex].replies.push(action.payload);
            state.totalComments++;
          }
        }
      }
    },
    updateSocketComment: (state, action) => {
      // Update a comment received from socket
      const { _id, content, isEdited } = action.payload;
      const commentIndex = state.comments.findIndex((c) => c._id === _id);
      if (commentIndex !== -1) {
        state.comments[commentIndex].content = content;
        state.comments[commentIndex].isEdited = isEdited;
      } else {
        // Check in replies
        state.comments.forEach((comment) => {
          if (comment.replies) {
            const replyIndex = comment.replies.findIndex((r) => r._id === _id);
            if (replyIndex !== -1) {
              comment.replies[replyIndex].content = content;
              comment.replies[replyIndex].isEdited = isEdited;
            }
          }
        });
      }
    },
    deleteSocketComment: (state, action) => {
      // Remove a comment received from socket
      const commentId = action.payload;
      const commentIndex = state.comments.findIndex((c) => c._id === commentId);
      if (commentIndex !== -1) {
        state.comments.splice(commentIndex, 1);
        state.totalComments--;
      } else {
        // Check in replies
        state.comments.forEach((comment) => {
          if (comment.replies) {
            const replyIndex = comment.replies.findIndex(
              (r) => r._id === commentId
            );
            if (replyIndex !== -1) {
              comment.replies.splice(replyIndex, 1);
              state.totalComments--;
            }
          }
        });
      }
    },
    setCurrentPostId: (state, action) => {
      state.currentPostId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;

        // If this is a new post or page 1, replace comments
        if (
          state.currentPostId !== action.payload.postId ||
          action.payload.page === 1
        ) {
          state.comments = action.payload.comments;
          state.currentPage = 1;
        } else {
          // Append comments for pagination
          state.comments = [...state.comments, ...action.payload.comments];
          state.currentPage = action.payload.page;
        }

        state.totalComments = action.payload.totalComments;
        state.hasMore = action.payload.comments.length === 10; // Assuming limit is 10
        state.currentPostId = action.payload.postId;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create comment
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;

        if (!action.payload.parentId) {
          state.comments.unshift(action.payload);
        } else {
          const parentIndex = state.comments.findIndex(
            (c) => c._id === action.payload.parentId
          );
          if (parentIndex !== -1) {
            if (!state.comments[parentIndex].replies) {
              state.comments[parentIndex].replies = [];
            }
            state.comments[parentIndex].replies.push(action.payload);
          }
        }

        state.totalComments++;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update comment
      .addCase(updateComment.fulfilled, (state, action) => {
        const { _id, content, isEdited } = action.payload;
        const commentIndex = state.comments.findIndex((c) => c._id === _id);

        if (commentIndex !== -1) {
          state.comments[commentIndex].content = content;
          state.comments[commentIndex].isEdited = isEdited;
        } else {
          // Check in replies
          state.comments.forEach((comment) => {
            if (comment.replies) {
              const replyIndex = comment.replies.findIndex(
                (r) => r._id === _id
              );
              if (replyIndex !== -1) {
                comment.replies[replyIndex].content = content;
                comment.replies[replyIndex].isEdited = isEdited;
              }
            }
          });
        }
      })

      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const commentId = action.payload;
        const commentIndex = state.comments.findIndex(
          (c) => c._id === commentId
        );

        if (commentIndex !== -1) {
          state.comments.splice(commentIndex, 1);
          state.totalComments--;
        } else {
          // Check in replies
          state.comments.forEach((comment) => {
            if (comment.replies) {
              const replyIndex = comment.replies.findIndex(
                (r) => r._id === commentId
              );
              if (replyIndex !== -1) {
                comment.replies.splice(replyIndex, 1);
                state.totalComments--;
              }
            }
          });
        }
      });
  },
});

export const {
  clearComments,
  addSocketComment,
  updateSocketComment,
  deleteSocketComment,
  setCurrentPostId,
} = commentSlice.actions;

export default commentSlice.reducer;
