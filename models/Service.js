import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const serviceSchema = new Schema({
    provider: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    subCategory: {
        type: Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true
    },
    price: {
        type: String,
        required: true
    },
    availability: {
        type: Boolean,
        default: true
    },
    avatar: [{
        type: String
    }]
}, {
    timestamps: true
});

const Service = model('Service', serviceSchema);

export default Service;
