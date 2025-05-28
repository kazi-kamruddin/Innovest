import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/profile-investor-info.css';

const fieldsOfInterestOptions = [
  'Startups', 'Biotech', 'Real Estate', 'Green Tech',
  'Healthcare', 'E-commerce', 'Cybersecurity', 'AI'
];

const preferredIndustriesOptions = [
  'Finance', 'Energy', 'Agriculture', 'Transportation',
  'Education', 'Logistics', 'Retail', 'Manufacturing'
];

const ProfileInvestorInfo = () => {
  const [fieldsOfInterest, setFieldsOfInterest] = useState([]);
  const [investmentRangeMin, setInvestmentRangeMin] = useState('');
  const [investmentRangeMax, setInvestmentRangeMax] = useState('');
  const [preferredIndustries, setPreferredIndustries] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuthContext();
  const navigate = useNavigate();

  const toggleSelection = (value, setter, currentState) => {
    const updated = currentState.includes(value)
      ? currentState.filter((item) => item !== value)
      : [...currentState, value];
    setter(updated);
  };

  useEffect(() => {
    const fetchInvestorInfo = async () => {
      if (!user) return;

      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/investor-info/${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data && Object.keys(data).length > 0) {
            setFieldsOfInterest(data.fields_of_interest ? data.fields_of_interest.split(',').map(s => s.trim()) : []);
            setInvestmentRangeMin(data.investment_range_min || '');
            setInvestmentRangeMax(data.investment_range_max || '');
            setPreferredIndustries(data.preferred_industries ? data.preferred_industries.split(',').map(s => s.trim()) : []);
          }
        } else if (response.status !== 404) {
          toast.error('Failed to load investor profile data');
        }
      } catch (error) {
        console.error('Error fetching investor profile data:', error);
        toast.error('Error fetching investor profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchInvestorInfo();
  }, [user]);

  const handleMinChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setInvestmentRangeMin('');
      return;
    }
    const num = Math.max(0, Number(value));
    setInvestmentRangeMin(num);
  };

  const handleMaxChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setInvestmentRangeMax('');
      return;
    }
    const num = Math.max(0, Number(value));
    setInvestmentRangeMax(num);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to submit your investor profile');
      return;
    }

    const data = {
      user_id: user.id,
      fields_of_interest: fieldsOfInterest.join(', '),
      investment_range_min: investmentRangeMin,
      investment_range_max: investmentRangeMax,
      preferred_industries: preferredIndustries.join(', ')
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
        setTimeout(() => navigate('/profile'), 900);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error submitting profile');
      }
    } catch (error) {
      console.error('Error submitting investor profile:', error);
      toast.error('There was an error submitting your profile');
    }
  };

  if (loading) {
    return <div>Loading investor profile data...</div>;
  }

  return (
    <div className="investor-profile-container">
      <h2 className="investor-profile-heading">Create/Update Your Investor Profile</h2>
      <form onSubmit={handleSubmit} className="investor-profile-form">

        <label className="investor-profile-label">Fields of Interest:</label>
        <div className="custom-multiselect">
          {fieldsOfInterestOptions.map((option) => (
            <div
              key={option}
              className={`multiselect-option ${fieldsOfInterest.includes(option) ? 'selected' : ''}`}
              onClick={() => toggleSelection(option, setFieldsOfInterest, fieldsOfInterest)}
            >
              {fieldsOfInterest.includes(option) ? '✔️ ' : ''}{option}
            </div>
          ))}
        </div>
        <input
          type="text"
          className="investor-profile-input readonly-box"
          value={fieldsOfInterest.join(', ')}
          readOnly
        />

        <label className="investor-profile-label">Minimum Investment Amount:</label>
        <input
          type="number"
          min="0"
          value={investmentRangeMin}
          onChange={handleMinChange}
          placeholder="e.g. 5000"
          className="investor-profile-input"
        />

        <label className="investor-profile-label">Maximum Investment Amount:</label>
        <input
          type="number"
          min="0"
          value={investmentRangeMax}
          onChange={handleMaxChange}
          placeholder="e.g. 50000"
          className="investor-profile-input"
        />

        <label className="investor-profile-label">Preferred Industries:</label>
        <div className="custom-multiselect">
          {preferredIndustriesOptions.map((option) => (
            <div
              key={option}
              className={`multiselect-option ${preferredIndustries.includes(option) ? 'selected' : ''}`}
              onClick={() => toggleSelection(option, setPreferredIndustries, preferredIndustries)}
            >
              {preferredIndustries.includes(option) ? '✔️ ' : ''}{option}
            </div>
          ))}
        </div>
        <input
          type="text"
          className="investor-profile-input readonly-box"
          value={preferredIndustries.join(', ')}
          readOnly
        />

        <button type="submit" className="investor-profile-button">Submit</button>
      </form>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
    </div>
  );
};

export default ProfileInvestorInfo;
