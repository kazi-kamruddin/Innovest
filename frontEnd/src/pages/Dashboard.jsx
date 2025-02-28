import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogout } from '../hooks/useLogout.jsx';
import { useAuthContext } from '../hooks/useAuthContext.jsx';

function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const [email, setEmail] = useState('emailNotFetched');

  const handleLogout = () => {
    logout();
  };

  return (

    <div className="container">

      {user && (
        <div>
            <br /><br /><br />
            <span>logged in as {user.email} </span>
            <br /><br />
            <button onClick={handleLogout}>Log out</button>
        </div>
      )}


      <h2>Welcome to your Dashboard</h2>
    </div>
  );
}

export default Dashboard;
