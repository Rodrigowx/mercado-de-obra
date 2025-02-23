import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { ClientService } from './client.service';

@Resolver()
export class ClientResolver {
  constructor(private readonly clientService: ClientService) {}

  @Query(() => String)
  async getClientByUserId(@Args('id', { type: () => Int }) id: number) {
    return this.clientService.findByUserId(id);
  }
}
