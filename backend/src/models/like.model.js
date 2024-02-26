import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        likeBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet",
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
    },
    { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
