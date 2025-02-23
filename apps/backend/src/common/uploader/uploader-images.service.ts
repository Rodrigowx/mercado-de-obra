import { Injectable, Inject } from '@nestjs/common';

import { UploaderStrategy } from './dto/uploader.strategy.interface';
import { FileUpload } from './model/file-upload.model';

@Injectable()
export class UploaderImagesService {
  constructor(
    @Inject('UploaderStrategy') private readonly uploaderStrategy: UploaderStrategy,
  ) {}

  async uploadFile(file: FileUpload, professionalId, portifolioId): Promise<string> {
    return this.uploaderStrategy.uploadFile(file, professionalId, portifolioId);
  }

  async uploadMultipleFiles(files: FileUpload[], professionalId, portifolioId): Promise<string[]> {
    return Promise.all(files.map((file) => this.uploadFile(file, professionalId, portifolioId)));
  }

  async generatePresignedUrl(blobName: string): Promise<string> {
    return this.uploaderStrategy.generatePresignedUrl(blobName);
  }

  async generateMultiplePresignedUrls(blobNames: string[]): Promise<string[]> {
    return this.uploaderStrategy.generateMultiplePresignedUrls(blobNames);
  }
  async deleteFiles(professionalId:number, portifolioId:number): Promise<void> {
    return this.uploaderStrategy.deleteImagesByProfessionalIdOnBlobStorage(professionalId, portifolioId);
  }
}
