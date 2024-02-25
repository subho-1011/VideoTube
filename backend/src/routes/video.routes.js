import { Router } from "express";

import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").get(getAllVideos);

router.route("/publish").post(
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    publishAVideo
);
router.route("/:videoId").get(getVideoById);
router.route("/:videoId").patch(upload.single("thumbnail"), updateVideo);
router.route("/:videoId").delete(deleteVideo);

export default router;
