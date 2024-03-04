import { Router } from "express";
import { 
    createTweet,
    getTweet,
    updateUserTweet,
    deleteUserTweet
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT);

router.route("/").post(createTweet);

router.route("/:tweetId").get(getTweet);

router.route("/:tweetId").patch(updateUserTweet);

router.route("/:tweetId").delete(deleteUserTweet);

export default router;