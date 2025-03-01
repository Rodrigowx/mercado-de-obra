import { InputType, Field } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload';
import { FileUpload } from '../model/file-upload.model';

@InputType()
export class CreateImageInput {
  @Field(() => GraphQLUpload)
  image: Promise<FileUpload>;
}