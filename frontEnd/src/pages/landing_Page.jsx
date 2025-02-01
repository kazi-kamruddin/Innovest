import React from 'react';
import './landing_Page.css';


function LandingPage() {
  return (
    <>
      {/* Navbar Section */}
      <nav className="navbar">
        <div className="logo">
          <a href="#">Innovest</a>
        </div>
        <div className="nav-container">
        <ul className="nav-links">
          <li>
            <a href="#">Invest</a>
            <a href="#">Fundraise</a>
            <a href="#">Help</a>
            <a href="#">Contact</a>
          </li>
        </ul>
        <div className="auth-links">
           <a href="#">Login</a>
          <a href="#">Sign-Up</a>
        </div>
        </div>
      </nav>

      {/* Banner */}
      <div className="hero">
        <div className="hero-content">
          <h1>Connecting Investors and Innovation together here in Innovest</h1>
          <p>Where great businesses and great people meet. We bring together businesses looking for investment and investors with capital,contacts and knowledge to help them succeed.</p>
          <div className="hero-buttons">
          <button className="btn secondary">Get Started →</button>
          </div>
        </div>
        <div className="hero-image">
          <img src="src/images/first.png" alt="Hero Section Image" />
        </div>
      </div>
      
      {/* <!-- investment Future --> */}
    <div className="future">
        <section className="blockchain-section">
          <h1>Innovest: The Foundation of the Future</h1>
          <p>
          Innovest is more than just a platform—it's the foundation where groundbreaking ideas transform into successful ventures.<br/> By bridging the gap between ambitious entrepreneurs and visionary investors, we create an ecosystem where innovation thrives and opportunities flourish.
          </p>
          <div className="future-container">
            <div className="future-card">
              <div className="image-container">
                <img src="src/images/future1.jpeg" alt="Image 1" class="image-placeholder"/>
              </div>
              <div className="description-container">
                <p className="description">
                Empowering businesses to grow, expand, and thrive globally.
                </p>
              </div>
            </div>
            <div className="future-card">
              <div className="image-container">
                <img src="src/images/future2.jpeg" alt="Image 2" class="image-placeholder"/>
              </div>
              <div className="description-container">
                <p className="description">
                A thriving network of entrepreneurs, investors, and industry leaders.
                </p>            
              </div>
            </div>
            <div className="future-card">
              <div className="image-container">
                <img src="src/images/future3.jpeg" alt="Image 3" class="image-placeholder"/>
              </div>
              <div className="description-container">
                <p className="description">
                Connecting startups with capital, mentorship, and opportunities.
                </p>      
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* <!-- Our clients --> */}
    <div className="client">
        <div className="client-content">
            <h2>Our Clients</h2>
            <p>We have been working with some Fortune 300+ clients</p>
        </div>
        <div class="client-logos">
            <img src="src/images/logo1.jpg" alt="Client Logo 1" />
            <img src="src/images/logo2.jpeg" alt="Client Logo 2" />
            <img src="src/images/logo3.jpg" alt="Client Logo 3" />
            <img src="src/images/logo4.jpeg" alt="Client Logo 4" />
            <img src="src/images/logo5.jpeg" alt="Client Logo 5" />
        </div>
    </div>
    
    {/* <!-- power of investment --> */}
     <div className="power">
    <div className="power-content">
        <div className="header">Explore the Power of Investment</div>
        <div className="sub-header">Who can benefit from investment?</div>

        <div className="cards">
            <div className="card">
                <img src="src/images/power1.jpg" alt="power logo 1" />
                <div className="card-title">Creator Communities</div>
                <div className="card-text">Support creators with multiple marketplaces and direct engagement with their audience.</div>
            </div>

            <div className="card">
                <img src="src/images/power2.jpeg" alt="power logo 2" />
                <div className="card-title">Financial Institutions</div>
                <div className="card-text">technology enables secure,fast and advanced financial transactions.</div>
            </div>

            <div className="card">
                <img src="src/images/power3.jpg" alt="power logo 3" />
                <div className="card-title">Supply Chain Management</div>
                <div className="card-text">Enhance traceability, transparency, and operational efficiency across global supply chains.</div>
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Footer --> */}
    <footer className="footer">
      <div className="footer-container">
       <div className="footer-section">
          <h3>Innovest</h3>
         <p>Copyright © 2020 Landify UI Kit.<br/>All rights reserved</p>
        <div className="social-icons">
          <img src="src/images/footer.jpeg" alt="Facebook"/>
          <img src="src/images/footer2.jpeg" alt="Instagram"/>
          <img src="src/images/footer3.jpeg" alt="Twitter"/>
        </div>
      </div>
      <div className="footer-section">
        <h3>Company</h3>
        <ul>
          <li><a href="#">About us</a></li>
          <li><a href="#">Blog</a></li>
          <li><a href="#">Contact us</a></li>
          <li><a href="#">Pricing</a></li>
          <li><a href="#">Testimonials</a></li>
        </ul>
      </div>
      <div className="footer-section">
        <h3>Support</h3>
        <ul>
          <li><a href="#">Help center</a></li>
          <li><a href="#">Terms of service</a></li>
          <li><a href="#">Legal</a></li>
          <li><a href="#">Privacy policy</a></li>
          <li><a href="#">Status</a></li>
        </ul>
      </div>
      <div className="footer-section">
        <h3>Stay up to date</h3>
        <form className="newsletter">
          <input type="email" placeholder="Your email address"/>
          <button type="submit">→</button>
        </form>
       </div>
     </div>
   </footer>
    </>
  );
}

export default LandingPage;
