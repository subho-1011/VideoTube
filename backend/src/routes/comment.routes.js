import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").get(getVideoComments);

router.route("/:videoId").post(addComment);

router.route("/:videoId/:commentId").patch(updateComment);

router.route("/:videoId/:commentId").delete(deleteComment);

export default router;