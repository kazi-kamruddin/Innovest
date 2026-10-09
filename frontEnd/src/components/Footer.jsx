import { Link } from "react-router-dom";
import { FiArrowUpRight, FiMapPin, FiPhoneCall, FiTrendingUp } from "react-icons/fi";
import "../styles/footer.css";

const exploreLinks = [
  { to: "/pitches", label: "Explore pitches" },
  { to: "/investor-list", label: "Investor directory" },
  { to: "/fundraise-dashboard", label: "Fundraise" },
  { to: "/investor-request", label: "Investor requests" },
];
const companyLinks = [
  { to: "/about-us", label: "About us" },
  { to: "/help", label: "Help & contact" },
  { to: "/privacy", label: "Privacy policy" },
  { to: "/terms", label: "Terms of service" },
];

export default function Footer() {
  return (
    <footer className="iv-footer">
      <div className="iv-footer-container">
        <div className="iv-footer-top">
          <div className="iv-footer-brand">
            <Link className="iv-footer-wordmark" to="/" aria-label="Innovest home">
              <span className="iv-footer-symbol" aria-hidden="true"><FiTrendingUp size={19} /></span>
              Innovest
            </Link>
            <p>Connecting entrepreneurs with investors, and promising ideas with new opportunities.</p>
            <Link className="iv-footer-discover" to="/about-us">
              Get to know us <FiArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <nav className="iv-footer-column" aria-label="Explore Innovest">
            <h2>Explore</h2>
            <ul>
              {exploreLinks.map(({ to, label }) => <li key={to}><Link to={to}>{label}</Link></li>)}
            </ul>
          </nav>

          <nav className="iv-footer-column" aria-label="Company and support">
            <h2>Company</h2>
            <ul>
              {companyLinks.map(({ to, label }) => <li key={to}><Link to={to}>{label}</Link></li>)}
            </ul>
          </nav>

          <div className="iv-footer-column iv-footer-contact">
            <h2>Contact</h2>
            <div className="iv-footer-contact-line">
              <FiMapPin size={17} aria-hidden="true" />
              <span>383/1 Modhubag, Nayatola Police Fari, Tejgaon, Dhaka</span>
            </div>
            <a className="iv-footer-contact-line" href="tel:+8801537477400">
              <FiPhoneCall size={16} aria-hidden="true" />
              <span>+880-1537-477400</span>
            </a>
          </div>
        </div>
        <div className="iv-footer-bottom">
          <p>© {new Date().getFullYear()} Innovest. All rights reserved.</p>
          <span>Ideas. Connections. Possibilities.</span>
        </div>
      </div>
    </footer>
  );
}
