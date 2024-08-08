import BookingM from "../models/BookingModel.js"; 

const createBooking = async (req, res) => {
    const client = req.payload._id
    const { service ,provider} = req.params; 
    const { date, timeSlot, comments } = req.body;

    try {
        const newBooking = new BookingM({
            client,
            service,
            provider,
            date,
            timeSlot,
            comments
        });

        await newBooking.save();
        res.status(201).json({
            status: true,
            message: "Booking successfully created",
           
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create booking: ' + error.message });
    }
};

const getAllBookings = async (req, res) => {
    try {
        const bookings = await BookingM.find({ etatDelete: false })
            .populate('client')
            .populate('service')
            .populate('provider');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get bookings: ' + error.message });
    }
};
const getBookingById = async (req, res) => {
    const { bookingId } = req.params;

    try {
        const booking = await BookingM.findOne({ _id: bookingId, etatDelete: false })
            .populate('client')
            .populate('service')
            .populate('provider');
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching booking: ' + error.message });
    }
};

const updateBooking = async (req, res) => {
    const { bookingId } = req.params;
    const { date, timeSlot, status, comments } = req.body;

    try {
        const updatedBooking = await BookingM.findByIdAndUpdate(
            bookingId, 
            { date, timeSlot, status, comments },
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.status(200).json({
            message: "Booking updated successfully",
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update booking: ' + error.message });
    }
};
const deleteBooking = async (req, res) => {
    const { bookingId } = req.params;

    try {
        const deletedBooking = await BookingM.findByIdAndUpdate(
            bookingId, 
            { etatDelete: true },
            { new: true }
        );
        if (!deletedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.status(200).json({ message: 'Booking marked as deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to mark booking as deleted: ' + error.message });
    }
};

const updateBookingStatus = async (req, res) => {
    const { bookingId } = req.params; 
    const { status } = req.body; 

    try {
        if (!['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(status)) {
            return res.status(400).json({ message: "Invalid status provided" });
        }

        const updatedBooking = await BookingM.findByIdAndUpdate(
            bookingId, 
            { status },
            { new: true, runValidators: true }
        ).populate('client').populate('service').populate('provider');

        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({
            message: "Booking status updated successfully",
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update booking status: ' + error.message });
    }
};

const getBookingsByClientId = async (req, res) => {
    const { clientId } = req.params; 

    try {
        const bookings = await BookingM.find({ client: clientId, etatDelete: false })
            .populate('service')
            .populate('provider');

        if (bookings.length === 0) {
            return res.status(404).json({ message: "No bookings found for this client" });
        }
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings by client: ' + error.message });
    }
};

const getBookingsByProviderId = async (req, res) => {
    const { providerId } = req.params; // ID from URL

    try {
        const bookings = await BookingM.find({ provider: providerId, etatDelete: false })
            .populate('client')
            .populate('service');
            

        if (bookings.length === 0) {
            return res.status(404).json({ message: "No bookings found for this provider" });
        }
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings by provider: ' + error.message });
    }
};

const getBookingsByServiceId = async (req, res) => {
    const { serviceId } = req.params; // ID from URL

    try {
        const bookings = await BookingM.find({ service: serviceId, etatDelete: false })
            .populate('client')
            .populate('provider');

        if (bookings.length === 0) {
            return res.status(404).json({ message: "No bookings found for this service" });
        }
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings by service: ' + error.message });
    }
};



export default {createBooking,getAllBookings,getBookingById,updateBooking,deleteBooking,updateBookingStatus,getBookingsByClientId,getBookingsByProviderId,getBookingsByServiceId};
