import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createPlaylist = asyncHandler(async (req, res) => {
    // name, description from body
    const { title, description } = req.body;
    if (!title) {
        throw new ApiError(400, "Must provided playlist name");
    }
    if (!description) {
        throw new ApiError(400, "Description required for craete a playlist");
    }

    const newPlaylist = await Playlist.create({
        title,
        description,
        owner: req.user?._id,
    });
    if (!newPlaylist) {
        throw new ApiError(500, "Something is wrong when create new playlist");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                newPlaylist,
                "Create new Playlist Successfully"
            )
        );
});

export const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(400, "User id must be provided");
    }

    const userPlaylists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
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
                ],
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                userPlaylists,
                "User Playlists fetched successfully"
            )
        );
});

export const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!playlistId && !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Playlist id not provided or invalid");
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
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
                ],
            },
        },
    ]);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found somthing is wrong");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

export const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!playlistId && !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Playlist id not provided or invalid");
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
    if (!deletedPlaylist) {
        throw new ApiError(500, "Playlist is not found or deleted");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedPlaylist,
                "Playlist deleted successfully"
            )
        );
});

export const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!playlistId && !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Playlist id not provided or invalid");
    }

    const { title, description } = req.body;
    if (!title) {
        throw new ApiError(400, "Title is required");
    }
    if (!description) {
        throw new ApiError(400, "Description is required");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            title: title ? title : playlist.title,
            description: description ? description : playlist.description,
        },
        {
            new: true,
        }
    );
    if (!updatedPlaylist) {
        throw new ApiError(500, "Playlist not updated");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Playlist updated successfully"
            )
        );
});

export const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!playlistId && !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Playlist id not provided or invalid");
    }
    if (!videoId && !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Video id not provided or invalid");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(404, "Video already in playlist");
    }

    playlist.videos.push(videoId);

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        playlist,
        { new: true }
    );
    if (!updatedPlaylist) {
        throw new ApiError(500, "Playlist not updated");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Video added to playlist successfully"
            )
        );
});

export const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!playlistId && !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Playlist id not provided or invalid");
    }
    if (!videoId && !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Video id not provided or invalid");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(404, "Video not found in playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId,
            },
        },
        { new: true }
    );
    if (!updatedPlaylist) {
        throw new ApiError(500, "Playlist not updated");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Video removed from playlist successfully"
            )
        );
});
