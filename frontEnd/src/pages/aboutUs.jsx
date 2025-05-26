import { useState } from 'react';
import '../styles/about-us.css';

import sakib from '../assets/sakib.jpg';
import sumit from '../assets/sumit.jpg';
import sadik from '../assets/sadik.jpg';
import kazi from '../assets/kazi.jpg';

export default function AboutUs() {
  const [teamMembers, setTeamMembers] = useState([
    { name: 'Kazi Kamruddin', position: 'Chief Executive Officer', image: kazi },
    { name: 'Sadik Rahman', position: 'Legal Advisor', image: sadik },
    { name: 'Sumit Majumder', position: 'Adoption Counselor', image: sumit },
    { name: 'Abdullah Ishtiaq', position: 'Marketing Manager', image: sakib },
  ]);

  return (
    <div className="about-us-container">
      <h2 className="about-us-section-dev-title">Our Dev Team</h2>
      <div className="about-us-gallery">
        {teamMembers.map((member, index) => (
          <figure className="about-us-card" key={index}>
            <img src={member.image} alt={`${member.name}'s portrait`} className="about-us-card-image" />
            <figcaption className="about-us-overlay-text">
              <h3 className="about-us-team-name">{member.name}</h3>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="about-us-section-container">
            <h2 className="about-us-section-title">Our Mission</h2>
            <p className="about-us-section-text">
                At Innovest, our mission is to bridge the gap between visionary entrepreneurs and forward-thinking investors. 
                We strive to empower startups and businesses by providing a seamless platform where innovative ideas meet 
                the right funding opportunities. Through collaboration, insights, and data-driven decision-making, 
                we aim to foster an ecosystem of growth, success, and strategic partnerships.
            </p>
            </div>

            <div className="about-us-section-container">
            <h2 className="about-us-section-title">Our History</h2>
            <p className="about-us-section-text">
                Innovest was founded with the goal of revolutionizing the way entrepreneurs connect with investors. 
                Recognizing the challenges startups face in securing funding, we built a platform that simplifies and enhances 
                the investment process. Over time, we have grown into a trusted space for entrepreneurs, angel investors, 
                venture capitalists, and business consultants. With continuous innovation and a commitment to transparency, 
                Innovest has become a hub for fostering groundbreaking ideas and meaningful financial partnerships.
            </p>
            </div>
      </div>
  );
}
