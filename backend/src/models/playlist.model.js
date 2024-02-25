import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        // required: true,
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
    ],
});

export const Playlist = mongoose.model("Playlist", playlistSchema);
