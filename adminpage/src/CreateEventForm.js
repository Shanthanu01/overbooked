// CreateEventForm.js

import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function CreateEventForm({ newEvent, handleInputChange, handleFormSubmit }) {
    return (
        <section className="create-event-form mb-4">
            <h2 className="h4">Create New Event</h2>
            <form onSubmit={handleFormSubmit} className="bg-light p-4 rounded shadow-sm">
                <div className="form-group">
                    <label>Title:</label>
                    <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={newEvent.title}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Description:</label>
                    <textarea
                        className="form-control"
                        name="description"
                        value={newEvent.description}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Base Price:</label>
                    <input
                        type="number"
                        className="form-control"
                        name="base_price"
                        value={newEvent.base_price}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Is Weekend:</label>
                    <select
                        className="form-control"
                        name="is_weekend"
                        value={newEvent.is_weekend}
                        onChange={handleInputChange}
                        required
                    >
                        <option value={false}>No</option>
                        <option value={true}>Yes</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Location:</label>
                    <input
                        type="text"
                        className="form-control"
                        name="location"
                        value={newEvent.location}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Artist Name:</label>
                    <input
                        type="text"
                        className="form-control"
                        name="artist_name"
                        value={newEvent.artist_name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Month:</label>
                    <input
                        type="text"
                        className="form-control"
                        name="month"
                        value={newEvent.month}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Demand Level:</label>
                    <input
                        type="text"
                        className="form-control"
                        name="demand_level"
                        value={newEvent.demand_level}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary mt-3">
                    Create Event
                </button>
            </form>
        </section>
    );
}

export default CreateEventForm;
