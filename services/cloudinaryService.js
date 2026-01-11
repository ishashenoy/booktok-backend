const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a video to Cloudinary
 * @param {string} videoPath - Local path to the video file
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Cloudinary upload result
 */
async function uploadVideo(videoPath, options = {}) {
    try {
        const {
            folder = 'booktok-videos',
            publicId,
            resourceType = 'video'
        } = options;

        console.log(`☁️ Uploading video to Cloudinary: ${path.basename(videoPath)}`);

        const uploadOptions = {
            resource_type: resourceType,
            folder,
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            // Video-specific optimizations
            eager: [
                { format: 'mp4', video_codec: 'h264' }
            ],
            eager_async: true
        };

        if (publicId) {
            uploadOptions.public_id = publicId;
        }

        const result = await cloudinary.uploader.upload(videoPath, uploadOptions);

        console.log(`✅ Video uploaded to Cloudinary`);
        console.log(`   URL: ${result.secure_url}`);
        console.log(`   Public ID: ${result.public_id}`);
        console.log(`   Duration: ${result.duration}s`);

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            duration: result.duration,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
            createdAt: result.created_at
        };
    } catch (error) {
        console.error('❌ Cloudinary upload failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Upload a video from a buffer
 * @param {Buffer} videoBuffer - Video buffer
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Cloudinary upload result
 */
async function uploadVideoBuffer(videoBuffer, options = {}) {
    return new Promise((resolve, reject) => {
        const {
            folder = 'booktok-videos',
            publicId
        } = options;

        const uploadOptions = {
            resource_type: 'video',
            folder,
            use_filename: true,
            unique_filename: true
        };

        if (publicId) {
            uploadOptions.public_id = publicId;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error('❌ Cloudinary upload failed:', error.message);
                    resolve({ success: false, error: error.message });
                } else {
                    console.log(`✅ Video uploaded to Cloudinary: ${result.secure_url}`);
                    resolve({
                        success: true,
                        url: result.secure_url,
                        publicId: result.public_id,
                        duration: result.duration,
                        format: result.format,
                        bytes: result.bytes
                    });
                }
            }
        );

        // Write buffer to stream
        const { Readable } = require('stream');
        const readableStream = Readable.from(videoBuffer);
        readableStream.pipe(uploadStream);
    });
}

/**
 * Delete a video from Cloudinary
 * @param {string} publicId - The public ID of the video
 * @returns {Promise<object>}
 */
async function deleteVideo(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'video'
        });
        
        console.log(`🗑️ Video deleted from Cloudinary: ${publicId}`);
        return { success: true, result: result.result };
    } catch (error) {
        console.error('❌ Cloudinary delete failed:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Get optimized video URL with transformations
 * @param {string} publicId - The public ID of the video
 * @param {object} options - Transformation options
 * @returns {string} - Transformed video URL
 */
function getOptimizedVideoUrl(publicId, options = {}) {
    const {
        width = 768,
        height = 1024,
        quality = 'auto',
        format = 'mp4'
    } = options;

    return cloudinary.url(publicId, {
        resource_type: 'video',
        width,
        height,
        crop: 'fill',
        quality,
        format,
        fetch_format: 'auto'
    });
}

/**
 * Check if Cloudinary is configured
 * @returns {boolean}
 */
function isConfigured() {
    return !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );
}

module.exports = {
    uploadVideo,
    uploadVideoBuffer,
    deleteVideo,
    getOptimizedVideoUrl,
    isConfigured,
    cloudinary
};
