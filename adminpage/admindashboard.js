import React, { useState } from 'react';

const AdminDashboard = () => {
    const [showCreateEvent, setShowCreateEvent] = useState(false);

    const handleCreateEventToggle = () => {
        setShowCreateEvent(!showCreateEvent);
    };

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <div>
                <h2>Event Insights</h2>
                <p>Total Events: 0</p>
                <p>Total Clicks: 0</p>
            </div>
            <button onClick={handleCreateEventToggle}>
                {showCreateEvent ? "Hide Create Event" : "Create Event"}
            </button>

            {showCreateEvent && (
                <div>
                    <h3>Create New Event</h3>
                    <form>
                        <label>
                            Title:
                            <input type="text" name="title" required />
                        </label>
                        <label>
                            Description:
                            <textarea name="description" required />
                        </label>
                        <label>
                            Base Price:
                            <input type="number" name="basePrice" required />
                        </label>
                        <label>
                            Is Weekend:
                            <select name="isWeekend">
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                            </select>
                        </label>
                        <label>
                            Location:
                            <input type="text" name="location" required />
                        </label>
                        <label>
                            Artist Name:
                            <input type="text" name="artistName" required />
                        </label>
                        <label>
                            Month:
                            <input type="text" name="month" required />
                        </label>
                        <label>
                            Demand Level:
                            <input type="text" name="demandLevel" required />
                        </label>
                        <button type="submit">Create Event</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
