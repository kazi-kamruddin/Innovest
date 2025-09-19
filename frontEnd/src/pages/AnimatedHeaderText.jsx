import React, { useState, useEffect } from "react";

const AnimatedHeaderText = ({ pitch }) => {
  if (!pitch) return null;

  const messages = [
    ` ${pitch.industry || "N/A"} Industry`,
    `In ${pitch.stage || "N/A"} Stage`,
    `Raising: $${pitch.total_raising_amount || "0"}`
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="animated-header-text">
      {messages.map((msg, i) => (
        <span key={i} className={i === index ? "fade-in" : "fade-out"}>
          {msg}
        </span>
      ))}
    </div>
  );
};

export default AnimatedHeaderText;
