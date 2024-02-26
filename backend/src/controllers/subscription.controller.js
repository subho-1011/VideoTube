import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    // get channel id from params
    const { channelId } = req.params;
    // console.log(channelId);

    // find channel in database
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(400, "Channel not found while toggling channel ");
    }
    // console.log(channel);

    // check the user subscription status
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId,
    });
    // console.log(existingSubscription);

    // if channel is already subscribed then subscribe to channel
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

    // if channel is not subscribed then subscribe to channel
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

// list of subscribers for this channel
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
            $project: {
                _id: 0,
                subscribers: 1,
            },
        },
    ]);
    console.log(channelSubscribers);

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

// list of channels list which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    // find user in database
    if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
        throw new ApiError(400, "User not found in database...");
    }

    const subscribedToChannel = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
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
            $project: {
                subscribedChannels: 1,
            },
        },
    ]);

    return res
        .status(200)
        .status(
            new ApiResponse(
                200,
                subscribedToChannel,
                "Subscribed to channel finished"
            )
        );
});

export { toggleSubscription, getUserChannelSubcribers, getSubscribedChannels };
