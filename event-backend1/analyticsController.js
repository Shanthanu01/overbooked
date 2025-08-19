const Event = require('./models/users');
const User = require('./models/userCredential');

// Controller to fetch overall analytics
const getAnalytics = async (req, res) => {
    try {
        // Total Events
        const totalEvents = await Event.countDocuments();

        // Total Bookings (sum of all booked tickets)
        const totalBookings = await Event.aggregate([
            { $group: { _id: null, totalBookings: { $sum: '$bookings' } } }
        ]);

        // Total Users
        const totalUsers = await User.countDocuments();

        // Demand Level Data (Example: {High: 30, Medium: 20, Low: 10})
        const demandLevelData = await Event.aggregate([
            { $group: { _id: '$demand_level', count: { $sum: 1 } } }
        ]);
        
        // Interested Users Over Time
        const interestedCountData = await User.aggregate([
            { $group: { _id: '$createdAt', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // Price History Data
        const priceHistoryData = await Event.aggregate([
            { $unwind: '$price_history' },
            { $project: { date: '$price_history.date', price: '$price_history.price' } },
            { $sort: { date: 1 } }
        ]);

        const totalBookingsPerEvent = await Event.aggregate([
            { $project: { eventName: '$title', bookings: '$bookings' } },
            { $group: { _id: '$eventName', count: { $sum: '$bookings' } } },
            { $sort: { count: -1 } }
        ]);
        

        // User with the highest number of bookings
        const topUser = await User.aggregate([
            // Project to include userName, the length of past_bookings, and full user details
            {
                $project: {
                    userName: 1,
                    totalBookings: { $size: '$past_bookings' },
                    userDetails: '$$ROOT' // Include full user details
                }
            },
            // Sort by totalBookings in descending order
            {
                $sort: { totalBookings: -1 }
            },
            // Limit to the top user
            {
                $limit: 1
            }
        ]);
        

        console.log(topUser);

        // Final Price Distribution (from all events)
        const finalPriceDistribution = await Event.aggregate([
            { $group: { _id: '$final_price', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // Send the response
        res.json({
            totalEvents,
            totalBookings: totalBookings[0]?.totalBookings || 0,
            totalUsers,
            demandLevelData,
            priceHistoryData,
            interestedCountData,
            topUser : topUser.userDetails,
            finalPriceDistribution,
            totalBookingsPerEvent,
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAnalytics };
