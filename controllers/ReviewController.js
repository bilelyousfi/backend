import ReviewM from "../models/ReviewModel.js"; 


const createReview = async (req, res) => {
    const {  rating, comment } = req.body;
    const { service ,provider} = req.params; 
    const client = req.payload._id

    try {
        const newReview = new ReviewM({
            client,
            service,
            provider,
            rating,
            comment
        });

        await newReview.save();
        res.status(201).json({
            status: true,
            message: "Review successfully created",
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create review: ' + error.message });
    }
};

const getAllReviews = async (req, res) => {
    try {
        const reviews = await ReviewM.find({ etatDelete: false })
            .populate('client')
            .populate('service')
            .populate('provider');
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get reviews: ' + error.message });
    }
};

const getReviewsByService = async (req, res) => {
    const { serviceId } = req.params;

    try {
        const reviews = await ReviewM.find({ service: serviceId, etatDelete: false })
            .populate('client')
            .populate('provider');
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get reviews for service: ' + error.message });
    }
};

const deleteReview = async (req, res) => {
    const { reviewId } = req.params;

    try {
        const updatedReview = await ReviewM.findByIdAndUpdate(reviewId, { etatDelete: true }, { new: true });
        if (!updatedReview) {
            return res.status(404).json({ message: "Review not found" });
        }
        res.status(200).json({ message: 'Review marked as deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to mark review as deleted: ' + error.message });
    }
};

const updateReview = async (req, res) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    try {
        const updatedReview = await ReviewM.findByIdAndUpdate(reviewId, {
            rating,
            comment
        }, { new: true });

        if (!updatedReview) {
            return res.status(404).json({ message: "Review not found" });
        }
        res.status(200).json({
            message: "Review updated successfully",
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update review: ' + error.message });
    }
};
const getReviewsByClientId = async (req, res) => {
    const { clientId } = req.params;

    try {
        const reviews = await ReviewM.find({ client: clientId, etatDelete: false })
            .populate('service')
            .populate('provider');
        if (reviews.length === 0) {
            return res.status(404).json({ message: "No reviews found for this client" });
        }
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews by client: ' + error.message });
    }
};


export default {createReview,getAllReviews,getReviewsByService,deleteReview,updateReview,getReviewsByClientId};
