import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getVideoComments,
    addComments,
    updateComments,
    deleteComments,
} from "../controllers/comment.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").get(getVideoComments);

router.route("/:videoId").post(addComments);

router.route("/:videoId/:commentId").patch(updateComments);

router.route("/:videoId/:commentId").delete(deleteComments);

export default router;