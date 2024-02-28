import mongoose, { Types } from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getChannelVideos = asyncHandler(async (req, res) => {
    const channelVideos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id),
                isPulished: false,
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, channelVideos, "channel videos"));
});

export const getChannelStats = asyncHandler(async (req, res) => {
    const subscribers = await Subscription.find({
        channel: new mongoose.Types.ObjectId(req.user?._id),
    }).countDocuments();

    const videosCount = await Video.find({
        owner: req.user?._id,
    }).countDocuments();

    const viewsCount = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id),
                isPulished: false,
            },
        },
        {
            $group: {
                _id: null,
                count: {
                    $sum: "$views",
                },
            },
        },
    ]);
    const views = viewsCount[0].count;

    const likesCount = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id),
                isPulished: false,
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
                pipeline: [
                    {
                        $count: "likes",
                    },
                ],
            },
        },
        {
            $group: {
                _id: null,
                likesCount: {
                    $sum: "$likes.likes",
                },
            },
        },
    ]);
    const likes = likesCount[0].likesCount;

    // const viewsCount = await Video.aggregate([
    //     {
    //         $match: {
    //             owner: new mongoose.Types.ObjectId(req.user?._id),
    //         },
    //     },
    //     {
    //         $group: {
    //             _id: null,
    //             viewsCount: {
    //                 $sum: 1,
    //             },
    //         },
    //     },
    // ]);

    const channelInfo = await User.findById(req.user?._id).select(
        "-password -refreshToken"
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                channelInfo,
                subscribers,
                videosCount,
                views,
                likes,
            },
            "channel status"
        )
    );
});
