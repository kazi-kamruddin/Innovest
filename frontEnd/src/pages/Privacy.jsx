import React from "react";
import "../styles/Privacy.css";

const Privacy = () => {
  return (
    <div className="privacy-policy">
      <div className="privacy-container">
        <h1>Privacy Policy</h1>
        <p>Last updated: June 5, 2025</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to Innovest. Your privacy is critically important to us. This Privacy Policy describes how we collect, use, and protect your personal information when you interact with our platform.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <ul>
            <li><strong>Personal Information:</strong> Name, email, phone number, company details, etc.</li>
            <li><strong>Usage Data:</strong> Pages visited, time spent on site, device type, browser, etc.</li>
            <li><strong>Communication Data:</strong> Messages, inquiries, or feedback submitted through our platform.</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the collected data to:</p>
          <ul>
            <li>Match startups with suitable investors</li>
            <li>Improve our platform functionality and user experience</li>
            <li>Send updates, insights, and relevant communications</li>
            <li>Respond to inquiries and provide customer support</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Sharing & Security</h2>
          <p>
            We do not sell your personal data. Information may be shared with partners or service providers strictly for the purposes outlined above. We employ modern security measures to protect your data from unauthorized access or disclosure.
          </p>
        </section>

        <section>
          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access or correct your personal data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2>6. Third-Party Links</h2>
          <p>
            Our platform may contain links to third-party websites. We are not responsible for the content or privacy practices of those sites.
          </p>
        </section>

        <section>
          <h2>7. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We encourage users to review this page periodically for any changes.
          </p>
        </section>

        <section>
          <h2>8. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, feel free to contact us.</p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
