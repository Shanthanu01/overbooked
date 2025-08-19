import React, { useEffect, useState } from 'react';
import event1 from './event1.jpeg';
import event2 from './event2.jpeg';
import event3 from './event3.jpeg';
import event1Video from './video.mp4';
import event2Video from './video2.mp4';
import event3Video from './video3.mp4';
import event4Video from './video4.mp4';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";

const eventsData = [
    { image: event1, video: event1Video, title: "They Not Like Us!", description: "Short description of the event 1.", base_price: 25 },
    { image: event2, video: event2Video, title: "Travis Scott World Tour", description: "Short description of the event 2.", base_price: 30 },
    { image: event3, video: event3Video, title: "FEIN FEIN FEIN", description: "Short description of the event 3.", base_price: 45 },
    // Add more events as needed...
];

const images = [
    event1,
    event2,
    event3
];

const videos = [
    event1Video,
    event2Video,
    event3Video,
    event4Video
];

function getRandomItem(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

function EventCard({ image, video, title, description, base_price }) {
    const [dynamicPrice, setDynamicPrice] = useState(base_price);
    const [clickCount, setClickCount] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [lastBookedTime, setLastBookedTime] = useState(Date.now());

    useEffect(() => {
        // Fetch the initial dynamic price from the backend
        const fetchDynamicPrice = async () => {
            try {
                const response = await axios.post("http://localhost:3001/calculate-dynamic-price", {
                    is_weekend: false,
                    location: "Default Location",
                    artist_name: title,
                    month: new Date().getMonth() + 1,
                    base_price: base_price,
                    clicks: clickCount
                });
                setDynamicPrice(response.data.dynamic_price);
            } catch (error) {
                console.error("Error fetching dynamic price:", error);
            }
        };

        fetchDynamicPrice();

        // Price decrease logic
        const priceDecreaseInterval = setInterval(() => {
            const timeSinceLastBooking = Date.now() - lastBookedTime;
            if (timeSinceLastBooking > 60000) { // 1 minute in milliseconds
                const decreaseRate = Math.min(0.05, 0.005 * Math.floor(timeSinceLastBooking / 60000)); // Increase decrease rate over time
                setDynamicPrice(prevPrice => prevPrice * (1 - decreaseRate)); // Decrease price

            }
        }, 60000); // Check every minute

        return () => clearInterval(priceDecreaseInterval);
    }, [base_price, title, clickCount, lastBookedTime]);

        

    const handleBookNowClick = async () => {
        setClickCount(prevCount => prevCount + 1);
        setLastBookedTime(Date.now());

        try {
            await axios.post("http://localhost:3001/track-click", {
                event_id: title,
                clicks: clickCount + 1
            });
        } catch (error) {
            console.error("Error tracking click:", error);
        }
    };

    return (
        <div 
            className="event-card"
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="media-container">
                {isHovered ? (
                    <video 
                        src={video} 
                        className="event-video" 
                        autoPlay 
                        muted 
                        loop 
                        playsInline
                    />
                ) : (
                    <img src={image} alt={title} className="event-image" />
                )}
            </div>
            <h3><strong>{title}</strong></h3>
            <p>{description}</p>
            <p><strong>Price:</strong> ${dynamicPrice.toFixed(2)}</p>
            <button className="book-btn" onClick={handleBookNowClick}>Book Now</button>
        </div>
    );
}

function HomePage() {
    const [events, setEvents] = useState(eventsData);
    const [filter, setFilter] = useState(""); // To store the selected filter
    const [currentPage, setCurrentPage] = useState(1); // State for current page
    const itemsPerPage = 10; // Set how many events to show per page

    useEffect(() => {
        // Fetch event data from backend
        axios.get("http://localhost:3001/getevents")
            .then(response => {
                const updatedEvents = response.data.map(event => ({
                    ...event,
                    image: getRandomItem(images),
                    video: getRandomItem(videos)
                }));
                setEvents(updatedEvents);
            })
            .catch(err => console.log(err));
    }, []);

    // Function to handle sorting based on the filter
    const applyFilter = () => {
        let sortedEvents = [...events];

        if (filter === "price") {
            sortedEvents.sort((a, b) => a.base_price - b.base_price);
        } else if (filter === "alphabetical") {
            sortedEvents.sort((a, b) => a.title.localeCompare(b.title));
        }

        setEvents(sortedEvents);
    };

    // Calculate total pages
    const totalPages = Math.ceil(events.length / itemsPerPage);

    // Get events for the current page
    const indexOfLastEvent = currentPage * itemsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
    const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

    // Function to change page
    const handlePageChange = (direction) => {
        setCurrentPage(prevPage => {
            if (direction === "next" && prevPage < totalPages) {
                return prevPage + 1;
            } else if (direction === "prev" && prevPage > 1) {
                return prevPage - 1;
            }
            return prevPage;
        });
    };

    return (
        <div className="homepage">
            <header className="navbar">
                <div style={{fontFamily : "Times New Roman" , backgroundColor : "red"}} className="logo">OverBooked🔥</div>
                <nav>
                    <a href="/">Home</a>
                    <a href="/events">Events</a>
                    <a href="/login">Login</a>
                    <a href="/signup">Signup</a>
                </nav>
            </header>

            <section className="hero">
                <div className="hero-content">
                    <h1 style={{ margin: "10px" }}>Discover Exciting Events Near You</h1>
                    <p>Don't miss out! Book your favorite events now.</p>
                    <button className="browse-events-btn">Browse Events</button>
                </div>
            </section>

            <section className="events-filter-container">
                <h2 style={{ margin: "10px", display: "inline-block" }}>Upcoming Events</h2>
                <button className="askWalter-btn" style={{ marginLeft: "20px" }}>
                    askWalter 🤖
                </button>
                <div className="filter-section">
                    <label htmlFor="filter-select">Filter by: </label>
                    <select
                        id="filter-select"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="">Select</option>
                        <option value="price">Price</option>
                        <option value="alphabetical">Alphabetical Order</option>
                    </select>
                    <button className="apply-filter-btn" onClick={applyFilter}>
                        Apply
                    </button>
                </div>
            </section>

            <section className="events-list">
                <div className="events-grid">
                    {currentEvents.map((event, index) => (
                        <EventCard
                            key={index}
                            image={event.image}
                            video={event.video}
                            title={event.title}
                            description={event.description}
                            base_price={event.base_price}
                        />
                    ))}
                </div>
            </section>

            <div className="pagination">
                <button 
                    onClick={() => handlePageChange("prev")} 
                    className={currentPage === 1 ? "disabled" : ""}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button 
                    onClick={() => handlePageChange("next")} 
                    className={currentPage === totalPages ? "disabled" : ""}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default HomePage;
