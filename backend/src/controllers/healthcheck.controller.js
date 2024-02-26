import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async (_, res) => {
    res.status(200).json({
        status: "Hey boy, this is a test case and we're going to test the health",
    });
});

export { healthCheck };
