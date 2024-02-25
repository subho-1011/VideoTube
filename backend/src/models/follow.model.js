import mongoose, { Schema } from 'mongoose';

const followerSchema = new Schema(
    {
        follower: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        channel: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    }
);

export const Follower = mongoose.model("Follower", followerSchema);