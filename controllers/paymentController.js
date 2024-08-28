import mongoose from 'mongoose';
import stripe from '../config/stripe.js';
import PaymentModel from '../models/paymentModel.js';
import TransactionModel from '../models/transactionModel.js'; 
import BookingM from "../models/BookingModel.js"; 


// Function to create payment  
export const createPayment = async (req, res) => {
  try {
    const { bookingID, amount, currency } = req.body;

    // Validate bookingID
    if (!bookingID || !mongoose.Types.ObjectId.isValid(bookingID)) {
      console.log('Invalid Booking ID');
      return res.status(400).json({ message: 'Valid Booking ID is required' });
    }

    // Fetch the booking to ensure it exists
    const booking = await BookingM.findById(bookingID);
    if (!booking) {
      console.log('Booking not found');
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects the amount in cents
      currency: currency,
    });

    console.log('Payment Intent created:', paymentIntent);

    // Create a new payment record in your database
    const newPayment = new PaymentModel({
      booking: booking._id, // Link the payment to the booking
      amount: amount,
      paymentStatus: 'Failed', // Initially set to 'Failed', will update upon success
    });

    await newPayment.save();

    console.log('Payment record created:', newPayment);

    // Return necessary information to the client
    return res.json({
      client_secret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      paymentID: newPayment._id,
    });
  } catch (error) {
    console.error('Error during payment creation:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Error during payment creation' });
    }
  }
};



// Function to confirm payment and update contract dates
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, paymentID } = req.body;

    if (!paymentIntentId || !paymentID) {
      console.log('Missing required fields for payment confirmation');
      return res.status(400).json({ message: 'Payment Intent ID and Payment ID are required' });
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log('Payment Intent retrieved:', paymentIntent);

    // Find the payment record in your database
    const payment = await PaymentModel.findById(paymentID);
    if (!payment) {
      console.log('Payment not found in database');
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (paymentIntent.status === 'succeeded') {
      // Update payment status to 'Succeeded'
      payment.paymentStatus = 'Succeeded';
      await payment.save();

      // Find the related booking
      const booking = await BookingM.findById(payment.booking);
      if (booking) {
        booking.status = 'Confirmed'; // Assuming you want to confirm the booking upon successful payment
        await booking.save();

        // Create a transaction record for the successful payment
        const newTransaction = new TransactionModel({
          user: booking.client, // Use the client ID from the booking
          payment: payment._id,
          transactionType: 'Payment',
        });

        await newTransaction.save();

        console.log('Transaction record created:', newTransaction);

        res.status(200).json({
          message: 'Payment succeeded and booking updated successfully',
          payment: payment,
          booking: booking,
          transaction: newTransaction,
        });
      } else {
        res.status(404).json({ message: 'Booking not found' });
      }
    } else {
      // Update payment status to 'Failed'
      payment.paymentStatus = 'Failed';
      await payment.save();

      console.log('Payment failed with status:', paymentIntent.status);

      res.status(400).json({
        message: 'Payment failed',
        status: paymentIntent.status,
        payment: payment,
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Error confirming payment', error: error.message });
  }
};
