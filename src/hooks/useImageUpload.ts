/**
 * Re-export useUpload as useImageUpload for backward compatibility.
 * All upload logic is unified in useUpload.ts.
 */
export { useImageUpload, useUpload, default } from "./useUpload";
export type { UseImageUploadReturn, UseUploadReturn, UploadResult, UploadOptions } from "./useUpload";
