/**
 * Re-export useUpload as useMediaUpload for backward compatibility.
 * All upload logic is unified in useUpload.ts.
 */
export { useMediaUpload, useUpload, default } from "./useUpload";
export type { UseUploadReturn as UseMediaUploadReturn, UseUploadReturn, UploadResult as MediaUploadResult, UploadResult, UploadOptions } from "./useUpload";
