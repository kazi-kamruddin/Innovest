import React, { useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext'; 
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import '../styles/investorInfoSubmit.css';

const InvestorInfoSubmit = () => {
    const [fieldsOfInterest, setFieldsOfInterest] = useState('');
    const [investmentRangeMin, setInvestmentRangeMin] = useState('');
    const [investmentRangeMax, setInvestmentRangeMax] = useState('');
    const [preferredIndustries, setPreferredIndustries] = useState('');
    
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error('You must be logged in to submit your investor profile');
            return;
        }

        const data = {
            user_id: user.id, 
            fields_of_interest: fieldsOfInterest,
            investment_range_min: investmentRangeMin,
            investment_range_max: investmentRangeMax,
            preferred_industries: preferredIndustries,
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/investor-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(data),
            });

            if (response.status === 201) {
                toast.success('Investor profile created/updated successfully');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2300);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error submitting profile');
            }
        } catch (error) {
            console.error('Error submitting investor profile:', error);
            toast.error('There was an error submitting your profile');
        }
    };

    return (
        <div className="investor-profile-form-container">
            <h2 className="investor-profile-form-heading">Create/Update Your Investor Profile</h2>
            <form onSubmit={handleSubmit} className="investor-profile-form">
                <div className="investor-profile-form-group">
                    <label htmlFor="fields_of_interest" className="investor-profile-form-label">Fields of Interest (comma-separated):</label>
                    <input
                        type="text"
                        id="fields_of_interest"
                        value={fieldsOfInterest}
                        onChange={(e) => setFieldsOfInterest(e.target.value)}
                        placeholder="e.g. Technology, Finance"
                        className="investor-profile-form-input"
                    />
                </div>

                <div className="investor-profile-form-group">
                    <label htmlFor="investment_range_min" className="investor-profile-form-label">Minimum Investment Amount:</label>
                    <input
                        type="number"
                        id="investment_range_min"
                        value={investmentRangeMin}
                        onChange={(e) => setInvestmentRangeMin(e.target.value)}
                        placeholder="e.g. 5000"
                        className="investor-profile-form-input"
                    />
                </div>

                <div className="investor-profile-form-group">
                    <label htmlFor="investment_range_max" className="investor-profile-form-label">Maximum Investment Amount:</label>
                    <input
                        type="number"
                        id="investment_range_max"
                        value={investmentRangeMax}
                        onChange={(e) => setInvestmentRangeMax(e.target.value)}
                        placeholder="e.g. 50000"
                        className="investor-profile-form-input"
                    />
                </div>

                <div className="investor-profile-form-group">
                    <label htmlFor="preferred_industries" className="investor-profile-form-label">Preferred Industries (comma-separated):</label>
                    <input
                        type="text"
                        id="preferred_industries"
                        value={preferredIndustries}
                        onChange={(e) => setPreferredIndustries(e.target.value)}
                        placeholder="e.g. Tech, AI"
                        className="investor-profile-form-input"
                    />
                </div>

                <button type="submit" className="investor-profile-submit-button">Submit</button>
            </form>

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
};

export default InvestorInfoSubmit;