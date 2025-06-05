import React from "react";
import "../styles/Terms.css";

const Terms = () => {
  return (
    <div className="terms-container">
      <div className="terms-header">
        <h1>Terms of Service</h1>
        <p>Effective Date: June 5, 2025</p>
      </div>

      <div className="terms-content">
        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to Innovest. By accessing or using our platform, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2>2. Services Offered</h2>
          <p>
            Innovest connects entrepreneurs with potential investors by offering tools for showcasing ideas, tracking investor engagement, and facilitating communication. We are not a financial advisor and do not guarantee funding outcomes.
          </p>
        </section>

        <section>
          <h2>3. User Responsibilities</h2>
          <ul>
            <li>You must be 18 years or older to use our platform.</li>
            <li>Provide accurate and complete information during registration.</li>
            <li>Do not use the platform for unlawful or fraudulent purposes.</li>
          </ul>
        </section>

        <section>
          <h2>4. Intellectual Property</h2>
          <p>
            All content, branding, logos, and software provided on Innovest are the property of Innovest or its licensors and are protected by applicable intellectual property laws.
          </p>
        </section>

        <section>
          <h2>5. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to our platform at any time, with or without notice, for any reason, including violation of these terms.
          </p>
        </section>

        <section>
          <h2>6. Limitation of Liability</h2>
          <p>
            Innovest is not liable for any direct or indirect losses or damages resulting from the use of our services, including investment outcomes or business partnerships.
          </p>
        </section>

        <section>
          <h2>7. Changes to Terms</h2>
          <p>
            We may update these Terms of Service from time to time. Continued use of the platform constitutes acceptance of any changes.
          </p>
        </section>

        <section>
          <h2>8. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
