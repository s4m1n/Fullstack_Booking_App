import React from 'react';

function Events() {
  return (
    <div className="form">
      <h2>Your event is created successfully</h2>
      <p>You can see it in your Google calendar</p>
      <a
        href="https://calendar.google.com/calendar/r"
        target="_blank"
        rel="noopener noreferrer"
      >
        Click here
      </a>
    </div>
  );
}

export default Events;
