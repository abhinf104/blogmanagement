import { useSelector } from "react-redux";

export const useReduxSelectors = () => {
  // Auth selectors
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const authLoading = useSelector((state) => state.auth.loading);
  const authError = useSelector((state) => state.auth.error);

  // Posts selectors
  const posts = useSelector((state) => state.posts.posts);
  const currentPost = useSelector((state) => state.posts.currentPost);
  const postLoading = useSelector((state) => state.posts.loading);
  const postError = useSelector((state) => state.posts.error);
  const totalPages = useSelector((state) => state.posts.totalPages);
  const currentPage = useSelector((state) => state.posts.currentPage);
  const categories = useSelector((state) => state.posts.categories);
  const tags = useSelector((state) => state.posts.tags);
  const filters = useSelector((state) => state.posts.filters);

  // Comments selectors
  const comments = useSelector((state) => state.comments.comments);
  const commentLoading = useSelector((state) => state.comments.loading);
  const commentError = useSelector((state) => state.comments.error);
  const hasMoreComments = useSelector((state) => state.comments.hasMore);

  // UI selectors
  const notifications = useSelector((state) => state.ui.notifications);
  const viewMode = useSelector((state) => state.ui.viewMode);
  const isNavMenuOpen = useSelector((state) => state.ui.isNavMenuOpen);

  return {
    // Auth
    user,
    isAuthenticated,
    authLoading,
    authError,

    // Posts
    posts,
    currentPost,
    postLoading,
    postError,
    totalPages,
    currentPage,
    categories,
    tags,
    filters,

    // Comments
    comments,
    commentLoading,
    commentError,
    hasMoreComments,

    // UI
    notifications,
    viewMode,
    isNavMenuOpen,
  };
};

export default useReduxSelectors;
