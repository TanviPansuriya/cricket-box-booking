const Turf = require("../models/turfModel");
const Booking = require("../models/bookingModel");
const Contact = require("../models/contactModel");

// Get turfs by location
const getTurfsByLocation = async (req, res) => {
  const { location } = req.query;

  if (!location) {
    return res.status(400).json({ message: "Location required" });
  }
  try {
    const turfs = await Turf.find({ location: { $regex: location, $options: 'i' } });

    if (turfs.length === 0) {
      return res.status(404).json({ message: "No turfs found in this location" });
    }

    res.status(200).json({ turfs });
  } catch (error) {
    console.error("Error fetching turfs:", error);
    res.status(500).json({ message: error.message });
  }
};

// Search turfs based on name and location
const searchTurfs = async (req, res) => {
  try {
    const { name, location } = req.query;

    const turfs = await Turf.find({
      $or: [
        { name: { $regex: name, $options: 'i' } },
        { location: { $regex: location, $options: 'i' } }
      ]
    });

    if (turfs.length === 0) {
      return res.status(404).json({ message: "No turfs found" });
    }

    res.status(200).json({ turfs });
  } catch (error) {
    console.error("Error fetching turfs:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all turfs for users
const getAllTurfs = async (req, res) => {
  try {
    const turfs = await Turf.find();
    if (!turfs || turfs.length === 0) {
      return res.status(404).json({ message: "No turfs found" });
    }
    res.status(200).json({ message: "Turfs fetched successfully", turfs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch turfs" });
  }
};

// Booking
const createBooking = async (req, res) => {
  const { turfId, userPhone, userEmail, slot, date } = req.body;

  try {
    const turf = await Turf.findById(turfId);
    if (!turf) return res.status(404).json({ message: "Turf not found" });

    const existingUserBooking = await Booking.findOne({
      turfId,
      userPhone,
      userEmail,
      slot,
      date
    });

    if (!turf.time.includes(slot)) {
      return res.status(400).json({ message: "Selected slot is not available." });
    }

    const existingBooking = await Booking.findOne({ turfId, slot, date });
    if (existingBooking) {

      const bookedBookings = await Booking.find({ turfId, date });
      const bookedSlots = bookedBookings.map(booking => booking.slot);
      const availableSlots = turf.time.filter(slot => !bookedSlots.includes(slot));

      if (existingUserBooking) {
        return res.status(400).json({
          message: "You have already booked this turf for the selected date and time.",
          availableSlots
        });
      }
      if (availableSlots.length === 0) {
        return res.status(400).json({
          message: "No available turfs for this day.",
        });
      }

      return res.status(400).json({
        message: "Selected slot is already booked.",
        availableSlots,

      });
    }
    const allBookingsForDate = await Booking.find({ date });
    const allBookedSlots = allBookingsForDate.map(booking => booking.slot);

    const availableTurfSlots = turf.time.filter(slot => !allBookedSlots.includes(slot));

    if (availableTurfSlots.length === 0) {
      return res.status(400).json({
        message: "No available turfs for this day.",
      });
    }

    const newBooking = new Booking({
      turfId,
      userPhone,
      userEmail,
      slot,
      date
    });
    await newBooking.save();

    res.status(201).json({
      message: "Booking successful. We will contact you soon.",
      booking: newBooking
    });
  } catch (error) {
    // console.error("Error in booking:", error);
    res.status(500).json({ message: error.message });
  }
};

// Contact form
const addContact = async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(200).json({ message: 'Message sent successfully!',contact });
  } catch (error) {
    res.status(400).json({ error: 'Failed to send message', message: error.message });
  }
};

module.exports = { getTurfsByLocation, getAllTurfs, searchTurfs, createBooking,addContact };


// const bookTurf = async (req, res) => {
//     try {
//         const { turfId, userDetails, bookingDetails } = req.body;

//         // Step 1: Find the turf and get the admin ID
//         const turf = await Turf.findById(turfId);
//         if (!turf) {
//             return res.status(404).json({ message: "Turf not found" });
//         }

//         // Step 2: Create a new booking with the turf's admin ID
//         const newBooking = new Booking({
//             turfId,
//             adminId: turf.admin, // Linking booking to the admin
//             userDetails,
//             bookingDetails,
//             status: "Pending"
//         });

//         await newBooking.save();

//         res.status(201).json({ message: "Booking successful!", booking: newBooking });
//     } catch (error) {
//         console.error("Error booking turf:", error);
//         res.status(500).json({ error: "Failed to book turf" });
//     }
// };

// {
//   "bookings": [
//       {
//           "_id": "65a0f6b9d3e74a5c8e0c5678",
//           "turfId": {
//               "name": "Elite Sports Arena",
//               "location": { "lat": 19.076, "lng": 72.8777 }
//           },
//           "userDetails": {
//               "name": "John Doe",
//               "phone": "9876543210",
//               "email": "john@example.com"
//           },
//           "bookingDetails": {
//               "date": "2025-02-18",
//               "timeSlot": {
//                   "startTime": "10:00 AM",
//                   "endTime": "11:00 AM",
//                   "price": 500
//               }
//           },
//           "status": "Pending",
//           "createdAt": "2025-02-17T12:00:00.000Z"
//       }
//   ]
// }
