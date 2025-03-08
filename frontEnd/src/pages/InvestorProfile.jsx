import "../styles/investor_profile.css";
import { useLogout } from '../hooks/useLogout.jsx';
import { useAuthContext } from '../hooks/useAuthContext.jsx';

const InvestorProfile = () => {
  const profileImageUrl =
    "https://media.gq-magazine.co.uk/photos/5e96bf31013fff000829de0c/16:9/w_2560%2Cc_limit/GettyImages-1199899108.jpg";

  const { logout } = useLogout();
  const { user } = useAuthContext();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="container">
      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-row">
          <div className="profile-image">
            <img src={profileImageUrl} alt="Profile" />
          </div>
          <div className="profile-info">
            <h5 className="profile-name">Sadik Rahman</h5>
            <p className="profile-location">📍 Chittagong, Bangladesh</p>
            <ul className="profile-details">
              <li>• Joined August 25, 2022</li>
              <li>• Investment Range: $0 – $125,000</li>
              <li>• Currently invested in 5 projects</li>
              <li>• Social Media Links: N/A</li>
            </ul>
          </div>
          <button className="knock-button">Knock</button>
        </div>
      </div>

      {/* Additional Information */}
      <div className="info-section">
        {/* Areas of Interest */}
        <div className="info-card">
          <h5 className="card-title">Areas of Interest</h5>
          <div className="interest-grid">
            {[{ icon: "❤️", text: "Healthcare" },
              { icon: "🚌", text: "Transportation" },
              { icon: "💻", text: "Technology" }].map((item, index) => (
              <div className="interest-item" key={index}>
                <span className="interest-icon">{item.icon}</span>
                <p className="interest-text">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div className="info-card">
          <h5 className="card-title">About</h5>
          <p className="card-text">
            I am a passionate and driven investor dedicated to identifying and
            nurturing promising ventures. With a diverse portfolio spanning
            industries such as technology, healthcare, and transportation, I
            thrive on fostering innovation and growth. My investment philosophy
            is rooted in thorough research, strategic partnerships, and a
            commitment to long-term success. Based in Helsinki, Finland, I am
            always eager to connect with like-minded entrepreneurs and investors
            to explore new opportunities and drive positive change.
          </p>
        </div>
      </div>

      {user && (
        <div>
            <br /><br /><br />
            <span>logged in as {user.email} </span>
            <br /><br />
            <button onClick={handleLogout}>Log out</button>
        </div>
      )}
    </div>
  );
};

export default InvestorProfile;
