import { Storage } from '@google-cloud/storage';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE, // Path to service account key file
});

// Storage service that mimics Supabase Storage API
export class CloudStorage {
  private bucketName: string;

  constructor(bucketName: string) {
    this.bucketName = bucketName;
  }

  /**
   * Upload a file to Google Cloud Storage
   * Mimics Supabase's storage.from(bucket).upload(path, file) API
   */
  async upload(
    path: string,
    file: File | Buffer | ArrayBuffer,
    options?: {
      cacheControl?: string;
      contentType?: string;
      upsert?: boolean;
    }
  ) {
    try {
      const bucket = storage.bucket(this.bucketName);
      const fileObj = bucket.file(path);

      let buffer: Buffer;
      if (file instanceof File) {
        buffer = Buffer.from(await file.arrayBuffer());
      } else if (file instanceof ArrayBuffer) {
        buffer = Buffer.from(file);
      } else {
        buffer = file;
      }

      const stream = fileObj.createWriteStream({
        metadata: {
          cacheControl: options?.cacheControl || 'public, max-age=3600',
          contentType: options?.contentType || 'application/octet-stream',
        },
        resumable: false,
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (error) => {
          console.error('Upload error:', error);
          reject({ error, data: null });
        });

        stream.on('finish', () => {
          resolve({
            data: { path, fullPath: `gs://${this.bucketName}/${path}` },
            error: null,
          });
        });

        stream.end(buffer);
      });
    } catch (error) {
      console.error('Storage upload error:', error);
      return { error, data: null };
    }
  }

  /**
   * Download a file from Google Cloud Storage
   */
  async download(path: string) {
    try {
      const bucket = storage.bucket(this.bucketName);
      const file = bucket.file(path);

      const [buffer] = await file.download();
      return { data: buffer, error: null };
    } catch (error) {
      console.error('Storage download error:', error);
      return { error, data: null };
    }
  }

  /**
   * Delete a file from Google Cloud Storage
   */
  async remove(paths: string[]) {
    try {
      const bucket = storage.bucket(this.bucketName);
      const deletePromises = paths.map((path) => bucket.file(path).delete());

      await Promise.all(deletePromises);
      return { data: paths, error: null };
    } catch (error) {
      console.error('Storage delete error:', error);
      return { error, data: null };
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(path: string) {
    return {
      data: {
        publicUrl: `https://storage.googleapis.com/${this.bucketName}/${path}`,
      },
    };
  }

  /**
   * Create a signed URL for private access
   */
  async createSignedUrl(
    path: string,
    expiresIn: number = 3600 // 1 hour default
  ) {
    try {
      const bucket = storage.bucket(this.bucketName);
      const file = bucket.file(path);

      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn * 1000,
      });

      return {
        data: { signedUrl },
        error: null,
      };
    } catch (error) {
      console.error('Signed URL error:', error);
      return { error, data: null };
    }
  }

  /**
   * List files in a directory
   */
  async list(
    path?: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      const bucket = storage.bucket(this.bucketName);
      const [files] = await bucket.getFiles({
        prefix: path,
        maxResults: options?.limit,
      });

      const fileList = files.map((file) => ({
        name: file.name,
        id: file.id,
        updated_at: file.metadata.updated,
        created_at: file.metadata.timeCreated,
        last_accessed_at: file.metadata.timeCreated,
        metadata: file.metadata,
      }));

      return { data: fileList, error: null };
    } catch (error) {
      console.error('Storage list error:', error);
      return { error, data: null };
    }
  }
}

// Storage instances for different buckets
export const projectsStorage = new CloudStorage('eng-platform-projects');
export const avatarsStorage = new CloudStorage('eng-platform-avatars');
export const publicStorage = new CloudStorage('eng-platform-public');

// Helper function to create storage instance for any bucket
export const createStorage = (bucketName: string) => new CloudStorage(bucketName);

// Default export for backwards compatibility
export default {
  from: (bucketName: string) => new CloudStorage(bucketName),
}; 