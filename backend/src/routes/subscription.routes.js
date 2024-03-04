import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    toggleSubscription,
    getUserChannelSubcribers,
    getSubscribedChannels,
} from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/channel/:channelId").post(toggleSubscription);

router.route("/user/:channelId").get(getUserChannelSubcribers);

router.route("/channel/:subscriberId").get(getSubscribedChannels);

export default router;
