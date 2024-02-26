import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// toggle video like functionality
const toggleVideo = asyncHandler(async (req, res) => {});

// toggle comment like functionality
const toggleComment = asyncHandler(async (req, res) => {});

// toggle tweet like functionality
const toggleTweet = asyncHandler(async (req, res) => {});

// get all liked videos
const getLikedVideos = asyncHandler(async (req, res) => {});

export { toggleVideo, toggleComment, toggleTweet, getLikedVideos };
