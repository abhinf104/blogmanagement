import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import SinglePost from "./pages/SinglePost";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import BlogList from "./pages/BlogList";
import EditProfile from "./pages/EditProfile";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="app">
          <Navbar />
          <main className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/blog" element={<BlogList />} />

              <Route path="/posts/:id" element={<SinglePost />} />

              {/* Protected routes - require authentication */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/edit" element={<EditProfile />} />{" "}
              </Route>

              {/* Author/Admin only routes */}
              <Route
                element={<ProtectedRoute allowedRoles={["author", "admin"]} />}
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/posts/create" element={<CreatePost />} />
                <Route path="/posts/edit/:id" element={<EditPost />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
