import express from "express";
import RevController from "../controllers/ReviewController.js"; 
import {verifyAdmin,verifyAndAuth,} from "../middleware/verifyToken.js"; 
const router = express.Router();


router.post("/addReview/:service/:provider", verifyAndAuth, RevController.createReview);
router.get("/getAllReview", RevController.getAllReviews);
router.get("/getReviewsByService/:serviceId", RevController.getReviewsByService);
router.patch("/deleteReview/:reviewId", RevController.deleteReview);
router.put("/updateReview/:reviewId", RevController.updateReview);
router.post("/getReviewsByClientId/:clientId",  RevController.getReviewsByClientId);


export default router;