import { useState } from "react";
import { createPitch } from "../api/pitchApi";
import { useNavigate } from "react-router-dom";

const PitchForm = () => {
    const [formData, setFormData] = useState({
        title: "",
        company_location: "",
        country: "",
        cell_number: "",
        industry: "",
        stage: "",
        ideal_investor_role: "",
        total_raising_amount: "",
        minimum_investment: "",
        the_business: "",
        the_market: "",
        progress: "",
        objective: "",
    });

    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createPitch(formData);
            alert("Pitch submitted successfully!");
            navigate("/pitches"); // Redirect to pitches list
        } catch (err) {
            setError("Failed to submit pitch. Check your input.");
        }
    };

    return (
        <div>
            <h2>Submit Your Pitch</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
                <input type="text" name="company_location" placeholder="Company Location" value={formData.company_location} onChange={handleChange} required />
                <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} required />
                <input type="text" name="cell_number" placeholder="Cell Number" value={formData.cell_number} onChange={handleChange} required />
                <input type="text" name="industry" placeholder="Industry" value={formData.industry} onChange={handleChange} required />
                <input type="text" name="stage" placeholder="Stage" value={formData.stage} onChange={handleChange} required />
                <input type="text" name="ideal_investor_role" placeholder="Ideal Investor Role" value={formData.ideal_investor_role} onChange={handleChange} required />
                <input type="number" name="total_raising_amount" placeholder="Total Raising Amount" value={formData.total_raising_amount} onChange={handleChange} required />
                <input type="number" name="minimum_investment" placeholder="Minimum Investment" value={formData.minimum_investment} onChange={handleChange} required />
                <textarea name="the_business" placeholder="Business Description" value={formData.the_business} onChange={handleChange} required />
                <textarea name="the_market" placeholder="Market Overview" value={formData.the_market} onChange={handleChange} required />
                <textarea name="progress" placeholder="Progress" value={formData.progress} onChange={handleChange} required />
                <textarea name="objective" placeholder="Objective" value={formData.objective} onChange={handleChange} required />
                <button type="submit">Submit Pitch</button>
            </form>
        </div>
    );
};

export default PitchForm;
