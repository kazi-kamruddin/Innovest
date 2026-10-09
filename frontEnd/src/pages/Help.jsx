import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { FiArrowRight, FiCheckCircle, FiMail, FiMessageCircle, FiSend, FiShield, FiUsers } from "react-icons/fi";
import "../styles/Help.css";

// Existing EmailJS identifiers are kept unchanged; this is a frontend-only redesign.
const SERVICE_ID = "service_n5cqc7b";
const TEMPLATE_ID = "template_ut54dtb";
const PUBLIC_KEY = "Dkjsq_4u5sEi_jOZm";

export default function Help() {
  const formRef = useRef(null);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function sendEmail(event) {
    event.preventDefault();
    if (sending || !formRef.current) return;
    setSending(true);
    setError("");
    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY);
      formRef.current?.reset();
      setSubmitted(true);
    } catch (err) {
      console.error("EmailJS Error:", err);
      setError("Your message couldn't be sent. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="iv-help">
      <div className="iv-help-container">
        <header className="iv-help-page-heading">
          <p className="iv-help-eyebrow"><span aria-hidden="true" /> WE'RE HERE TO HELP</p>
          <h1>Let's start a <em>conversation.</em></h1>
          <p>Have a question about Innovest? Send us a message and we'll be glad to hear from you.</p>
        </header>

        <div className="iv-help-layout">
          <section className="iv-help-form-card" aria-labelledby="iv-help-form-title">
            <div className="iv-help-card-heading">
              <span className="iv-help-card-icon" aria-hidden="true"><FiMail size={21} /></span>
              <div><h2 id="iv-help-form-title">Get in touch</h2><p>Tell us what you'd like to know.</p></div>
            </div>

            {submitted ? (
              <div className="iv-help-success" role="status">
                <span className="iv-help-success-icon" aria-hidden="true"><FiCheckCircle size={29} /></span>
                <h3>Message sent successfully.</h3>
                <p>Thank you for reaching out to Innovest. Your message has been submitted.</p>
                <button type="button" className="iv-help-button iv-help-button--outline" onClick={() => { setSubmitted(false); setError(""); }}>
                  Send another message <FiArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={sendEmail} className="iv-help-form">
                <label className="iv-help-field" htmlFor="iv-help-name">
                  <span>Your name <b aria-hidden="true">*</b></span>
                  <input id="iv-help-name" name="name" type="text" autoComplete="name" placeholder="Enter your name" maxLength={120} required />
                </label>
                <label className="iv-help-field" htmlFor="iv-help-email">
                  <span>Email address <b aria-hidden="true">*</b></span>
                  <input id="iv-help-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required />
                </label>
                <label className="iv-help-field" htmlFor="iv-help-message">
                  <span>Your message <b aria-hidden="true">*</b></span>
                  <textarea id="iv-help-message" name="message" rows={6} placeholder="How can we help?" required />
                </label>
                {error && <p className="iv-help-form-error" role="alert">{error}</p>}
                <button className="iv-help-button iv-help-button--solid" type="submit" disabled={sending}>
                  <FiSend size={16} aria-hidden="true" /> {sending ? "Sending message..." : "Send message"}
                  {!sending && <FiArrowRight size={16} aria-hidden="true" />}
                </button>
                <p className="iv-help-form-note">Your message is sent through Innovest's existing contact form service.</p>
              </form>
            )}
          </section>

          <aside className="iv-help-side">
            <div className="iv-help-visual" aria-hidden="true">
              <div className="iv-help-visual-ring iv-help-visual-ring--outer" />
              <div className="iv-help-visual-ring iv-help-visual-ring--inner" />
              <div className="iv-help-visual-center"><FiMessageCircle size={36} /></div>
              <span className="iv-help-visual-chip iv-help-visual-chip--a"><FiUsers size={16} /> Connect</span>
              <span className="iv-help-visual-chip iv-help-visual-chip--b"><FiCheckCircle size={16} /> Reach out</span>
            </div>
            <div className="iv-help-side-copy">
              <span className="iv-help-side-kicker"><FiShield size={14} aria-hidden="true" /> CONTACT INNOVEST</span>
              <h2>Every good connection starts somewhere.</h2>
              <p>Whether you're exploring an idea or need help with the platform, use the form to share your question with the team.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
