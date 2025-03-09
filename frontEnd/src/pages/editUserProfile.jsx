import { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext.jsx";
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import '../styles/investorInfoSubmit.css';
import '../styles/profile_edit.css';

const ProfileEdit = () => {
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({
    location: "",
    areas_of_interest: "",
    about: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
  
    const token = localStorage.getItem("token"); 
    if (!token) {
      alert("Authentication token not found. Please log in again.");
      return;
    }
  
    const payload = { ...formData, user_id: user.id };
  
    try {
      const response = await fetch(`http://localhost:8000/api/profile/${user.id}/edit-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      if (response.ok) {
        toast.success("Profile updated successfully!"); 
        setTimeout(() => {
          window.location.href = "/investor-profile"; 
        }, 2300);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }
    } catch (error) {
        console.error("Error updating profile:", error);
        toast.error(error.message || "Error updating profile. Please try again."); 
    }
  };
  

  return (
    <div className="edit-profile-container">
      <h2 className="edit-profile-heading">Edit Profile Info</h2>
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <label className="edit-profile-label">Location:</label>
        <input className="edit-profile-input" type="text" name="location" value={formData.location} onChange={handleChange} />

        <label className="edit-profile-label">Areas of Interest:</label>
        <input className="edit-profile-input" type="text" name="areas_of_interest" value={formData.areas_of_interest} onChange={handleChange} />

        <label className="edit-profile-label">About:</label>
        <textarea className="edit-profile-textarea" name="about" value={formData.about} onChange={handleChange}></textarea>

        <button className="edit-profile-button" type="submit">Save Changes</button>
      </form>

      <ToastContainer position="top-right" autoClose={2300} hideProgressBar={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default ProfileEdit;
