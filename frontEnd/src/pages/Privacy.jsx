import { Link } from "react-router-dom";
import { FiArrowLeft, FiArrowUpRight, FiLock, FiShield } from "react-icons/fi";
import "../styles/legal-pages.css";

const sectionLinks = [
  "Introduction",
  "Information We Collect",
  "How We Use Your Information",
  "Data Sharing & Security",
  "Your Rights",
  "Third-Party Links",
  "Changes to This Policy",
  "Contact Us",
];

export default function Privacy() {
  return (
    <main className="iv-legal">
      <div className="iv-legal-container">
        <Link className="iv-legal-back" to="/about-us"><FiArrowLeft size={15} aria-hidden="true" /> About Innovest</Link>
        <header className="iv-legal-hero">
          <div>
            <p className="iv-legal-eyebrow"><span aria-hidden="true" /> INNOVEST POLICIES</p>
            <h1>Privacy <em>Policy.</em></h1>
            <p>Last updated: June 5, 2025</p>
          </div>
          <span className="iv-legal-hero-icon" aria-hidden="true"><FiShield size={30} /></span>
        </header>
        <div className="iv-legal-layout">
          <aside className="iv-legal-sidebar">
            <nav aria-label="Privacy policy sections">
              <h2>ON THIS PAGE</h2>
              <ol>{sectionLinks.map((label, index) => <li key={label}><a href={`#privacy-${index + 1}`}><span>{String(index + 1).padStart(2, "0")}</span> {label}</a></li>)}</ol>
            </nav>
            <div className="iv-legal-sidebar-note"><FiLock size={18} aria-hidden="true" /><p>Questions about your information?</p><Link to="/help">Contact the team <FiArrowUpRight size={14} aria-hidden="true" /></Link></div>
          </aside>
          <div className="iv-legal-paper">
            <section id="privacy-1">
              <h2>1. Introduction</h2>
              <p>Welcome to Innovest. Your privacy is critically important to us. This Privacy Policy describes how we collect, use, and protect your personal information when you interact with our platform.</p>
            </section>
            <section id="privacy-2">
              <h2>2. Information We Collect</h2>
              <ul>
                <li><strong>Personal Information:</strong> Name, email, phone number, company details, etc.</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent on site, device type, browser, etc.</li>
                <li><strong>Communication Data:</strong> Messages, inquiries, or feedback submitted through our platform.</li>
              </ul>
            </section>
            <section id="privacy-3">
              <h2>3. How We Use Your Information</h2>
              <p>We use the collected data to:</p>
              <ul>
                <li>Match startups with suitable investors</li>
                <li>Improve our platform functionality and user experience</li>
                <li>Send updates, insights, and relevant communications</li>
                <li>Respond to inquiries and provide customer support</li>
              </ul>
            </section>
            <section id="privacy-4">
              <h2>4. Data Sharing &amp; Security</h2>
              <p>We do not sell your personal data. Information may be shared with partners or service providers strictly for the purposes outlined above. We employ modern security measures to protect your data from unauthorized access or disclosure.</p>
            </section>
            <section id="privacy-5">
              <h2>5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access or correct your personal data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>
            <section id="privacy-6">
              <h2>6. Third-Party Links</h2>
              <p>Our platform may contain links to third-party websites. We are not responsible for the content or privacy practices of those sites.</p>
            </section>
            <section id="privacy-7">
              <h2>7. Changes to This Policy</h2>
              <p>We may update our Privacy Policy from time to time. We encourage users to review this page periodically for any changes.</p>
            </section>
            <section id="privacy-8">
              <h2>8. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, feel free to contact us.</p>
              <Link className="iv-legal-contact-link" to="/help">Help &amp; contact <FiArrowUpRight size={15} aria-hidden="true" /></Link>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
