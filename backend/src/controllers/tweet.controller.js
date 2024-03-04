import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// =================================================================
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Content must be required for tweet creation");
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id,
    });
    if (!tweet) {
        throw new ApiError(400, "Error creating tweet");
    }

    res.status(201).json(
        new ApiResponse(201, tweet, "Tweet created successfully")
    );
});

//================================================================
const getTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!tweetId) {
        throw new ApiError(400, "User id must be provided");
    }

    const tweet = await Tweet.findOne({
        _id: tweetId,
    });
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    res.status(200).json(
        new ApiResponse(200, tweet, "Tweet retrieved successfully")
    );
});

//================================================================
const updateUserTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!tweetId && !mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Tweet id not found");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString()!== req.user._id.toString()) {
        throw new ApiError(401, "You are not the owner of this tweet");
    }

    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Content must be required for tweet update");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { content },
        { new: true }
    );
    if (!updatedTweet) {
        throw new ApiError(400, "Something went wrong updating tweet");
    }

    res.status(200).json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfully")
    );
});

//================================================================
const deleteUserTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!tweetId && !mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Tweet id not found");
    }

    const tweet = await Tweet.findById(tweetId);
    if (tweet.owner.toString()!== req.user._id.toString()) {
        throw new ApiError(401, "You are not the owner of this tweet");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    if (!deletedTweet) {
        throw new ApiError(400, "Something went wrong deleting tweet");
    }

    res.status(200).json(
        new ApiResponse(200, deletedTweet, "Tweet deleted successfully")
    );
});

// =================================================================
export { createTweet, getTweet, updateUserTweet, deleteUserTweet };
