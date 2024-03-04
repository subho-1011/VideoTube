import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    uploadOnCloudinary,
    deleteImageToCloudinary,
    deleteVideoToCloudinary,
} from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

// =================================================================
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const videos = await Video.aggregate([
        {
            $match: {
                isPulished: false,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
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
                owner: {
                    $arrayElemAt: ["$owner", 0],
                },
            },
        },
        {
            $sort: {
                // [sortBy]: sortType,
                createdAt: -1,
            },
        },
        {
            $skip: (parseInt(page) - 1) * parseInt(limit),
        },
        {
            $limit: parseInt(limit),
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "videos found successfully"));
});

// =================================================================
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    const videoLocalPath = req.files?.videoFile[0].path;
    if (!videoLocalPath) {
        throw new ApiError(400, "video is required while publishing video");
    }
    const videoFile = await uploadOnCloudinary(videoLocalPath);
    console.log(videoFile);

    const thumbnailLocalPath = req.files?.thumbnail[0].path;
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail is required while publishing video");
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        duration: videoFile.duration,
        thumbnail: thumbnail.url,
        owner: req.user._id,
        isPulished: false,
    });

    return res.status(200).json(new ApiResponse(200, video, "video published"));
});

// =================================================================
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "video id is not defined or empty");
    }

    const findVideo = await Video.findById(videoId);
    if (!findVideo) {
        throw new ApiError(404, "video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, findVideo, "video found successfully"));
});

//================================================================
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(401, "you are not the owner of this video");
    }

    const { title, description } = req.body;
    const thumbnailLocalPath = req.file?.path;
    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        video.thumbnail = thumbnail.url;
    }

    video.title = title;
    video.description = description;
    await video.save();

    return res
        .status(200)
        .json(new ApiResponse(200, video, "video is updated successfully"));
});

// =================================================================
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const videoToDelete = await Video.findById(videoId);

    if (!videoToDelete) {
        throw new ApiError(404, "video not found when deleting video");
    }

    await deleteVideoToCloudinary(videoToDelete.videoFile);
    await deleteImageToCloudinary(videoToDelete.thumbnail);

    const deleteResponse = await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(
            new ApiResponse(200, deleteResponse, "Video deleted successfully")
        );
});

// =================================================================
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "video id is not defined or empty");
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "video id is not valid");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "video not found");
    }

    video.isPublished = !video.isPublished;
    const updatedRes = await video.save();
    if (!updatedRes) {
        throw new ApiError(
            500,
            "something went wrong while publishing video toggles"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { publishStatus: updatedRes.isPublished },
                "video is publish status change successfully"
            )
        );
});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
