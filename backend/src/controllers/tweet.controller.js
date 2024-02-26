import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// create new tweet
const createTweet = asyncHandler(async (req, res) => {
    // get content from body
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Content must be required for tweet creation");
    }

    // create new tweet
    const tweet = await Tweet.create({
        content,
        user: req.user._id,
    });
    if (!tweet) {
        throw new ApiError(400, "Error creating tweet");
    }

    // return response
    res.status(201).json(
        new ApiResponse(201, tweet, "Tweet created successfully")
    );
});

// get user tweet
const getUserTweet = asyncHandler(async (req, res) => {
    // get userid from params
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(400, "User id must be provided");
    }

    // get user tweet
    const tweet = await Tweet.findOne({
        user: userId,
    });
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // return response
    res.status(200).json(
        new ApiResponse(200, tweet, "Tweet retrieved successfully")
    );
});

// update user tweet
const updateUserTweet = asyncHandler(async (req, res) => {
    // get tweet id from params
    const { tweetId } = req.params;
    if (!tweetId && !mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Tweet id not found");
    }

    // get content from body
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Content must be required for tweet update");
    }

    // update user tweet
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { content },
        { new: true }
    );
    if (!updatedTweet) {
        throw new ApiError(400, "Something went wrong updating tweet");
    }

    // return response
    res.status(200).json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfully")
    );
});

// delete user tweet
const deleteUserTweet = asyncHandler(async (req, res) => {
    // get tweet id from params
    const { tweetId } = req.params;
    if (!tweetId && !mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Tweet id not found");
    }

    // delete user tweet
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    if (!deletedTweet) {
        throw new ApiError(400, "Something went wrong deleting tweet");
    }

    // return response
    res.status(200).json(
        new ApiResponse(200, deletedTweet, "Tweet deleted successfully")
    );
});

export { createTweet, getUserTweet, updateUserTweet, deleteUserTweet };
