import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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

    return (response = res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        ));
});

const logoutUser = asyncHandler(async (req, res) => {
    /*
     * delete the refresh token from the database
     * send cookies
     * return the response
     */

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
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

    const user = User.findById(decodedToken?._id);
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

export { registerUser, loginUser, logoutUser, refreshAccessToken };
