import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // save in database
        user.refreshToken = refreshToken;
        user.save({ validateBeforeSave: flase });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access token and refresh token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    //  Get user information from frontend server
    const { userName, email, fullName, password } = req.body;
    console.log(email, fullName);

    //  validation - not empty
    // if ( fullName === "") throw new ApiError( 400, "Fullname is required");
    if (
        [userName, email, fullName, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "Please fill all the fields");
    }

    //  check if the user already exists by username, email
    const existUser = await User.findOne({
        $or: [{ username: userName }, { email: email }],
    });

    if (existUser) {
        throw new ApiError(409, "User already exists");
    }

    //  check for image
    const avatarLocalPath = req.files?.avatar[0].path;

    //  check for avatar
    // const coverImageLocalPath = req.files?.coverImage[0].path;
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

    //  upload image in cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    //  create user object - create entry in database
    const user = await User.create({
        fullName,
        username: userName.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    //  remove password and refresh token fields from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    //  check for user created
    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering a user"
        );
    }

    //  return response
    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "Successfully registered"));
});

const loginUser = asyncHandler(async (req, res) => {
    // data from request body
    const { userName, email, password } = req.body;

    // username or email
    if (!userName || !email) {
        throw new ApiError(400, "username or email required");
    }

    // find the user
    const user = await User.findOne({
        $or: [{ username: userName }, { email: email }],
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // password check
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    // access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );
    const loggedInUser = User.findById(user._id).select(
        "-password -refreshToken"
    );

    // send cookies
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
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
        );

    // response
});

const logoutUser = asyncHandler(async (req, res) => {
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

export { registerUser, loginUser, logoutUser };
