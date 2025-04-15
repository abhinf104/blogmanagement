const { v2: cloudinary } = require("cloudinary");
const dotenv = require("dotenv");
dotenv.config();

const connectCloudinary = async () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    console.log(" Cloudinary configured successfully");
  } catch (error) {
    console.error("Failed to configure Cloudinary:", error.message);
  }
};

module.exports = connectCloudinary;
