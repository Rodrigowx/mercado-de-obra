import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsString,
  IsInt,
} from 'class-validator';

import { GraphQLUpload } from 'graphql-upload';
import { FileUpload } from '../../../common/uploader/model/file-upload.model';

@InputType()
export class CreatePortfolioInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field(() => [GraphQLUpload])
  @ArrayNotEmpty()
  images: Array<Promise<FileUpload>>;

  @Field(() => Int)
  @IsInt()
  serviceId: number;
}
