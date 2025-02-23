import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsString,
  IsInt,
} from 'class-validator';

import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { FileUpload } from '../../../common/uploader/model/file-upload.model';

@InputType()
export class UpdatePortfolioInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @Field(() => [GraphQLUpload], ({ nullable: true }))
  images?: Array<Promise<FileUpload>>;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  serviceId?: number;
}
