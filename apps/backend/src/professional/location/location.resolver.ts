import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql';
import { LocationService } from './location.service';
import { Location } from './models/location.model';
import { CreateLocationInput } from './dto/create-location.input';
import { UpdateLocationInput } from './dto/update-location.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth/gql-auth.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { CurrentUser } from '../../auth/decorator/current-user.decorator';
import { User as CurrentUserType } from '@prisma/client';

@Resolver(() => Location)
export class LocationResolver {
  constructor(private readonly locationService: LocationService) {}

  @Mutation(() => Location)
  @UseGuards(GqlAuthGuard)
  @Roles('PROFESSIONAL')
  async addLocation(
    @CurrentUser() user: CurrentUserType,
    @Args('input') input: CreateLocationInput
  ) {
    // Não precisamos mais do professionalId no input, obtém do usuário
    return this.locationService.create(user.id, input);
  }

  @Mutation(() => Location)
  @UseGuards(GqlAuthGuard)
  @Roles('PROFESSIONAL') // Apenas profissionais podem atualizar localização
  async updateLocation(
    @CurrentUser() user: CurrentUserType,
    @Args('input') input: UpdateLocationInput,
  ) {
    return this.locationService.update(user.id, input);
  }

  @Query(() => Location)
  @UseGuards(GqlAuthGuard)
  @Roles('PROFESSIONAL') // Apenas profissionais podem acessar suas localizações
  async getLocationByProfessional(
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.locationService.findByProfessionalId(user.id);
  }

  @Query(() => [Location])
  async findNearby(
    @Args('latitude') latitude: number,
    @Args('longitude') longitude: number,
    @Args('radius') radius: number,
  ) {
    return this.locationService.findNearby(latitude, longitude, radius);
  }
}
