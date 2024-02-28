import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// get comments from video api
const getVideoComments = asyncHandler(async (req, res) => {
    // get video id from params
    const { videoId } = req.params;
    if (!videoId && !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid video id");
    }

    // get page & limit
    const { page = 1, limit = 10 } = req.query;

    // get video from database
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "video not found");
    }

    // create pipeline for comments
    const videoComments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
            },
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "owner",
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
            $skip: (parseInt(page) - 1) * parseInt(limit),
        },
        {
            $limit: parseInt(limit),
        },
    ]);

    // return video comments
    return res
        .status(200)
        .json(
            new ApiResponse(200, videoComments, "comments fetched successfully")
        );
});

// add comments to video
const addComment = asyncHandler(async (req, res) => {
    // get video id from params
    const { videoId } = req.params;
    if (!videoId && !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid video id");
    }

    // get comments content from body
    const { comment } = req.body;
    if (!comment) {
        throw new ApiError(400, "comment is required");
    }

    // get video from database
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "video not found");
    }

    // create new comment
    const newComment = await Comment.create({
        comment: comment,
        video: videoId,
        owner: req.user._id,
    });
    if (!newComment) {
        throw new ApiError(500, "Comment not created");
    }

    // return comment response
    return res
        .status(201)
        .json(new ApiResponse(201, newComment, "comment added successfully"));
});

// update comments
const updateComment = asyncHandler(async (req, res) => {
    // get comment id from params
    const { commentId } = req.params;
    if (!commentId && !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "invalid comment id");
    }

    // get updated comments from body
    const { comment } = req.body;
    if (!comment) {
        throw new ApiError(400, "comment is required");
    }

    // find comments by id and update comment
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { comment: comment },
        { new: true }
    );
    if (!updatedComment) {
        throw new ApiError(500, "comment not updated");
    }

    // return updated comment response
    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedComment, "comment updated successfully")
        );
});

// delete comments
const deleteComment = asyncHandler(async (req, res) => {
    // get comment id from params
    const { commentId } = req.params;
    if (!commentId && !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "invalid comment id");
    }

    // find comments by id and delete comment
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (!deletedComment) {
        throw new ApiError(500, "comment not deleted");
    }

    // return deleted comment response
    return res
        .status(200)
        .json(
            new ApiResponse(200, deletedComment, "comment deleted successfully")
        );
});

export { getVideoComments, addComment, updateComment, deleteComment };
