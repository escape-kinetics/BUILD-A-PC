import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Navbar.css';

function Navbar() {
  const { isLoggedIn, logout, user, isAdmin } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <NavLink to="/" className="nav-brand">
            BuildAPC-Aayush Singh & AV Vedanth
          </NavLink>
          {isLoggedIn && (
            <>
              <NavLink to="/builder" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                New Build
              </NavLink>
              <NavLink to="/builds" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                Saved Builds
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                  Admin Dashboard
                </NavLink>
              )}
            </>
          )}
        </div>
        <div className="navbar-right">
          {isLoggedIn ? (
            <>
              <span className="nav-user">Welcome, {user.username}!</span>
              <button onClick={logout} className="nav-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                Login
              </NavLink>
              <NavLink to="/signup" className={({isActive}) => `nav-button ${isActive ? 'active' : ''}`}>
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
