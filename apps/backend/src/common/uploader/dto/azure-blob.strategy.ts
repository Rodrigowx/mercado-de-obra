import { BadRequestException, Injectable } from '@nestjs/common';
import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';

import { UploaderStrategy } from './uploader.strategy.interface';
import { FileUpload } from '../model/file-upload.model';

@Injectable()
export class AzureBlobStrategy implements UploaderStrategy {
  private readonly blobServiceClient: BlobServiceClient;
  private readonly containerName: string;
  private readonly sharedKeyCredential: StorageSharedKeyCredential;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

    this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
    this.blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    this.sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey,
    );
  }
  async generateMultiplePresignedUrls(blobNames: string[]): Promise<string[]> {
    return Promise.all(
      blobNames.map((blobName) => this.generatePresignedUrl(blobName)),
    );
  }

  async uploadFile(
    file: FileUpload,
    professionalId: number,
    portifolioId: number,
  ): Promise<string> {
    const uniqueName = `${uuidv4()}-${file.filename}`;
    const blobPath = `${professionalId}/${portifolioId}/${uniqueName}`;
    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    await blockBlobClient.uploadStream(file.createReadStream());
    return blobPath;
  }

  // async uploadFile(file: FileUpload, professionalId): Promise<string> {
  //   const { filename, createReadStream, mimetype } = file;
  //   const uniqueName = `${uuidv4()}-${filename}`;
  //   // Construir o caminho: professionalId/portfolioId/uniqueName
  //   const blobPath = `${professionalId}/${uniqueName}`;
  //   const containerClient = this.blobServiceClient.getContainerClient(
  //     this.containerName,
  //   );
  //   const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

  //   // Upload do arquivo
  //   await blockBlobClient.uploadStream(createReadStream());

  //   // Geração do SAS Token
  //   const sasToken = generateBlobSASQueryParameters(
  //     {
  //       containerName: this.containerName,
  //       blobName: blobPath,
  //       permissions: BlobSASPermissions.parse('r'), // Permissão de leitura
  //       expiresOn: new Date(new Date().valueOf() + 60 * 60 * 1000), // Expira em 1 hora
  //     },
  //     this.sharedKeyCredential,
  //   ).toString();

  //   // Retorna a URL completa com SAS Token
  //   return `${blockBlobClient.url}?${sasToken}`;
  // }

  async generatePresignedUrl(blobName: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    const blobClient = containerClient.getBlobClient(blobName);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName,
        permissions: BlobSASPermissions.parse('r'),
        expiresOn: new Date(new Date().valueOf() + 60 * 60 * 1000), // Expira em 1 hora
      },
      this.sharedKeyCredential,
    ).toString();

    return `${blobClient.url}?${sasToken}`;
  }

  async deleteImagesByProfessionalIdOnBlobStorage(
    professionalId: number,
    portifolioId: number,
  ): Promise<void> {
    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    const folderPrefix = `${professionalId}/${portifolioId}/`;
    for await (const blob of containerClient.listBlobsFlat({
      prefix: folderPrefix,
    })) {
      if (blob.name.startsWith(folderPrefix)) {
        await containerClient.getBlockBlobClient(blob.name).delete();
      }
    }
  }
}
