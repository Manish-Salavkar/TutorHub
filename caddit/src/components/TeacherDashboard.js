// caddit\src\components\TeacherDashboard.js 

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { CircularProgress, Typography, Box, Paper, Grid, Button, Modal, TextField, Backdrop, Fade, Snackbar} from '@mui/material';
// import { Event as EventIcon } from '@mui/icons-material';
import '../css/TeacherDashboard.css';
import moment from 'moment-timezone';
import DateConverter from '../utils/utils';
import AttendanceCalendar from '../utils/calenderAttendance';


const TeacherDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [reasonOfAbsence, setReasonOfAbsence] = useState('');
  const [todayAttendance, setTodayAttendance] = useState(false);
  const [showAttendanceNotification, setShowAttendanceNotification] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const userId = localStorage.getItem('userId');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found.');
      }

      const response = await axios.get('http://127.0.0.1:8000/api/userdata/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response)
      const userDataJson = JSON.stringify(response)
      const userData = JSON.parse(userDataJson);
      setUserData(userData);

      setTimeout(() => {
        setShowCalendar(true);
      }, 3000);

      const teacherAttendanceData = response.data.Teacher_Attendance
      console.log(`teacher attendance ${teacherAttendanceData}`);

      const updateDates = (teacherAttendanceData) => {
        return teacherAttendanceData.map(item => ({
          ...item,
          date: DateConverter({ dateString: item.date })
        }));
      };

      const updatedData = updateDates(teacherAttendanceData);
      console.log(updatedData);

      // const todayDate = new Date().toISOString().slice(0, 10);
      const todayDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
      console.log(`today date, ${todayDate}`)

      const isTodayPresent = updatedData.some(attendance => {
        return attendance.date.slice(0, 10) === todayDate && attendance.is_present;
      });

      setTodayAttendance(isTodayPresent);

      if (!isTodayPresent) {
        setShowAttendanceNotification(true);
      } else {
        setShowAttendanceNotification(false);
      }

    } catch (error) {
      console.error('Fetch data error:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkPresent = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found.');
      }

      const response = await axios.post(
        'http://127.0.0.1:8000/api/teacher-attendance/',
        {teacher: userId, is_present: true, is_approved: false, reason_for_absence: null},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success('Present Marked!');
        fetchData();
      } else {
        toast.error('Error Occurred');
      }
    } catch (error) {
      console.error('Mark present error:', error);
      toast.error('Error Occured'+ error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAbsent = async () => {
    setOpenModal(true);
  };

  const handleAbsentSubmit = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found.');
      }

      const response = await axios.post(
        'http://127.0.0.1:8000/api/teacher-attendance/',
        { is_present: false, reason_for_absence: reasonOfAbsence, is_approved: false, teacher: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOpenModal(false);
      setReasonOfAbsence('');
      if (response.status === 201) {
        fetchData();
        toast.success('Absent Marked!');
      } else {
        toast.error('Error Occurred');
      }

      toast.success('Absent Marked!');
    } catch (error) {
      console.error('Mark absent error:', error);
      toast.error('Error Occured');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setReasonOfAbsence('');
  };

  const getButtonColor = () => {
    if (todayAttendance) {
      return todayAttendance ? { present: 'green', absent: 'darkgray' } : { present: 'darkgray', absent: 'red' };
    } 
    return { present: '#808080', absent: '#808080' };
  };

  const handleCloseNotification = () => {
    setShowAttendanceNotification(true);
  };

  const handleSyncAttendance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found.');
      }

      const response = await axios.post(
        'http://127.0.0.1:8000/api/sync-attendance/',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success('Attendance Synced!');
        // fetchData();
      } else {
        toast.error('Error Occurred');
      }
    } catch (error) {
      console.error('Sync attendance error:', error);
      toast.error('Error Occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Welcome to Teacher Dashboard</Typography>
      <div className='dashhead'>
      <Paper elevation={3} style={{ padding: '20px', width: '500px' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6">
                {userData && `${userData.data.data[0].first_name} ${userData.data.data[0].last_name}`}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                @{userData && userData.data.data[0].username}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                Email: {userData && userData.data.data[0].email}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                Phone: {userData && userData.data.data[0].phone_number}
              </Typography>
            </Grid>
          </Grid>
        )}
      </Paper>

      <Grid item xs={12} className='PA-buttons'>
        <Button variant="contained" onClick={handleMarkPresent} id='present-button' style={{ backgroundColor: getButtonColor().present }}>
          {loading ? <CircularProgress color="inherit" /> : 'Present'}
        </Button>
        <Button variant="contained" onClick={handleMarkAbsent} id='absent-button' style={{ backgroundColor: getButtonColor().absent }}>
          {loading ? <CircularProgress color="inherit" /> : 'Absent'}
        </Button>
      </Grid>

      <Modal

        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              maxWidth: 400,
            }}
          >
            <Typography variant="h5" gutterBottom>
              Reason for Absence
            </Typography>
            <TextField
              label="Reason"
              multiline
              rows={4}
              value={reasonOfAbsence}
              onChange={(e) => setReasonOfAbsence(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <Button variant="contained" color="primary" onClick={handleAbsentSubmit}>
              Submit Absence
            </Button>
          </Box>
        </Fade>
      </Modal>
      </div>
      <Snackbar
        open={showAttendanceNotification }
        autoHideDuration={10000}
        onClose={handleCloseNotification}
        message="You haven't marked today's attendance yet!"
        action={
          <Button color="inherit" size="small" onClick={handleCloseNotification}>
            CLOSE
          </Button>
        }
      />
      <ToastContainer/>
      <Button
        variant="contained"
        onClick={handleSyncAttendance}
        style={{width: '30%', marginTop: '50px'}}
      >
        {loading ? <CircularProgress size={24} /> : 'Sync Attendance'}
      </Button>

      {showCalendar && <AttendanceCalendar attendanceData={userData} />}
    </Box>
  );
};

export default TeacherDashboard;
