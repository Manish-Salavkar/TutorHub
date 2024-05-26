import React, { useState } from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from "moment";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core';

const AttendanceCalendar = ({ attendanceData }) => {
    const localizer = momentLocalizer(moment);
    const [selectedEvent, setSelectedEvent] = useState(null);

    if (!attendanceData) {
        return <div>Loading...</div>;
    }

    // Ensure Teacher_Attendance is an array
    const attendanceArray = Array.isArray(attendanceData.data.Teacher_Attendance) 
        ? attendanceData.data.Teacher_Attendance 
        : [];

    const events = attendanceArray.map(attendance => ({
        title: attendance.is_present ? 'Present' : 'Absent',
        start: new Date(attendance.date),
        end: new Date(attendance.date),
        isAbsent: !attendance.is_present,
        isApproved: attendance.is_approved,
        absenceReason: attendance.reason_for_absence,
    }));

    const eventStyleGetter = (event, start, end, isSelected) => {
        let style = {
            backgroundColor: event.isAbsent ? 'red' : 'green',
            color: 'white',
            borderRadius: '5px',
            border: 'none',
            display: 'block',
            padding: '10px',
            cursor: event.isAbsent ? 'pointer' : 'default',
        };

        if (event.is_present) {
            style.backgroundColor = 'green';
        }

        return {
            style: style
        };
    };

    const handleSelectEvent = (event) => {
        if (event.isAbsent) {
            setSelectedEvent(event);
        }
    };

    const handleClose = () => {
        setSelectedEvent(null);
    };

    return (
        <div style={{ height: '500px', position: 'relative' }}>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                titleAccessor="title"
                views={['month', 'week', 'day']}
                // style={{ marginBottom: '20px' }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
            />
            {selectedEvent && (
                <Dialog open={true} onClose={handleClose}>
                    <DialogTitle>Absence Reason</DialogTitle>
                    <DialogContent>
                        <p>{selectedEvent.absenceReason}</p>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </div>
    );
};

export default AttendanceCalendar;
