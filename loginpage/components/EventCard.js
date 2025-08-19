import React from 'react';
import { Link } from 'react-router-dom';

function EventCard({ event }) {
  return (
    <div className="event-card">
      <img src={event.image} alt={event.title} />
      <h2>{event.title}</h2>
      <p>{new Date(event.date).toDateString()}</p>
      <Link to={`/events/${event._id}`}>View Details</Link>
    </div>
  );
}

export default EventCard;
