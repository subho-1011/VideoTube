import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// =================================================================
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(400, "Channel not found while toggling channel ");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId,
    });

    if (existingSubscription) {
        await Subscription.findOneAndDelete({
            subscriber: req.user._id,
            channel: channelId,
        });
        return res
            .status(200)
            .json(
                new ApiResponse(
                    true,
                    200,
                    "Unsubscription toggled successfully"
                )
            );
    }

    const newSubscription = new Subscription({
        subscriber: req.user._id,
        channel: channelId,
    });
    await newSubscription.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                newSubscription,
                "Subscription toggled successfully"
            )
        );
});

// =================================================================

const getUserChannelSubcribers = asyncHandler(async (req, res) => {
    // get channel from params
    const { channelId } = req.params;

    // find channel in database
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(
            400,
            "Channel not found in database... subscription time"
        );
    }

    // create pipeline for subscription
    const channelSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                subscribers: {
                    $arrayElemAt: ["$subscribers", 0],
                },
            },
        },
        {
            $replaceRoot: {
                newRoot: "$subscribers",
            }
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channelSubscribers,
                "Get channel subscribers successfully"
            )
        );
});

// =================================================================

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    // find user in database
    if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
        throw new ApiError(400, "User not found in database...");
    }

    const subscribedToChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannels",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                subscribedChannels: {
                    $arrayElemAt: ["$subscribedChannels", 0],
                },
            },
        },
        {
            $replaceRoot: {
                newRoot: "$subscribedChannels",
            }
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribedToChannels,
                "Subscribed to channel finished"
            )
        );
});


export { toggleSubscription, getUserChannelSubcribers, getSubscribedChannels };
