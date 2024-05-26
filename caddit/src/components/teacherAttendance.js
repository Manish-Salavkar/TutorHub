import React, { useState, useEffect } from 'react';
import { Typography, Button } from '@material-ui/core';

const TeacherAttendance = () => {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/teacher-names/');
        const responseData = await response.json();
  
        if (Array.isArray(responseData.teachers)) {
          const formattedData = responseData.teachers.map(([serial, name]) => ({ serial, name, attendance: 'neutral' }));
          setTeachers(formattedData);
        } else {
          console.error('Invalid data format:', responseData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);

  const handleAttendanceUpdate = async (teacherId, newAttendance, teacherName) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/update-attendance/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacherId, newAttendance, teacherName }),
      });
      console.log(teacherId,newAttendance, teacherName);
      const updatedData = await response.json();
      console.log(updatedData);
      // Assuming you have some logic here to update the UI based on the response
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const handleTruncateAttendance = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/truncate-attendance/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const responseData = await response.json();
      console.log(responseData);
      // Assuming you have some logic here to handle the response after truncating attendance
    } catch (error) {
      console.error('Error truncating attendance:', error);
    }
  };

  return (
    <div>
      <Button onClick={handleTruncateAttendance}>Truncate Attendance</Button>
      {teachers.map((teacher) => (
        <div key={teacher.serial}>
          <Typography>{teacher.name}</Typography>
          <Button onClick={() => handleAttendanceUpdate(teacher.serial, false, teacher.name)}>Absent</Button>
          <Button onClick={() => handleAttendanceUpdate(teacher.serial, true, teacher.name)}>Present</Button>
        </div>
      ))}
    </div>
  );
};

export default TeacherAttendance;
