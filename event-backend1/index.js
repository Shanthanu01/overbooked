const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const eventModel = require("./models/users"); // Adjust the path according to your project structure
const userModel = require("./models/userCredential");
const adminModel = require("./models/admins");
const axios = require('axios');
const path = require('path');
const apiRoutes = require('./routes/apiRoutes'); // Import the routes
const { spawn } = require('child_process');
const bcrypt = require('bcrypt');
const { title } = require("process");
const analyticsController = require('./analyticsController');


const app = express();

app.use(cors());
app.use(express.json());

// Use the imported routes
app.use('/', apiRoutes); // This mounts the routes at the root (e.g., http://localhost:5000/hate-speech)


// Connect to MongoDB
mongoose.connect("mongodb+srv://santhosh2210429:9003203594@eventdatabase.u5mhw.mongodb.net/test")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));


// Object to track clicks for each event
const eventClicks = {};


// Endpoint to fetch events (for customer home page)
app.get("/getevents", (req, res) => {
    eventModel.find()
        .then(events => res.json(events))
        .catch(err => res.json(err));
});

//console.log(eventModel.find())

app.post("/createevent", async (req, res) => {
    const { 
        title, 
        description, 
        base_price, 
        is_weekend, 
        location, 
        artist_name, 
        month, 
        day, 
        day_of_week, 
        date,
        demand_level, 
        totalTickets, 
        seatingCategories 
    } = req.body;

    try {
        // Calculate the total tickets if not provided
        const calculatedTotalTickets = seatingCategories.reduce((sum, category) => sum + Number(category.ticketsAvailable), 0);
        const total = totalTickets ? Number(totalTickets) : calculatedTotalTickets;

        // Validate that the total tickets match the sum of seating categories
        if (total !== calculatedTotalTickets) {
            return res.status(400).json({ message: "Total tickets must equal the sum of tickets in seating categories." });
        }

        const newEvent = new eventModel({
            title,
            description,
            base_price,
            is_weekend,
            location,
            artist_name,
            month,
            day,
            day_of_week,
            date,
            demand_level: demand_level || "Low", // Default to Low if not provided
            final_price: base_price, // Set initial final price to base price
            totalTickets: total, // Set the total tickets
            bookings: 0, // Initial bookings count
            seatingCategories: seatingCategories // Store seating categories as an array
        });
        
        await newEvent.save();
        res.status(201).json({ message: "Event created successfully", event: newEvent });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ message: "Error creating event" });
    }
});

