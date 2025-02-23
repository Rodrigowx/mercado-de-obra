import { Resolver, Query } from '@nestjs/graphql';
import { UnitOfMeasurement } from './model/unit.model';
import { PrismaService } from 'src/prisma/prisma.service';

@Resolver(() => UnitOfMeasurement)
export class UnitResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [UnitOfMeasurement], { name: 'allUnits' })
  getAllUnits() {
    return this.prisma.unitOfMeasurement.findMany();
  }
}
