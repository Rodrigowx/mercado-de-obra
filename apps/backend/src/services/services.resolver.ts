import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Service } from './models/service.model';
import { ServicesService } from './services.service';

@Resolver(() => Service)
export class ServicesResolver {
  constructor(private readonly servicesService: ServicesService) {}

  @Query(() => [Service], { name: 'services' })
  async findAll() {
    return this.servicesService.findAll();
  }

  @Mutation(() => Service)
  async createService(
    @Args('name') name: string,
    @Args('icon') icon: string,
  ) {
    return this.servicesService.create({ name, icon });
  }

  @Mutation(() => Service)
  async updateService(
    @Args('id', { type: () => Int }) id: number,
    @Args('name', { nullable: true }) name?: string,
    @Args('icon', { nullable: true }) icon?: string,
  ) {
    return this.servicesService.update(id, { name, icon });
  }

  @Mutation(() => Boolean)
  async deleteService(@Args('id', { type: () => Int }) id: number) {
    await this.servicesService.delete(id);
    return true;
  }
}
