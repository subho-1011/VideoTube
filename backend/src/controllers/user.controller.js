import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
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

export { registerUser };
