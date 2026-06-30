import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use Memory Storage (No local files created)
const storage = multer.memoryStorage();

// Generic upload instance for flexible usage
export const upload = multer({ storage });

// Pre-configured instances
export const singleUpload = multer({ storage }).single("file");
export const multiUpload = multer({ storage }).fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
]);

// Helper function to upload buffer to Cloudinary
export const uploadToCloudinary = (buffer, folder, resourceType = "auto", originalName = null) => {
    return new Promise((resolve, reject) => {
        const options = { 
            folder, 
            resource_type: resourceType
        };
        
        if (originalName) {
            const extension = originalName.split('.').pop().toLowerCase();
            const fileNameWithoutExt = originalName.split('.')[0];
            // ALWAYS include extension in public_id for all types (PDF, Image, Raw)
            // This prevents "Blocked for delivery" issues
            options.public_id = `${fileNameWithoutExt}_${Date.now()}.${extension}`;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};
