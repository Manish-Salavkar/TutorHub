import React, { useState } from 'react';
import { TextField, Button, Typography, Container, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/login.css';
import axios from 'axios';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        email: email,
        password: password
      });
      const { access, refresh } = response.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      toast.success('Login successful!');
      
      const userDataResponse = await axios.get('http://127.0.0.1:8000/api/userlogindata/', {
        headers: {
          Authorization: `Bearer ${access}`
        }
      });
      const userDataJson = JSON.stringify(userDataResponse)
      const userData = JSON.parse(userDataJson);
      setUserData(userData);
      const profile_type = userData.data[0].profile_type;
      const userId = userData.data[0].id;
      localStorage.setItem('profileType', profile_type)
      localStorage.setItem('userId', userId)

      if (profile_type === 'teacher') {
        navigate('/teacher-dashboard');
      } else if (profile_type === 'student') {
        navigate('/student-dashboard');
      } else {
        toast.error('Invalid profile type.');
      }

    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      console.log(error)
      // Handle login error (e.g., display error message to user)
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line
  return (
    <Container maxWidth="sm" className='loginContainer'>
      <Typography variant="h4" gutterBottom>Login</Typography>
      <form>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button
          type="button"
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Login'}
        </Button>
      </form>
      <ToastContainer />
    </Container>
  );
};

export default Login;
