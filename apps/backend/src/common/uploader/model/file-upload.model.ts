import { Stream, Readable } from 'stream';

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Readable;
}