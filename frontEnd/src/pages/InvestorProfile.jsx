import React from "react";


const InvestorProfile = () => {
  const profileImageUrl = "https://media.gq-magazine.co.uk/photos/5e96bf31013fff000829de0c/16:9/w_2560%2Cc_limit/GettyImages-1199899108.jpg"; 

  return (
    <div className="container py-5">
      <div className="card shadow-sm mb-4" style={{ borderRadius: "28px" }}>
        <div className="row g-0">
          <div className="col-md-2 d-flex justify-content-center align-items-center">
            <div
              className="rounded-circle overflow-hidden bg-secondary"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "28px", 
              }}
            >
              <img
                src={profileImageUrl}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "28px", 
                }}
              />
            </div>
          </div>
          <div className="col-md-10">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 className="card-title fw-bold">Sadik Rahman</h5>
                <p className="card-text text-muted">📍 Chittagong, Bangladesh</p>
                <ul className="list-unstyled">
                  <li>• Joined August 25, 2022</li>
                  <li>• Investment Range: $0 – $125,000</li>
                  <li>• Currently invested in 5 projects</li>
                  <li>• Social Media Links: N/A</li>
                </ul>
              </div>
              <button className="btn btn-success ms-4" style={{ fontSize: "1.2rem", padding: "12px 20px" }}>
                Knock
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100" style={{ borderRadius: "28px" }}>
            <div className="card-body">
              <h5 className="card-title fw-bold">Areas of Interest</h5>
              <div className="row mt-3">
                <div className="col-md-4 mb-3">
                  <div
                    className="card text-center p-3 border-0 shadow-sm d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor: "#A8E4A0",
                      height: "50px", 
                      borderRadius: "28px",
                    }}
                  >
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <span className="fs-4 text-dark">
                        <i className="bi bi-heart"></i>
                      </span>
                      <p className="mt-2 fw-semibold mb-0">Healthcare</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div
                    className="card text-center p-3 border-0 shadow-sm d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor: "#A8E4A0",
                      height: "50px",
                      borderRadius: "28px", 
                    }}
                  >
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <span className="fs-4 text-dark">
                        <i className="bi bi-bus-front"></i>
                      </span>
                      <p className="mt-2 fw-semibold mb-0">Transportation</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div
                    className="card text-center p-3 border-0 shadow-sm d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor: "#A8E4A0",
                      height: "50px", 
                      borderRadius: "28px", 
                    }}
                  >
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <span className="fs-4 text-dark">
                        <i className="bi bi-cpu"></i>
                      </span>
                      <p className="mt-2 fw-semibold mb-0">Technology</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100" style={{ borderRadius: "28px" }}>
            <div className="card-body">
              <h5 className="card-title fw-bold">About</h5>
              <p className="card-text">
                I am a passionate and driven investor dedicated to identifying
                and nurturing promising ventures. With a diverse portfolio
                spanning industries such as technology, healthcare, and
                transportation, I thrive on fostering innovation and growth. My
                investment philosophy is rooted in thorough research, strategic
                partnerships, and a commitment to long-term success. Based in
                Chittagong, Bangladesh, I am always eager to connect with
                like-minded entrepreneurs and investors to explore new
                opportunities and drive positive change.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default InvestorProfile;


