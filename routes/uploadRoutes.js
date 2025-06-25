// import { v2 as cloudinary } from 'cloudinary';

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const uploadToCloudinary = async (path, folder = 'my-profile') => {
//   try {
//     const data = await cloudinary.uploader.upload(path, { folder: folder });
//     return { url: data.secure_url, publicId: data.public_id };
//   } catch (err) {
//     console.log(err);
//     throw err;
//   }
// };

// export default uploadToCloudinary;

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (fileInput, folder = 'my-profile') => {
  try {
    let uploadResult;

    // 1. Local file path (React Native or Web multer upload)
    if (fileInput.startsWith('file://')) {
      const filePath = fileInput.replace('file://', '');
      uploadResult = await cloudinary.uploader.upload(filePath, { folder });
    }

    // 2. Base64 image string
    else if (fileInput.startsWith('data:image')) {
      uploadResult = await cloudinary.uploader.upload(fileInput, { folder });
    }

    // 3. Fallback: remote URL (less common but nice to support)
    else if (fileInput.startsWith('http')) {
      const imageBuffer = (
        await axios.get(fileInput, { responseType: 'arraybuffer' })
      ).data;
      const base64 = Buffer.from(imageBuffer).toString('base64');
      const dataUri = `data:image/jpeg;base64,${base64}`;
      uploadResult = await cloudinary.uploader.upload(dataUri, { folder });
    }

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  } catch (err) {
    console.error('Cloudinary Upload Error:', err);
    throw err;
  }
};

export default uploadToCloudinary;
