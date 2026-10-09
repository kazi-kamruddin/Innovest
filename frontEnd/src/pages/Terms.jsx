import { Link } from "react-router-dom";
import { FiArrowLeft, FiArrowUpRight, FiFileText, FiMessageCircle } from "react-icons/fi";
import "../styles/legal-pages.css";

const sectionLinks = [
  "Introduction",
  "Services Offered",
  "User Responsibilities",
  "Intellectual Property",
  "Termination",
  "Limitation of Liability",
  "Changes to Terms",
  "Contact Us",
];

export default function Terms() {
  return (
    <main className="iv-legal">
      <div className="iv-legal-container">
        <Link className="iv-legal-back" to="/about-us"><FiArrowLeft size={15} aria-hidden="true" /> About Innovest</Link>
        <header className="iv-legal-hero">
          <div>
            <p className="iv-legal-eyebrow"><span aria-hidden="true" /> INNOVEST POLICIES</p>
            <h1>Terms of <em>Service.</em></h1>
            <p>Effective Date: June 5, 2025</p>
          </div>
          <span className="iv-legal-hero-icon" aria-hidden="true"><FiFileText size={30} /></span>
        </header>
        <div className="iv-legal-layout">
          <aside className="iv-legal-sidebar">
            <nav aria-label="Terms of service sections">
              <h2>ON THIS PAGE</h2>
              <ol>{sectionLinks.map((label, index) => <li key={label}><a href={`#terms-${index + 1}`}><span>{String(index + 1).padStart(2, "0")}</span> {label}</a></li>)}</ol>
            </nav>
            <div className="iv-legal-sidebar-note"><FiMessageCircle size={18} aria-hidden="true" /><p>Need clarification on these terms?</p><Link to="/help">Contact the team <FiArrowUpRight size={14} aria-hidden="true" /></Link></div>
          </aside>
          <div className="iv-legal-paper">
            <section id="terms-1">
              <h2>1. Introduction</h2>
              <p>Welcome to Innovest. By accessing or using our platform, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not use our services.</p>
            </section>
            <section id="terms-2">
              <h2>2. Services Offered</h2>
              <p>Innovest connects entrepreneurs with potential investors by offering tools for showcasing ideas, tracking investor engagement, and facilitating communication. We are not a financial advisor and do not guarantee funding outcomes.</p>
            </section>
            <section id="terms-3">
              <h2>3. User Responsibilities</h2>
              <ul>
                <li>You must be 18 years or older to use our platform.</li>
                <li>Provide accurate and complete information during registration.</li>
                <li>Do not use the platform for unlawful or fraudulent purposes.</li>
              </ul>
            </section>
            <section id="terms-4">
              <h2>4. Intellectual Property</h2>
              <p>All content, branding, logos, and software provided on Innovest are the property of Innovest or its licensors and are protected by applicable intellectual property laws.</p>
            </section>
            <section id="terms-5">
              <h2>5. Termination</h2>
              <p>We reserve the right to suspend or terminate your access to our platform at any time, with or without notice, for any reason, including violation of these terms.</p>
            </section>
            <section id="terms-6">
              <h2>6. Limitation of Liability</h2>
              <p>Innovest is not liable for any direct or indirect losses or damages resulting from the use of our services, including investment outcomes or business partnerships.</p>
            </section>
            <section id="terms-7">
              <h2>7. Changes to Terms</h2>
              <p>We may update these Terms of Service from time to time. Continued use of the platform constitutes acceptance of any changes.</p>
            </section>
            <section id="terms-8">
              <h2>8. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us.</p>
              <Link className="iv-legal-contact-link" to="/help">Help &amp; contact <FiArrowUpRight size={15} aria-hidden="true" /></Link>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
