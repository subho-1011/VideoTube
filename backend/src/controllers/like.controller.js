import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// toggle video like functionality
const toggleVideo = asyncHandler(async (req, res) => {
    // get video id from params
    const { videoId } = req.params;
    if (!videoId && !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "video id is required");
    }

    // get video from database
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "video not found");
    }

    // check if user has already liked this video
    const isLiked = await Like.findOne({
        userId: req.user._id,
        videoId: video._id,
    });

    // if user has already liked this video then remove like
    if (isLiked) {
        const deletedLike = await Like.findByIdAndDelete(isLiked._id);
        return res
            .status(200)
            .json(
                new ApiResponse(200, deletedLike, "video unliked successfully")
            );
    }

    // if user has not liked this video then add like
    const newLike = await Like.create({
        userId: req.user._id,
        videoId: video._id,
    });

    // return new like response
    return res
        .status(200)
        .json(new ApiResponse(200, newLike, "video liked successfully"));
});

// toggle comment like functionality
const toggleComment = asyncHandler(async (req, res) => {
    // get comment id from params
    const { commentId } = req.params;
    if (!commentId && !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "comment id is required");
    }

    // get comment from database
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "comment not found");
    }

    // check if user has already liked this comment
    const isLiked = await Like.findOne({
        likeBy: req.user._id,
        comment: comment._id,
    });

    // if user has already liked this comment then remove like
    if (isLiked) {
        const deletedLike = await Like.findByIdAndDelete(isLiked._id);
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    deletedLike,
                    "comment unliked successfully"
                )
            );
    }

    // if user has not liked this comment then add like
    const newLike = await Like.create({
        likeBy: req.user._id,
        comment: comment._id,
    });

    // return new like response
    return res
        .status(200)
        .json(new ApiResponse(200, newLike, "comment liked successfully"));
});

// toggle tweet like functionality
const toggleTweet = asyncHandler(async (req, res) => {
    // get tweet id from params
    const { tweetId } = req.params;
    if (!tweetId && !mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "tweet id is required");
    }

    // get tweet from database
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "tweet not found");
    }

    // check if user has already liked this tweet
    const isLiked = await Like.findOne({
        likeBy: req.user._id,
        tweet: tweet._id,
    });

    // if user has already liked this tweet then remove like
    if (isLiked) {
        const deletedLike = await Like.findByIdAndDelete(isLiked._id);
        return res
            .status(200)
            .json(
                new ApiResponse(200, deletedLike, "tweet unliked successfully")
            );
    }

    // if user has not liked this tweet then add like
    const newLike = await Like.create({
        likeBy: req.user._id,
        tweet: tweet._id,
    });

    // return new like response
    return res
        .status(200)
        .json(new ApiResponse(200, newLike, "tweet liked successfully"));
});

// get all liked videos
const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideo = await Like.aggregate([
        {
            $match: {
                likeBy: req.user._id,
            },
        },
        {
            $lookup: {
                from: "videos",
                foreignField: "_id",
                localField: "video",
                as: "video",
                pipeline: [
                    {
                        $project: {
                            videoFile: 1,
                            thumbnail: 1,
                            duration: 1,
                            title: 1,
                            views: 1,
                        },
                    },
                ],
            },
        },
        {
            $unwind: {
                path: "$video",
            },
        },
        {
            $unset: "likeBy",
        },
    ]);

    return res
     .status(200)
     .json(new ApiResponse(200, likedVideo, "liked videos fetched successfully"));
});

export { toggleVideo, toggleComment, toggleTweet, getLikedVideos };
