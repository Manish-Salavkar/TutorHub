// src/components/Home.js
import React from 'react';
import '../css/home.css';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to TutorHub</h1>
        <p>Your one-stop solution for managing attendance, courses, and results.</p>
      </header>
      
      <div className="home-widgets">
        <div className="home-widget">
          <h2>Attendance Management</h2>
          <p>Easily log and track attendance for both teachers and students.</p>
          <Link className="btn">Log Attendance</Link>
        </div>
        <div className="home-widget">
          <h2>Course Management</h2>
          <p>Explore and enroll in available courses tailored to your needs.</p>
          <Link className="btn">View Courses</Link>
        </div>
        <div className="home-widget">
          <h2>Results Tracking</h2>
          <p>Access and update student results with ease.</p>
          <Link className="btn">View Results</Link>
        </div>
      </div>
      
      <div className="home-buttons">
        <Link to="/teacher-register" className="btn">Teacher Registration</Link>
        <Link to="/login" className="btn">Login</Link>
        <Link to="/student-register" className="btn">Student Registration</Link>
      </div>
      
      <footer className="home-footer">
        <p>&copy; 2024 Institute Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
