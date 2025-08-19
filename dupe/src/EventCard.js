import { useState } from "react";

function EventCard({ image, video, title, description, price }) {
    const [isHovered, setIsHovered] = useState(false);

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
            <p><strong>Price:</strong> ${price}</p>
            <button className="book-btn">Book Now</button>
        </div>
    );
}

export default EventCard;
