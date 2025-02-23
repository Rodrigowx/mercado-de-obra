import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { ReviewService } from './review.service';
import { CreateReviewInput } from './dto/create-review.input';
import { Review } from './models/review.model';

@Resolver(() => Review)
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  @Mutation(() => Review)
  async createReview(@Args('input') input: CreateReviewInput): Promise<Review> {
    return this.reviewService.createReview(input);
  }

  @Query(() => [Review])
  async getReviews(@Args('professionalId') professionalId: number): Promise<Review[]> {
    return this.reviewService.getReviewsByProfessional(professionalId);
  }
}
