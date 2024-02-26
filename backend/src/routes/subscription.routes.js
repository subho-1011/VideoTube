import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    toggleSubscription,
    getUserChannelSubcribers,
    getSubscribedChannels,
} from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/c/:channelId").post(toggleSubscription);

router.route("/u/:channelId").get(getUserChannelSubcribers);

router.route("/c/:subscriberId").get(getSubscribedChannels);

export default router;
