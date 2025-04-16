import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to BlogMaster</h1>
          <p className="hero-subtitle">
            Create, Manage, and Share Your Stories
          </p>
          <div className="hero-buttons">
            <Link to="/login" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/register" className="btn btn-outline">
              Sign Up
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
            alt="Blogging"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose BlogMaster?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Easy Content Creation</h3>
            <p>Create beautiful blog posts with our intuitive editor</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Analytics Dashboard</h3>
            <p>Track engagement and understand your audience</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>SEO Optimization</h3>
            <p>Improve visibility with built-in SEO tools</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Start Blogging?</h2>
        <p>Join thousands of content creators sharing their stories</p>
        <Link to="/register" className="btn btn-cta">
          Create Your Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>
          © 2025 BlogMaster from <strong>Abhinf104</strong> All rights reserved.
        </p>
      </footer>

      {/* CSS Styles */}
      <style jsx="true">{`
        .home-container {
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          max-width: 100%;
          overflow-x: hidden;
        }

        /* Hero Section */
        .hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4rem 2rem;
          background: linear-gradient(to right, #f8f9fa, #e9ecef);
          border-radius: 0 0 30px 30px;
        }

        .hero-content {
          flex: 1;
          max-width: 600px;
        }

        .hero h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #2d3748;
        }

        .hero-subtitle {
          font-size: 1.5rem;
          margin-bottom: 2rem;
          color: #4a5568;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
        }

        .hero-image {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-image img {
          max-width: 100%;
          height: auto;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        /* Features Section */
        .features {
          padding: 4rem 2rem;
          text-align: center;
          background-color: #fff;
        }

        .features h2 {
          font-size: 2.2rem;
          margin-bottom: 3rem;
          color: #2d3748;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          padding: 2rem;
          background-color: #f8f9fa;
          border-radius: 10px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #2d3748;
        }

        /* CTA Section */
        .cta-section {
          background-color: #4299e1;
          color: white;
          text-align: center;
          padding: 3rem 2rem;
          border-radius: 30px;
          margin: 2rem;
        }

        .cta-section h2 {
          font-size: 2.2rem;
          margin-bottom: 1rem;
        }

        .cta-section p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }

        /* Footer */
        .home-footer {
          text-align: center;
          padding: 2rem;
          background-color: #f8f9fa;
          margin-top: 2rem;
        }

        /* Buttons */
        .btn {
          display: inline-block;
          padding: 0.8rem 2rem;
          border-radius: 30px;
          font-weight: 600;
          text-decoration: none;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background-color: #4299e1;
          color: white;
          border: 2px solid #4299e1;
        }

        .btn-primary:hover {
          background-color: #3182ce;
          border-color: #3182ce;
          text-decoration: none;
        }

        .btn-outline {
          background-color: transparent;
          color: #4299e1;
          border: 2px solid #4299e1;
        }

        .btn-outline:hover {
          background-color: #ebf8ff;
          text-decoration: none;
        }

        .btn-cta {
          background-color: white;
          color: #4299e1;
          border: 2px solid white;
          font-size: 1.1rem;
          padding: 1rem 2.5rem;
        }

        .btn-cta:hover {
          background-color: transparent;
          color: white;
          text-decoration: none;
        }

        /* Responsive Styles */
        @media (max-width: 768px) {
          .hero {
            flex-direction: column;
            text-align: center;
            padding: 2rem 1rem;
          }

          .hero-content {
            margin-bottom: 2rem;
          }

          .hero-buttons {
            justify-content: center;
          }

          .hero h1 {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
