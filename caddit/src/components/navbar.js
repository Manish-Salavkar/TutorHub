import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, makeStyles, MenuItem, Menu, ListItemIcon, Drawer, List, ListItem, Divider, ListItemText } from '@material-ui/core';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress } from '@material-ui/core';
import ListItemButton from '@mui/material/ListItemButton';
import SchoolIcon from '@material-ui/icons/School';
import { Link } from 'react-router-dom';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { pdfjs, Document, Page } from 'react-pdf';
import '@react-pdf-viewer/core/lib/styles/index.css'
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css"
import { useNavigate } from 'react-router-dom';
import { courses } from '../constants';
import '../css/navbar.css';

const drawerWidth = '30%';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: '#fff',
    color: 'red',
    marginBottom: '50px',
  },
  logo: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    fontSize: '18px',
  },
  button: {
    marginLeft: theme.spacing(2),
    fontSize: '13px',
    color: 'black',
  },
  dropdownButton: {
    marginLeft: theme.spacing(2),
    fontSize: '13px',
    color: 'black',
    textTransform: 'none',
  },
  menuIcon: {
    minWidth: 'auto',
    marginRight: theme.spacing(1),
  },
  emailDialog: {
    '& .MuiDialog-paper': {
      width: '500px',
      minHeight: '250px',
    },
    '& .MuiDialogTitle-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(2),
    },
  },
  pdfContainer: {
    margin: '0 auto',
    width: '80vw',
    height: '70vh',
    overflowY: 'scroll',
    border: '1px solid #ccc',
    marginTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowX: 'hidden',
  },
  courseName: {
    textAlign: 'center',
    fontSize: '35px'
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  overlayBackdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: 'fff'
  }
}));

const Navbar = () => {
  const classes = useStyles();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileType, setProfileType] = useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [coursesAnchorEl, setCoursesAnchorEl] = useState(null);
  const [selectedCourseType, setSelectedCourseType] = useState(null);
  const [isOpenOverlay, setIsOpenOverlay] = useState(false);


  const accessToken = localStorage.getItem('accessToken');

  const navigate = useNavigate()

  useEffect(() => {
    setIsLoggedIn(!!accessToken);
    const storedProfileType = localStorage.getItem('profileType');
    setProfileType(storedProfileType);
  }, [accessToken]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/get_course_pdf/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, course_name: selectedCourse.name }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }

      const pdfData = await response.blob();

      setPdfUrl(URL.createObjectURL(pdfData));

      setOpenDialog(false);
      setIsOpenOverlay(true);
      setOpenDrawer(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setOpenDialog(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pdfUrl) {
      const fetchNumPages = async () => {
        try {
          const pdf = await pdfjs.getDocument(pdfUrl).promise;
          setNumPages(pdf.numPages);
        } catch (error) {
          console.error('Error fetching number of pages:', error);
        }
      };
      fetchNumPages();
    }
  }, [pdfUrl]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  };

  const handleDrawerClose = () => {
    setOpenDrawer(false);
  };

  const handleCoursesMenuClose = (course, courseType) => {
    setCoursesAnchorEl(null);
    setSelectedCourse(course);
    setSelectedCourseType(courseType);
    setOpenDialog(true);
};

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('profileType');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    navigate('/login')
  };

  return (
    <div className='navbar-div'>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <SchoolIcon className={classes.logo} />
          <Typography variant="h6" className={classes.title}>
            TutorHub
          </Typography>
          <Button color="inherit" className={classes.button} component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" className={classes.button} onClick={handleDrawerOpen}>
            COURSES <ExpandMoreIcon />
          </Button>


          {/* Dropdown Button for Registration */}
          <Button
            color="inherit"
            className={classes.dropdownButton}
            aria-haspopup="true"
            onClick={handleMenuClick}
          >
            REGISTER <ExpandMoreIcon />
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} keepMounted>
            <MenuItem component={Link} to="/teacher-register" onClick={handleMenuClose}>
              <ListItemIcon className={classes.menuIcon}>
                <PersonAddIcon />
              </ListItemIcon>
              Teacher Register
            </MenuItem>
            <MenuItem component={Link} to="/student-register" onClick={handleMenuClose}>
              <ListItemIcon className={classes.menuIcon}>
                <PersonAddIcon />
              </ListItemIcon>
              Student Register
            </MenuItem>
          </Menu>

          {isLoggedIn ? (
            <>
              {profileType === 'teacher' && (
                <Button
                  color="inherit"
                  className={classes.button}
                  component={Link}
                  to="/teacher-dashboard"
                >
                  Teacher Dashboard
                </Button>
              )}
              {profileType === 'student' && (
                <Button
                  color="inherit"
                  className={classes.button}
                  component={Link}
                  to="/student-dashboard"
                >
                  Student Dashboard
                </Button>
              )}
              <Button color="inherit" className={classes.button} onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit" className={classes.button} component={Link} to="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        BackdropProps={{ invisible: true }}
        PaperProps={{
          sx: {
            height: 'calc(100% - 64px)',
            top: 64,
          },
        }}
        className={classes.drawer}
        variant="temporary"
        anchor="left"
        open={openDrawer}
        onClose={handleDrawerClose}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <List>
          {Object.keys(courses).map((courseType) => (
            <React.Fragment key={courseType}>
              <ListItem disablePadding>
                <ListItemText primary={courseType} />
              </ListItem>
              <Divider style={{ background: 'linear-gradient(to right, black, gray, lightgray, white)', height: "3px" }} />
              {courses[courseType].map((course) => (
                <ListItem key={course.name} disablePadding>
                  <ListItemButton onClick={() => handleCoursesMenuClose(course, courseType)}>
                    <ListItemIcon>
                      {React.createElement(course.icon)}
                    </ListItemIcon>
                    <ListItemText primary={course.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </React.Fragment>
          ))}
        </List>
        <Divider />
        {/* Additional options or actions can be added here */}
      </Drawer>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} className={classes.emailDialog}>
                <DialogTitle>Submit Email</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    {loading ? (
                        <CircularProgress size={24} />
                    ) : (
                        <>
                            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} color="primary">Submit</Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
            <Dialog
              open={isOpenOverlay}
              onClose={() => setIsOpenOverlay(false)}
              className={classes.overlayBackdrop}
              PaperProps={{ style: { width: '81vw', maxWidth: 'none' } }}
            >
            {pdfUrl && numPages && (
                <div className={classes.pdfContainer}>
                    <p className={classes.courseName}>{selectedCourse.name}</p>
                    <Document file={pdfUrl}>
                        {[...Array(numPages)].map((_, index) => (
                            <Page key={`page_${index + 1}`} pageNumber={index + 1} size="A4" renderTextLayer={false} renderAnnotationLayer={false} scale={1.5} />
                        ))}
                    </Document>
                </div>
            )}
            </Dialog>
    </div>

  );
};

export default Navbar;
