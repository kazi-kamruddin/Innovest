import React, { useRef, useState } from "react";
import emailjs from "emailjs-com";
import "../styles/Help.css";
import contactImage from "../assets/contact.jpg";

const Help = () => {
  const form = useRef();
  const [submitted, setSubmitted] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_n5cqc7b",  
        "template_ut54dtb",      
        form.current,
        "Dkjsq_4u5sEi_jOZm"        
      )
      .then(
        () => {
          setSubmitted(true);
          e.target.reset(); 
        },
        (error) => {
          console.error("EmailJS Error:", error);
          alert("Something went wrong. Please try again.");
        }
      );
  };

  return (
    <div className="contact">
      <div className="contact-container">
        <div className="image-section">
          <img src={contactImage} alt="Contact Us" />
        </div>
        <div className="form-section">
          <h2>Contact Us</h2>
          {submitted ? (
            <p style={{ color: "green", fontWeight: "bold", textAlign: "center" }}>
              Thank you! Your message has been sent.
            </p>
          ) : (
            <form ref={form} onSubmit={sendEmail}>
              <div className="input-field">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" required />
              </div>
              <div className="input-field">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required />
              </div>
              <div className="input-field">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows="5" required />
              </div>
              <button type="submit" className="send-button">Send Message</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Help;
