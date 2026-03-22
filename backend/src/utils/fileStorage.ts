// Simple in-memory storage for file metadata
// In production, this would be replaced with a database

export interface FileMetadata {
  filePath: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  language: 'he' | 'en';
}

// Global file storage map
export const fileStorage = new Map<string, FileMetadata>();

export const storeFileMetadata = (uploadId: string, metadata: FileMetadata): void => {
  fileStorage.set(uploadId, metadata);
  console.log(`Stored file metadata for uploadId: ${uploadId}, path: ${metadata.filePath}`);
};

export const getFileMetadata = (uploadId: string): FileMetadata | undefined => {
  return fileStorage.get(uploadId);
};

export const removeFileMetadata = (uploadId: string): boolean => {
  const removed = fileStorage.delete(uploadId);
  if (removed) {
    console.log(`Removed file metadata for uploadId: ${uploadId}`);
  }
  return removed;
};

export const getStorageStats = (): { totalFiles: number; uploadIds: string[] } => {
  return {
    totalFiles: fileStorage.size,
    uploadIds: Array.from(fileStorage.keys())
  };
};