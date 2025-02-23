import { InputType, Field } from '@nestjs/graphql';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { FileUpload } from '../model/file-upload.model';

@InputType()
export class CreateImageInput {
  @Field(() => GraphQLUpload)
  image: Promise<FileUpload>;
}