app.get('/get-user-interest/:username', async (req, res) => {
    const { username } = req.params;  // Retrieve username from URL params
  
    try {
      // Find the user by username
      const user = await userModel.findOne({username : username });
  
      // If user is not found, return a 404 error
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Return the list of events the user has shown interest in
      res.json({ interestedEvents: user.interestedEvents });
  
    } catch (error) {
      console.error('Error fetching user interest:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


app.put('/api/clients/profile/:username', async (req, res) => {
    const { username } = req.params;
    const updatedData = req.body;

    // Your logic to find and update the user in the database
    // For example:
    try {
        const updatedProfile = await userModel.findOneAndUpdate(
        { username },
        updatedData,
        { new: true } // Optionally return the updated document
        );
        if (!updatedProfile) {
        return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send(updatedProfile);
    } catch (error) {
        res.status(500).send({ error: 'Server error while updating profile' });
    }
    });
    


// Endpoint to fetch customer profile based on username
app.get('/api/clients/profile/:username', async (req, res) => {
    try {
        const { username } = req.params;  // Extract username from URL parameters

        console.log("username :",username)
        // Find the user in the database by username
        const user = await userModel.findOne({ username: username.trim() });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If user is found, send their details (you can customize the fields as needed)
        res.json({
            name: user.name,
            age: user.age,
            email: user.email,
            username: user.username,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            phone: user.phone,
            address: user.address,
            billing_address: user.billing_address,
            past_bookings: user.past_bookings,
            interested_events : user.interestedEvents,
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password }); // Log received data

    const allUsers = await userModel.find({});
    console.log('All users in database:', allUsers);


    try {
        // Find user by usernames
        const user = await userModel.findOne({username : username.trim() });
        console.log('User fetched from DB:', user);

        if (!user) {
            console.log('Invalid user credentials'); // Log invalid user
            return res.status(401).json({ message: 'Invalid user credentials' });
        }

        // Compare entered password with hashed password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Invalid password credentials'); // Log invalid password
            return res.status(401).json({ message: 'Invalid password credentials' });
        }

        // Successful login
        console.log('Login successful for user:', user.username); // Log successful login
        res.status(200).json({ message: 'Login successful', user: { name: user.name, username: user.username } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

 // Path to your Admin model

app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Admin login attempt:', { username, password }); // Log received data

    const allUsers = await adminModel.find({});
    console.log('All users in database:', allUsers);

    try {
        // Find admin by username
        const admin = await adminModel.findOne({ username: username.trim() });
        console.log('Admin fetched from DB:', admin);

        if (!admin) {
            console.log('Invalid admin credentials'); // Log invalid admin
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        // Compare entered password with hashed password
        const isMatch = await admin.comparePassword(password.trim()); // Use bcrypt.compare for password validation
        if (!isMatch) {
            console.log('Invalid password credentials for admin'); // Log invalid password
            return res.status(401).json({ message: 'Invalid password credentials' });
        }

        // Successful admin login
        console.log('Admin login successful for user:', admin.username); // Log successful admin login
        res.status(200).json({ message: 'Admin login successful', user: { name: admin.name, username: admin.username } });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Endpoint to handle user signup
app.post('/signup', async (req, res) => {
    const { name, age, email, username, password , phone , address, billingAddress , } = req.body;
    console.log(name,age,email,username,password);

    try {
        // Check if the username or email already exists
        const existingUser = await userModel.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Create new user
        const newUser = new userModel({ name, age, email, username, password , phone , address , billing_address : billingAddress , past_bookings : []});
        await newUser.save();
        
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/getevent/title/:title', async (req, res) => {
    try {
        const { title } = req.params;
        console.log("Fetching event with title:", title);
        const event = await eventModel.findOne({ title: title });
        if (!event) {
            console.log("Event not found");
            return res.status(404).json({ message: "Event not found" });
        }
        console.log("Event found:", event);
        res.json(event);
    } catch (error) {
        console.error("Error fetching event details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/toggle-interest/:eventTitle', async (req, res) => {
    const { username } = req.body;
    const { eventTitle } = req.params;
  
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
  
    // Start a new session for each request
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      // Find the user and the event in parallel
      const userPromise = userModel.findOne({ username }).session(session);
      const eventPromise = eventModel.findOne({ title: eventTitle }).session(session);
  
      const [user, event] = await Promise.all([userPromise, eventPromise]);
  
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (!event) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Event not found' });
      }
  
      // Check if user is already interested in the event
      const isInterested = user.interestedEvents.includes(eventTitle);
  
      if (isInterested) {
        // If user is already interested, remove interest and decrement the count
        user.interestedEvents = user.interestedEvents.filter(event => event !== eventTitle);
        event.interestedCount -= 1;
      } else {
        // If user is not interested, add interest and increment the count
        user.interestedEvents.push(eventTitle);
        event.interestedCount += 1;
      }
  
      // Save both models within the same session
      await user.save({ session });
      await event.save({ session });
  
      // Commit the transaction to apply changes
      await session.commitTransaction();
      session.endSession();  // End session after committing the transaction
  
      // Respond with the updated count of interested users
      res.json({ interestedCount: event.interestedCount });
  
    } catch (error) {
      // If any error occurs, abort the transaction and end the session
      await session.abortTransaction();
      session.endSession();
      console.error('Error updating interest:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});






/*app.post('/toggle-interest/:eventTitle', async (req, res) => {
    const { username } = req.body;
    const { eventTitle } = req.params;
  
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
  
    // Start a new session for each request
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      // Find the user and the event in parallel
      const userPromise = userModel.findOne({ username }).session(session);
      const eventPromise = eventModel.findOne({ title: eventTitle }).session(session);
  
      const [user, event] = await Promise.all([userPromise, eventPromise]);
  
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (!event) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Event not found' });
      }
  
      // Prevent the user from clicking "interested" again if already interested
      if (user.interestedEvents.includes(eventTitle)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'User has already shown interest in this event' });
      }
  
      // Add event to the user's interested events and increment the event's interested count
      user.interestedEvents.push(eventTitle);
      event.interestedCount += 1;
  
      // Save both models within the same session
      await user.save({ session });
      await event.save({ session });
  
      // Commit the transaction to apply changes
      await session.commitTransaction();
      session.endSession();  // End session after committing the transaction
  
      // Respond with the updated count of interested users
      res.json({ interestedCount: event.interestedCount });
  
    } catch (error) {
      // If any error occurs, abort the transaction and end the session
      await session.abortTransaction();
      session.endSession();
      console.error('Error updating interest:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });*/

// Function to update dynamic prices
const updateDynamicPrices = async () => {
    try {
        const events = await eventModel.find(); // Fetch all events or apply filters as needed
        for (const event of events) {
            const data = {
                days_until_event: calculateDaysUntilEvent(event.date),
                bookings: event.bookings || 0,
                venue_capacity: event.totalTickets || 0,
                initial_price: event.base_price,
                is_weekend: event.is_weekend ? 1 : 0,
            };

            const response = await axios.post('http://127.0.0.1:5000/predict', data);
            const predictedPrice = response.data.predicted_price;


            const updatedSeatingCategories = event.seatingCategories.map((category) => {
                // Update the price of the category and return the modified object
                category.price = (category.price + predictedPrice) / 2;
                return category;  // Make sure to return the updated category
            });
            
    
            
            //console.log('Updated Seating Categories:', updatedSeatingCategories);
            

            // Update the price for each seating category
        
            //const seatingCategories = updatedSeatingCategories[0].__parent.seatingCategories; // Adjust based on how the data is structured

            //console.log('updated seating category' , seatingCategories);
            //console.log("student price" , updatedSeatingCategories.find(group => group.category === "Students").price);

            // Set final_price to the updated price of the "Student" category
            const studentCategory = updatedSeatingCategories.find(category => category.category === "Student");
            const finalPrice = studentCategory ? studentCategory.price : (event.base_price + predictedPrice) / 2;

            //console.log("finalprice , studentpric",finalPrice)

            // Update the price history
            const currentDate = new Date();
            const newPriceHistoryEntry = { date: currentDate, price: finalPrice };

            // Update the event's final price, seating categories, and price history in the database
            await eventModel.updateOne(
                { title: event.title },
                { 
                    $set: { 
                        final_price: finalPrice, 
                        seatingCategories: updatedSeatingCategories 
                    },
                    $push: { 
                        price_history: newPriceHistoryEntry 
                    }
                }
            );
        }
        console.log('Dynamic prices updated successfully.');
    } catch (error) {
        console.error('Error updating dynamic prices:', error);
    }
};

// Schedule the price updates every hour (3600000 milliseconds)
setInterval(updateDynamicPrices, 3600000);

app.post("/predict-dynamic-price", async (req, res) => {
    const { event_id } = req.body;

    try {
        const event = await eventModel.findOne({ title: event_id });
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Prepare data for the Flask API
        const data = {
            days_until_event: calculateDaysUntilEvent(event.date),
            bookings: event.bookings || 0,
            venue_capacity: event.totalTickets || 0,
            initial_price: event.base_price,
            is_weekend: event.is_weekend ? 1 : 0,
        };

        const response = await axios.post('http://127.0.0.1:5000/predict', data);
        const predictedPrice = response.data.predicted_price;

        

        console.log("previous seating category" , event.seatingCategories);

        const updatedSeatingCategories = event.seatingCategories.map((category) => {
            // Update the price of the category and return the modified object
            category.price = (category.price + predictedPrice) / 2;
            return category;  // Make sure to return the updated category
        });
        
   
        
        console.log("updated seating category", updatedSeatingCategories);
        // Calculate the updated price for each seating category

        
        //console.log(updatedSeatingCategories ? updatedSeatingCategories : "null");


        //const seatingCategories = updatedSeatingCategories[0].__parent.seatingCategories; // Adjust based on how the data is structured

        //console.log('updated seating category' , seatingCategories);
        //console.log("student price" , updatedSeatingCategories.find(group => group.category === "Students").price);

        // Set finalPrice to the updated price of the "Student" category
        const studentCategory = updatedSeatingCategories.find(category => category.category === "Student");



        const finalPrice = studentCategory ? studentCategory.price : (event.base_price + predictedPrice) / 2;
      

        // Update the price history
        const currentDate = new Date();
        const newPriceHistoryEntry = { date: currentDate, price: finalPrice };

        // Update the event's final price, seating categories, and price history in the database
        await eventModel.updateOne(
            { title: event_id },
            { 
                $set: { 
                    final_price: finalPrice, 
                    seatingCategories: updatedSeatingCategories 
                },
                $push: { 
                    price_history: newPriceHistoryEntry 
                }
            }
        );

        res.status(200).json({ predicted_price: predictedPrice, final_price: finalPrice, seatingCategories: updatedSeatingCategories });
    } catch (error) {
        console.error('Error fetching predicted price:', error);
        res.status(500).json({ message: 'Failed to fetch predicted price' });
    }
});


app.post('/api/events/:title/confirm-booking', async (req, res) => {
    try {
        const { title, username, ticketCounts, totalCost } = req.body;

        // Validate input data
        if (!title || !username || !ticketCounts || !totalCost) {
            return res.status(400).json({ message: "Missing required data" });
        }

        console.log("Incoming Data:", { title, username, ticketCounts, totalCost });

        // Find the event by title and apply optimistic locking
        const event = await eventModel.findOne({ title: title });
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        console.log("Event Found:", event);

        // Check if enough tickets are available in each seating category
        const updatedSeatingCategories = event.seatingCategories.map((category) => {
            const ticketsBooked = ticketCounts[category.category] || 0;

            if (category.ticketsAvailable < ticketsBooked) {
                throw new Error(`Not enough tickets available for ${category.category}`);
            }

            return {
                ...category,
                ticketsAvailable: category.ticketsAvailable - ticketsBooked,
            };
        });

        // Calculate total tickets booked
        const totalTicketsBooked = Object.values(ticketCounts).reduce((sum, count) => sum + count, 0);

        // Ensure totalTickets doesn't go negative
        if (event.totalTickets < totalTicketsBooked) {
            throw new Error("Not enough total tickets available");
        }

        // Apply updates
        event.seatingCategories = updatedSeatingCategories;
        event.bookings += totalTicketsBooked;
        event.totalTickets -= totalTicketsBooked;
        event.version += 1; // Increment version for optimistic locking

        console.log("Updated Event Before Save:", event);

        // Save the updated event
        const updatedEvent = await eventModel.findOneAndUpdate(
            { _id: event._id, version: event.version - 1 }, // Check version before saving
            { ...event },
            { new: true }
        );

        if (!updatedEvent) {
            throw new Error("Conflict detected: Event was updated by another process. Please retry.");
        }

        console.log("Event Updated:", updatedEvent);

        // Find the user and update past bookings
        const user = await userModel.findOne({ username: username.trim() });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("User Found:", user);

        if (!user.past_bookings.includes(title)) {
            user.past_bookings.push(title);
            await user.save();
        }

        console.log("User Updated:", user);

        // Respond with booking confirmation
        res.status(200).json({
            message: "Booking confirmed",
            eventTitle: updatedEvent.title,
            totalCost,
            userEmail: user.email,
            seatingCategories: updatedEvent.seatingCategories,
        });
    } catch (error) {
        console.error("Error confirming booking:", error);
        res.status(500).json({ message: `Error confirming booking: ${error.message}` });
    }
});

app.post('/api/send-ticket-email', async (req, res) => {
    const { email, eventTitle, ticketSummary } = req.body;
  
    // Path to the Python script
    const pythonScriptPath = path.join(__dirname, 'send_email.py');
  
    // Execute the Python script
    const pythonProcess = spawn('python3', [pythonScriptPath, email, eventTitle, JSON.stringify(ticketSummary)]);
  
    pythonProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
  
    pythonProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
  
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        res.status(200).json({ message: 'Email sent successfully with attachment' });
      } else {
        res.status(500).json({ message: 'Failed to send email' });
      }
    });
  });

  app.get("/admin/analytics", async (req, res) => {
    try {
      // Total bookings and total revenue
      const totalBookings = await eventModel.aggregate([
        {
          $group: {
            _id: null,
            totalBookings: { $sum: "$bookings" },
            totalRevenue: { $sum: "$final_price" },
          },
        },
      ]);
  
      // Bookings by event type (category)
      const bookingsByType = await eventModel.aggregate([
        {
          $group: {
            _id: "$category",
            bookings: { $sum: "$bookings" },
          },
        },
      ]);
  
      // Bookings by demand level
      const bookingsByDemand = await eventModel.aggregate([
        {
          $group: {
            _id: "$demand_level",
            bookings: { $sum: "$bookings" },
          },
        },
      ]);
  
      // Interested events count (events with at least 10 bookings)
      const interestedEventsCount = await eventModel.countDocuments({
        bookings: { $gte: 10 },
      });
  
      // Bookings by location (for map visualization)
      const bookingsByLocation = await eventModel.aggregate([
        {
          $group: {
            _id: "$location",
            bookings: { $sum: "$bookings" },
          },
        },
      ]);
  
      // Price deviation by category (comparison between base and final price)
      const priceDeviationByCategory = await eventModel.aggregate([
        {
          $group: {
            _id: "$category",
            averageBasePrice: { $avg: "$base_price" },
            averageFinalPrice: { $avg: "$final_price" },
          },
        },
        {
          $project: {
            _id: 1,
            priceDeviation: {
              $subtract: ["$averageFinalPrice", "$averageBasePrice"],
            },
          },
        },
      ]);
  
      // Send all the aggregated data as JSON
      res.json({
        totalBookings: totalBookings[0] ? totalBookings[0].totalBookings : 0,
        totalRevenue: totalBookings[0] ? totalBookings[0].totalRevenue : 0,
        bookingsByType,
        bookingsByDemand,
        bookingsByLocation,
        interestedEventsCount,
        priceDeviationByCategory,
      });
    } catch (error) {
      console.error("Error fetching analytics data", error);
      res.status(500).send("Server Error");
    }
  });
  
  


function calculateDaysUntilEvent(eventDate) {
    const today = new Date();
    const eventDateObj = new Date(eventDate);
    const timeDifference = eventDateObj - today;
    return Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
}


  

// Start the server
app.listen(3001, () => {
    console.log("Server is running on port 3001");
});


