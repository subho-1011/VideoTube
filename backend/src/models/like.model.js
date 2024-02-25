import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        likeBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
            required: true,
        },
        followers: {
            type: Schema.Types.ObjectId,
            ref: "follower",
            required: true,
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true,
        },
    },
    { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
