import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary, deleteImageToCloudinary, deleteVideoToCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";

const getAllVideos = asyncHandler(async (req, res) => {
    // TODO: this part complete later
    // const { page=1, limit=10, query, sortBy, sortType, userId } = req.query

    const videos = await Video.find();

    console.log(videos);

    return res
     .status(200)
     .json(new ApiResponse(200, videos, "videos found successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    // upload video to cloudinary
    const videoLocalPath = req.files?.videoFile[0].path;
    if (!videoLocalPath) {
        throw new ApiError(400, "video is required while publishing video");
    }
    const videoFile = await uploadOnCloudinary(videoLocalPath);

    // upload thumbnail to cloudinary
    const thumbnailLocalPath = req.files?.thumbnail[0].path;
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail is required while publishing video");
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    // create video
    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        duration: videoFile.duration,
        thumbnail: thumbnail.url,
        owner: req.user,
        isPulished: false,
    });

    return res.status(200).json(new ApiResponse(200, video, "video published"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const findVideo = await Video.findById(videoId);
    if (!findVideo) {
        throw new ApiError(404, "video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, findVideo, "video found successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "video not found");
    }
    console.log(video);
    console.log(video.owner);
    console.log(req.user._id);
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(401, "you are not the owner of this video");
    }
    // console.log(video);

    const { title, description } = req.body;
    console.log(title, description);
    const thumbnailLocalPath = req.file?.path;
    console.log(thumbnailLocalPath);
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

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const videoToDelete = await Video.findById(videoId);

    if (!videoToDelete) {
        throw new ApiError(404, "video not found when deleting video");
    }
    console.log(videoToDelete);
    console.log(videoToDelete.videoFile);
    console.log(videoToDelete.thumbnail);

    await deleteVideoToCloudinary(videoToDelete.videoFile);
    await deleteImageToCloudinary(videoToDelete.thumbnail);

    const deleteResponse = await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(new ApiResponse(200, deleteResponse, "Video deleted successfully"));
});

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo };
