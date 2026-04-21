import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  file: string,
  folder: string = "my-digital-card"
): Promise<string> {
  // If Cloudinary credentials are not configured, store the data URL directly.
  // This keeps the feature working in local/dev environments without a Cloudinary account.
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return file; // data URL — stored as-is in the DB
  }

  const result = await cloudinary.uploader.upload(file, {
    folder,
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  });
  return result.secure_url;
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
