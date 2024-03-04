import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
    uploadOnCloudinary,
    deleteImageToCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// =================================================================
const registerUser = asyncHandler(async (req, res) => {
    /*
     * Get user information from frontend server
     * validation - not empty
     * check if the user already exists by username, email
     * check for image
     * check for avatar required
     * check for cover image optional but handle it
     * upload image in cloudinary
     * create user object - create entry in database
     * remove password and refresh token fields from response
     * check for user created
     * return response
     */

    const { userName, email, fullName, password } = req.body;
    console.log(email, fullName);

    if (
        [userName, email, fullName, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "Please fill all the fields");
    }

    const existUser = await User.findOne({
        $or: [{ username: userName }, { email: email }],
    });

    if (existUser) {
        throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar[0].path;

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Please file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        username: userName.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering a user"
        );
    }

    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "Successfully registered"));
});

// =================================================================
const loginUser = asyncHandler(async (req, res) => {
    /*
     * data from request body
     * username or email of the user
     * find the user
     * password check
     * genarate access and refresh token
     * save the refresh token in database
     * login user details for return the response ( without password & refresh token)
     * send cookies
     * return the response
     */

    const { userName, email, password } = req.body;

    if (!userName && !email) {
        throw new ApiError(400, "username or email required");
    }

    const user = await User.findOne({
        $or: [{ username: userName }, { email: email }],
    });
    // console.log("User: ", user);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, loggedInUser, "User logged in successfully")
        );
});

// =================================================================
const logoutUser = asyncHandler(async (req, res) => {
    /*
     * delete the refresh token from the database
     * send cookies
     * return the response
     */

    await User.findByIdAndUpdate(
        req.user._id,
        {
            // $set: {
            //     refreshToken: undefined,
            // },
            $unset: {
                refreshToken: 1,
            },
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

// =================================================================
const refreshAccessToken = asyncHandler(async (req, res) => {
    /*
     * get the refresh token from the cookies
     * verify the token
     * get user information
     * check if the refresh token is valid
     * generate the refresh token and access token
     * save the refresh token in database
     * save the refresh token and access token in cookie
     * return
     */

    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken)
        throw new ApiError(401, "Refresh token required, unauthorized request");

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
        httpOnly: true,
        secure: true,
    };

    const newAccessToken = await user.generateAccessToken();
    const newRefreshToken = await user.generateRefreshToken();

    user.refreshToken = newAccessToken;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .cookie("accessToken", newAccessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: user,
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                },
                "Refresh token refreshed successfully"
            )
        );
});

// =================================================================

const changeCurrentPassword = asyncHandler(async (req, res) => {
    /*
     * data from request body
     * old password
     * new password
     * find the user id in middleware
     * find the current user in database
     * password check from user model
     * if password check success then set new password
     * save new password to database
     * return response
     */

    const { oldPassword, newPassword, confPassword } = req.body;
    if (!(newPassword === confPassword)) {
        throw new ApiError(
            400,
            "New Password & Confrom Password do not match "
        );
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User not found while changing password");
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password while changing password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user,
            },
            "Password changed successfully"
        )
    );
});

// =================================================================

const getCurrentUser = asyncHandler(async (req, res) => {
    /*
     * get the user information from the middleware
     * return the response
     */
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "Current user information fetched successfully"
            )
        );
});

const updateUserDetails = asyncHandler(async (req, res) => {
    /*
     * get the user information from the middleware
     * data from request body
     * update the user information
     * return the response
     */

    const { fullName, email } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
            },
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User details updated successfully"));
});

// =================================================================

const updateUserAvatar = asyncHandler(async (req, res) => {
    /*
     * get user avatar locally
     * upload on cloudinary
     * update user avatar
     * update user
     */

    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar is required for update");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new ApiError(400, "Error uploading avatar");
    }

    const user = await User.findById(req.user?._id);
    if (!user.avatar) {
        throw new ApiError(400, "User not found while updating avatar");
    }
    const cloudinaryFilePathToDelete = user.avatar;

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        { new: true }
    ).select("-password -refreshToken");

    await deleteImageToCloudinary(cloudinaryFilePathToDelete);
    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});

// =================================================================

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImagePath = req.file?.path;
    if (!coverImagePath) {
        throw new ApiError(400, "Cover image required for update");
    }

    const coverImage = await uploadOnCloudinary(coverImagePath);
    if (!coverImage.url) {
        throw new ApiError(
            400,
            "Error uploading cover image while updating cover image"
        );
    }

    const user = await User.findById(req.user?._id);
    if (!user.coverImage) {
        throw new ApiError(400, "No cover image found while updating avatar");
    }
    const cloudinaryFilePathToDelete = user.coverImage;

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url,
            },
        },
        { new: true }
    ).select("-password -refreshToken");

    await deleteImageToCloudinary(cloudinaryFilePathToDelete);
    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedUser, "Cover Image update successfully")
        );
});

// =================================================================

const deleteUserCoverImage = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(400, "User not found while deleting cover image");
    }
    if (!user.coverImage) {
        throw new ApiError(
            400,
            "No cover image found while deleting cover image"
        );
    }

    await deleteImageToCloudinary(user.coverImage);

    user.coverImage = null;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, "Cover image deleted successfully"));
});

// =================================================================

const getUserChannelProfile = asyncHandler(async (req, res) => {
    /*
     * get user name from url
     * create aggregate pipeline
     * - $match -> username
     * - $lookup -> subscribers list
     * - $lookup -> channels list
     * - $addFildes -> counts subcribers and channels to subscribed
     * -- return isSubscribed -> for check subscribe check
     *
     * - $project -> which data you want to return
     * return channel
     */

    const { username } = req.params;
    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
                subscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                username: 1,
                fullName: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                isSubscribed: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
            },
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "Channel not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "Channel profile fetched successfully"
            )
        );
});

// =================================================================

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new Mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
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
                user[0].watchHistory,
                "Watch history fetched successfully"
            )
        );
});

// =================================================================

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage,
    deleteUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
};
