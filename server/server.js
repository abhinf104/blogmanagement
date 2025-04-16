const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/mongodb.js");
const connectCloudinary = require("./config/cloudinary.js");
const path = require("path");
require("dotenv").config();
// // Add this import for network interface information
// const os = require("os");

const authRouter = require("./routes/auth-routes");
const userRouter = require("./routes/user-routes");
const postRouter = require("./routes/post-routes");
const imageRouter = require("./routes/image-routes");
const commentRouter = require("./routes/comment-routes");
const notFound = require("./middlewares/not-found");

//for parsing cookie into json
const cookieParser = require("cookie-parser");
// app config
const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4000",
  "http://localhost:5173",
  process.env.CLIENT_ORIGIN || "https://your-vercel-app-name.vercel.app",
];
// No need to redefine __dirname as it's already available in CommonJS

// Create HTTP server using Express app
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle joining a post's room
  socket.on("joinPost", (postId) => {
    socket.join(`post_${postId}`);
    console.log(`Socket ${socket.id} joined post_${postId}`);
  });

  // Handle leaving a post's room
  socket.on("leavePost", (postId) => {
    socket.leave(`post_${postId}`);
    console.log(`Socket ${socket.id} left post_${postId}`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// middlewares
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./public"));

//creating routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/images", imageRouter);
app.use("/api/comments", commentRouter);

if (process.env.NODE_ENV === "production") {
  const frontendPath = path.resolve(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));

  app.get("*", (req, res, next) => {
    // This should not match API routes - move this after your API routes
    if (!req.path.startsWith("/api") && !req.path.startsWith("/socket.io")) {
      res.sendFile(path.join(frontendPath, "index.html"));
    } else {
      // Let the request continue to API routes
      next();
    }
  });
}

// handle all unknown routes
app.use(notFound);

const start = async () => {
  try {
    await connectDB();
    await connectCloudinary();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Server startup error:", error);
  }
};
start();
