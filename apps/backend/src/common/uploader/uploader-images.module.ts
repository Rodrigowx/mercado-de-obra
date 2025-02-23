import { Module } from '@nestjs/common';
import { UploaderImagesService } from './uploader-images.service';
import { AzureBlobStrategy } from './dto/azure-blob.strategy';

@Module({
  providers: [
    UploaderImagesService,
    {
      provide: 'UploaderStrategy',
      useClass: AzureBlobStrategy, 
    },
  ],
  exports: [UploaderImagesService],
})
export class UploaderImagesModule {}
