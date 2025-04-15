function NotFound() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a
        href="/"
        style={{
          display: "inline-block",
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          background: "#4299e1",
          color: "white",
          textDecoration: "none",
          borderRadius: "4px",
        }}
      >
        Back to Home
      </a>
    </div>
  );
}

export default NotFound;
