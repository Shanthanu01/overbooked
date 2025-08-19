// src/App.js

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AdminPage from "./components/AdminPage";
import AnalyticsPage from "./components/AnalyticsPage"; // Ensure you have this component
import CreateEventPage from "./components/CreateEventPage"; // Ensure you have this component
import AdminEventDetailsPage from "./components/AdminEventDetailsPage"; // Import the new component

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AdminPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/create-event" element={<CreateEventPage />} />
                <Route path="/event/title/:title" element={<AdminEventDetailsPage />} /> {/* Updated route to use title */}
            </Routes>
        </Router>
    );
}

export default App;
