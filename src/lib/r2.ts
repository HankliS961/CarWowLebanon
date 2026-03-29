import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const getR2Client = () => {
  if (
    !process.env.CLOUDFLARE_R2_ACCESS_KEY ||
    !process.env.CLOUDFLARE_R2_SECRET_KEY
  ) {
    return null;
  }

  // R2 endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
  return new S3Client({
    region: "auto",
    endpoint:
      process.env.CLOUDFLARE_R2_ENDPOINT ||
      `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
    },
  });
};

export async function uploadToR2(
  file: Buffer,
  filename: string,
  contentType: string,
): Promise<string> {
  const client = getR2Client();
  const bucket = process.env.CLOUDFLARE_R2_BUCKET || "carsouk";

  if (!client) {
    // Fallback for development: signal that R2 is not configured
    console.warn("[R2] No R2 credentials configured. Image upload skipped.");
    throw new Error("R2 not configured");
  }

  const key = `uploads/${Date.now()}-${filename}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    }),
  );

  // R2 public URL -- depends on custom domain or R2.dev subdomain
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL
    ? `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`
    : `https://${bucket}.${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.dev/${key}`;

  return publicUrl;
}

/**
 * Delete a file from R2 by its public URL.
 * Extracts the key from the URL and sends a DeleteObjectCommand.
 * Silently ignores errors (fire-and-forget safe).
 */
export async function deleteFromR2(publicUrl: string): Promise<void> {
  const client = getR2Client();
  if (!client) return;

  const bucket = process.env.CLOUDFLARE_R2_BUCKET || "carsouk";

  // Extract the key from the public URL
  // URL format: https://pub-xxx.r2.dev/uploads/1234-filename.jpg
  // or: https://bucket.account.r2.dev/uploads/1234-filename.jpg
  try {
    const url = new URL(publicUrl);
    const key = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
    if (!key || !key.startsWith("uploads/")) return; // safety: only delete our uploads

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  } catch (error) {
    console.error("[R2] Failed to delete:", error);
  }
}
