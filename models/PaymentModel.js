import mongoose from "mongoose";

const { Schema, model } = mongoose;

const paymentSchema = new Schema({
    booking: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    amount: {
        type: Number,
        required: true,
      },
      paymentStatus: {
        type: String,
        enum: ['Failed', 'Succeeded'],
        default: 'Failed',
      },
}, {
    timestamps: true
});
const PaymentModel = model('Payment', paymentSchema);
export default PaymentModel;
