import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    updatePlaylist,
    removeVideoFromPlaylist
} from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(createPlaylist);

router.route("/:playlistId").get(getPlaylistById);
router.route("/:playlistId").delete(deletePlaylist);
router.route("/:playlistId").patch(updatePlaylist);

router.route("/user/:userId").get(getUserPlaylists);

router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);

export default router;