import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getChannelVideos = asyncHandler(async (req, res) => {
    const channelVideos = await Video.findById({
        owner: req.user?._id,
    }).select("-owner -__v");

    return res
        .status(200)
        .json(new ApiResponse(200, channelVideos, "channel videos"));
});

export const getChannelStats = asyncHandler(async (req, res) => {
    const subscribersCount = await Subscription.find({
        owner: req.user?._id,
    }).countDocuments();

    const videosCount = await Video.find({
        owner: req.user?._id,
    }).countDocuments();

    const likesCount = await Like.aggregate([
        {
            $match: {
                comment: null,
                tweet: null,
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
            },
        },
        {
            $unwind: {
                path: "$video",
            },
        },
        {
            $match: {
                "video.owner": new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $group: {
                _id: null,
                likesCount: {
                    $sum: 1,
                },
            },
        },
        {
            $project: {
                _id: 0,
                likesCount: 1,
            },
        },
    ]);

    const viewsCount = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $group: {
                _id: null,
                viewsCount: {
                    $sum: 1,
                },
            },
        },
    ]);

    const channelInfo = new User.findById(req.user?._id).select(
        "-password -refreshToken"
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                subscribersCount,
                videosCount,
                likesCount,
                viewsCount,
                channelInfo,
            },
            "channel stats"
        )
    );
});
