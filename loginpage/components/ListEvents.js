import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ListEvents() {
  const [events, setEvents] = useState([]);
  const [showDetails, setShowDetails] = useState({});

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/events');
      setEvents(response.data); 
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents(); 
  }, []);

  // Toggle visibility of extra details for each event
  const toggleDetails = (id) => {
    setShowDetails(prevState => ({ ...prevState, [id]: !prevState[id] }));
  };

  return (
    <div>
      <h1>Events</h1>
      {events.length > 0 ? (
        <ul>
          {events.map(event => (
            <li key={event._id} style={{ marginBottom: '20px' }}>
              <h2>{event.title}</h2>
              <p>{event.description}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Artist:</strong> {event.artist_name}</p>
              <p><strong>Final Price:</strong> ${event.final_price.toFixed(2)}</p>
              <button onClick={() => toggleDetails(event._id)}>
                {showDetails[event._id] ? 'Hide Details' : 'Show Details'}
              </button>
              
              {showDetails[event._id] && (
                <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc' }}>
                  <p><strong>Demand Level:</strong> {event.demand_level}</p>
                  <p><strong>Competition Price:</strong> ${event.competition_price}</p>
                  <p><strong>Dynamic Price:</strong> ${event.dynamic_price.toFixed(2)}</p>
                  <p><strong>Month:</strong> {event.month}</p>
                  <p><strong>Day:</strong> {event.day}</p>
                  <p><strong>Is Weekend:</strong> {event.is_weekend ? "Yes" : "No"}</p>
                  <p><strong>Clicks:</strong> {event.clicks}</p>
                  
                  <h4>Price History:</h4>
                  <ul>
                    {event.price_history.map((history, index) => (
                      <li key={history._id}>
                        Date: {new Date(history.date).toLocaleDateString()} - Price: ${history.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Link to the EventDetails page with the event id */}
              <Link to={`/events/${event.title}`}>View Details</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No events available</p>
      )}
    </div>
  );
}

export default ListEvents;
