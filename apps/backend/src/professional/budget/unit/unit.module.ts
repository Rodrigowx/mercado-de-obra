import { Module } from '@nestjs/common';
import { UnitResolver } from './unit.resolver';

@Module({
  providers: [UnitResolver],
})
export class UnitModule {}
