# Blog Management System (MERN Stack)

## Project Overview

BlogMaster is a comprehensive blog management system built with the MERN stack (MongoDB, Express, React, Node.js). It enables authors to create, edit, and manage blog posts while providing readers with an engaging platform to discover content and interact through comments.

## Features

### User Authentication & Authorization

- **Multi-role system**: Reader, Author, and Admin roles with different permissions
- **JWT-based authentication** with secure storage
- **Protected routes** with role-based access control

### Blog Management

- **Rich content creation** with support for text, images, and formatting
- **Categories and tags** for content organization
- **Draft/Published status** for post management
- **Featured images** uploaded to Cloudinary

### User Experience

- **Responsive design** for all devices
- **Dynamic filtering** by categories and tags
- **Search functionality** to find relevant content
- **Pagination** for efficient content browsing
- **Grid and list view options** for content browsing

### Social Features

- **Nested comment system** with real-time updates via Socket.io
- **Comment threads** up to 3 levels deep
- **User profiles** with customizable information

## Tech Stack

### client

- **React 19** with functional components and hooks
- **Redux Toolkit** for state management
- **React Router v6** for navigation
- **Socket.io Client** for real-time features
- **Vite** for client build tooling
- **CSS-in-JSX** for component styling

### Backend

- **Node.js & Express** for API development
- **MongoDB & Mongoose** for data storage
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Multer & Cloudinary** for image handling
- **Express Validator** for input validation

## Installation

### Prerequisites

- Node.js (≥18.0.0)
- MongoDB account
- Cloudinary account

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/abhinf104/blogmanagement.git
   cd blogmanagement
   ```
2. Install dependencies

```bash
   # Install backend dependencies
   npm install

   # Install client dependencies
   cd client
   npm install
cd ..
```

3. Environment Configuration

- Create a .env file in the backend directory with the following:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_LIFETIME=1d
CLIENT_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

Create a .env file in the client directory with:

```bash
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

4. Run the application

# Run backend and client concurrently (development mode)

npm run dev

# In a separate terminal, run the client

cd client
npm run dev

5. Access the application

- client: http://localhost:5173
- Backend API: http://localhost:3000

## Project Structure

```markdown
blogmanagement/
├── server/ # Backend codebase
│ ├── config/ # Configuration files
│ ├── controllers/ # API controllers
│ ├── middlewares/ # Express middlewares
│ ├── models/ # Mongoose models
│ ├── routes/ # API routes
│ └── server.js # Entry point
├── client/ # client codebase
│ ├── public/ # Static files
│ ├── src/
│ │ ├── assets/ # Images, fonts, styles
│ │ ├── components/ # React components
│ │ ├── hooks/ # Custom hooks
│ │ ├── pages/ # Page components
│ │ ├── redux/ # Redux store and slices
│ │ │ └── slices/ # Redux slices
│ │ ├── services/ # API services
│ │ ├── App.jsx # Main component
│ │ └── main.jsx # Entry point
│ ├── index.html # HTML template
│ └── vite.config.js # Vite configuration
├── package.json
└── vercel.json # Vercel deployment configuration
```

## API Documentation

### Authentication Endpoints

- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login and get authentication token
- GET /api/auth/logout - Logout and clear token

### Posts Endpoints

- GET /api/posts - Get all posts with pagination and filters
- GET /api/posts/:id - Get a single post
- POST /api/posts - Create a new post (auth required)
- PUT /api/posts/:id - Update a post (auth required)
- DELETE /api/posts/:id - Delete a post (auth required)

### Comments Endpoints

- GET /api/comments/post/:postId - Get comments for a post
- POST /api/comments/post/:postId - Add a comment to a post (auth required)
- PUT /api/comments/:commentId - Update a comment (auth required)
- DELETE /api/comments/:commentId - Delete a comment (auth required)

### Users Endpoints

- GET /api/users/profile - Get current user profile (auth required)
- PUT /api/users/profile - Update user profile (auth required)
