import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/profile-edit.css";

const interestsOptions = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Real Estate",
  "E-commerce",
  "Agriculture",
  "AI",
  "Entertainment"
];

const ProfileEdit = () => {
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({
    location: "",
    areas_of_interest: "",
    about: "",
  });

  const [loading, setLoading] = useState(true);

  // ✅ Fetch profile data when page loads (same as profile.jsx)
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`http://localhost:8000/api/profile/${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          // If there's no existing profile (new user), the data might be empty
          if (!data || Object.keys(data).length === 0) {
            console.log("No existing profile data found. Initializing empty form.");
            setFormData({
              location: "",
              areas_of_interest: "",
              about: "",
            });
          } else {
            setFormData({
              location: data.location || "",
              areas_of_interest: data.areas_of_interest || "",
              about: data.about || "",
            });
          }
        } else if (response.status !== 404) {
          toast.error("Failed to load profile data");
        }
        
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Error fetching profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInterestsChange = (value) => {
    let selected = formData.areas_of_interest
      ? formData.areas_of_interest.split(",").map((item) => item.trim())
      : [];

    if (selected.includes(value)) {
      selected = selected.filter((item) => item !== value);
    } else {
      selected.push(value);
    }

    setFormData({
      ...formData,
      areas_of_interest: selected.join(", "),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const token = localStorage.getItem("token");

    const payload = {
      ...formData,
      user_id: user.id,
    };

    try {
      const response = await fetch(`http://localhost:8000/api/profile/${user.id}/edit-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        setTimeout(() => {
          window.location.href = "/profile";
        }, 700);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Error updating profile");
    }
  };

  const selectedInterests = formData.areas_of_interest
    ? formData.areas_of_interest.split(",").map((i) => i.trim())
    : [];

  return (
    <div className="edit-profile-container">
      <h2 className="edit-profile-heading">Edit Profile Info</h2>
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <label className="edit-profile-label">Location:</label>
        <input
          className="edit-profile-input"
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
        />

        <label className="edit-profile-label">Areas of Interest:</label>
        <div className="custom-multiselect">
          {interestsOptions.map((interest) => (
            <div
              key={interest}
              className={`multiselect-option ${
                selectedInterests.includes(interest) ? "selected" : ""
              }`}
              onClick={() => handleInterestsChange(interest)}
            >
              {selectedInterests.includes(interest) ? "✔️ " : ""} {interest}
            </div>
          ))}
        </div>
        <input
          type="text"
          name="areas_of_interest"
          className="edit-profile-input readonly-box"
          value={formData.areas_of_interest}
          readOnly
        />

        <label className="edit-profile-label">About:</label>
        <textarea
          className="edit-profile-textarea"
          name="about"
          value={formData.about}
          onChange={handleChange}
        ></textarea>

        <button className="edit-profile-button" type="submit">
          Save Changes
        </button>
      </form>

      <ToastContainer
        position="top-right"
        autoClose={2300}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
};

export default ProfileEdit;
