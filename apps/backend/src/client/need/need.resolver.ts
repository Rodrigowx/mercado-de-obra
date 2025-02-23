// need.resolver.ts
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Need } from './model/need.model';
import { NeedService } from './need.service';
import { CreateNeedInput } from './dto/create-need.input';

@Resolver(() => Need)
export class NeedResolver {
  constructor(private readonly needService: NeedService) {}

  @Mutation(() => Need)
  async createNeed(
    @Args('createNeedInput') createNeedInput: CreateNeedInput,
  ): Promise<Need> {
    return this.needService.create(createNeedInput);
  }

  @Query(() => [Need], { name: 'needsByChatId' })
  getNeedsByChatId(@Args('chatId') chatId: string) {
    return this.needService.getNeedsByChatId(chatId);
  }
}
