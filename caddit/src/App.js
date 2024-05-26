import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home';
import Courses from './components/courses';
import TeacherAttendance from './components/teacherAttendance';
import StudentResults from './components/studentResults';
import TeacherRegistration from './components/TeacherRegistration';
import StudentRegistration from './components/StudentRegistration';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import Login from './components/Login';
import Navbar from './components/navbar';



const App = () => {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/teacher-attendance" element={<TeacherAttendance />} />
        <Route path="/student-results" element={<StudentResults />} />

        <Route path="/teacher-register" element={<TeacherRegistration />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />

        <Route path="/student-register" element={<StudentRegistration />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />

        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>

  );
};

export default App;