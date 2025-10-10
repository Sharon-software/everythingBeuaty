import React from 'react'
import { AuthProvider } from '../AuthContext'
import { useContext} from 'react';
import { Link, useNavigate } from 'react-router-dom';

const About = () => {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthProvider)
  const navigate=useNavigate;
  
 const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    
    console.log('Logged out successfully');
    navigate("/");
  };
  return(
    <>
  
    <div className='dashboard'>
        {isLoggedIn ? (
          <button onClick={handleLogout}> Logout </button>
        ) : (
          <Link to="/">Login</Link>
        )}

      </div>
    </>
    
  );
}

export default About