import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // file has been successfully uploaded
        // console.log("file successfully uploaded in cloudinary", response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        // remove the local file
        fs.unlinkSync(localFilePath);
        return null;
    }
};

const deleteToCloudinary = async (cloudinaryFilePath) => {
    try {
        if (!cloudinaryFilePath) return null;

        const filePath = cloudinaryFilePath.split("/");
        const fileName = filePath[filePath.length - 1].split(".")[0];
        // console.log(fileName);

        // delete the file from cloudinary
        return await cloudinary.uploader.destroy(fileName, (err, result) => {
            if (err) {
                console.error("Error deleting file:", err);
            } else {
                console.log("File deleted successfully:", result);
            }
        });
    } catch (e) {
        console.log("Error deleting cloudinary file: " + e.message);
    }
};

export { uploadOnCloudinary, deleteToCloudinary };
