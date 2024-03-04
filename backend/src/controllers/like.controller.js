import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId && !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "video id is required");
    }

    const isLiked = await Like.findOne({
        likeBy: req.user._id,
        video: videoId,
    });

    if (isLiked) {
        const deletedLike = await Like.findByIdAndDelete(isLiked._id);
        return res
            .status(200)
            .json(
                new ApiResponse(200, deletedLike, "video like reomve successfully")
            );
    }


    const newLike = await Like.create({
        likeBy: req.user._id,
        video: videoId,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, newLike, "video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!commentId && !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "comment id is required");
    }

    const isLiked = await Like.findOne({
        likeBy: req.user._id,
        comment: commentId,
    });

    if (isLiked) {
        const deletedLike = await Like.findByIdAndDelete(isLiked._id);
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    deletedLike,
                    "comment like remove successfully"
                )
            );
    }

    const newLike = await Like.create({
        likeBy: req.user._id,
        comment: commentId,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, newLike, "comment liked successfully"));
});


const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!tweetId && !mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "tweet id is required");
    }


    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "tweet not found");
    }


    const isLiked = await Like.findOne({
        likeBy: req.user._id,
        tweet: tweet._id,
    });


    if (isLiked) {
        const deletedLike = await Like.findByIdAndDelete(isLiked._id);
        return res
            .status(200)
            .json(
                new ApiResponse(200, deletedLike, "tweet like remove successfully")
            );
    }


    const newLike = await Like.create({
        likeBy: req.user._id,
        tweet: tweet._id,
    });


    return res
        .status(200)
        .json(new ApiResponse(200, newLike, "tweet liked successfully"));
});


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
        .json(
            new ApiResponse(
                200,
                likedVideo,
                "liked videos fetched successfully"
            )
        );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
