import { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/*
    * registerUser routes
    * http://localhost:8000/api/v1/users/register
    * multer use as middleware for file upload in cloudinary
    * then register user
*/
router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);

// * loginUser routes
router.route("/login").post(loginUser);

/* 
    * logout user routes
    * http://localhost:8000/api/v1/users/logout
    * verify user by jwt middleware
    * then log out
*/
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

export default router;
