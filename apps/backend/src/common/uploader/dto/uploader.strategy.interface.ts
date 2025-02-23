import { FileUpload } from '../model/file-upload.model';

export interface UploaderStrategy {
  uploadFile(file: FileUpload, professionalId, portifolioId): Promise<string>;
  generatePresignedUrl(blobName: string): Promise<string>;
  generateMultiplePresignedUrls(blobNames: string[]): Promise<string[]>;
  deleteImagesByProfessionalIdOnBlobStorage(
    professionalId: number,
    portifolioId: number,
  ): Promise<void>;
}
