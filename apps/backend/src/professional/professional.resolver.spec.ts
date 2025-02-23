import { Test, TestingModule } from '@nestjs/testing';
import { ProfessionalResolver } from './professional.resolver';

describe('ProfessionalResolver', () => {
  let resolver: ProfessionalResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfessionalResolver],
    }).compile();

    resolver = module.get<ProfessionalResolver>(ProfessionalResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
