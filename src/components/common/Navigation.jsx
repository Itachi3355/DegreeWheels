import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="navigation">
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/rides">Rides</Link>
        </li>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link
            to="/route-planner"
            className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            🗺️ Route Planner
          </Link>
        </li>
        <li>
          <Link
            to="/bookings"
            className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            📋 Bookings
          </Link>
        </li>
        <li>
          <Link to="/my-rides" className="nav-link">
            My Rides
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;