"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// =====================================================
// CLOUDFLARE R2 STORAGE — CONVEX BACKEND
// =====================================================
// Generates presigned URLs for client-side direct uploads to R2
// and handles file deletion.
//
// Uses Convex actions with "use node" for AWS SDK compatibility.
//
// Required Convex environment variables (set via npx convex env set):
//   R2_ACCOUNT_ID        — Cloudflare account ID
//   R2_ACCESS_KEY_ID     — R2 API token access key
//   R2_SECRET_ACCESS_KEY — R2 API token secret key
//   R2_BUCKET_NAME       — R2 bucket name
//   R2_PUBLIC_URL        — Public URL (e.g. https://media.seshnx.com)
// =====================================================

const r2AccountId = process.env.R2_ACCOUNT_ID;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME;
const r2PublicUrl = process.env.R2_PUBLIC_URL;

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    if (!r2AccountId || !r2AccessKeyId || !r2SecretAccessKey) {
      throw new Error(
        "R2 credentials not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY via `npx convex env set`."
      );
    }
    s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      },
    });
  }
  return s3Client;
}

/**
 * Generate a presigned PUT URL for client-side direct upload to R2.
 * The URL expires after 1 hour.
 *
 * Returns { uploadUrl, fileUrl, key } — the client PUTs the file to
 * uploadUrl, then stores fileUrl as the public-facing URL.
 */
export const generateUploadUrl = action({
  args: {
    key: v.string(),
    contentType: v.string(),
  },
  handler: async (_ctx, args) => {
    const client = getS3Client();
    if (!r2BucketName) throw new Error("R2_BUCKET_NAME not set");
    if (!r2PublicUrl) throw new Error("R2_PUBLIC_URL not set");

    const command = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: args.key,
      ContentType: args.contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: 7200,
    });
    const fileUrl = `${r2PublicUrl}/${args.key}`;

    return { uploadUrl, fileUrl, key: args.key };
  },
});

/**
 * Delete an object from R2 by key.
 */
export const deleteFile = action({
  args: { key: v.string() },
  handler: async (_ctx, args) => {
    const client = getS3Client();
    if (!r2BucketName) throw new Error("R2_BUCKET_NAME not set");

    const command = new DeleteObjectCommand({
      Bucket: r2BucketName,
      Key: args.key,
    });

    await client.send(command);
    return { success: true };
  },
});
