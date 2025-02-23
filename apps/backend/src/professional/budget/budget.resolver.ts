// budget.resolver.ts
import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql';
import { BudgetService } from './budget.service';
import { CreateBudgetInput } from './dto/create-budget.input';
import { UpdateBudgetInput } from './dto/update-budget-input';
import { Budget } from './model/budget.model';

@Resolver(() => Budget)
export class BudgetResolver {
  constructor(private readonly budgetService: BudgetService) {}

  @Query(() => Budget, { name: 'budgetById', nullable: true })
  getBudgetById(@Args('id', { type: () => Int }) id: number) {
    return this.budgetService.getBudgetById(id);
  }

  @Query(() => Budget, { name: 'budgetByNeedId', nullable: true })
  getBudgetByNeedId(@Args('needId', { type: () => Int }) needId: number) {
    return this.budgetService.getBudgetByNeedId(needId);
  }

  @Query(() => [Budget], { name: 'budgetsByChatId' })
  getBudgetsByChatId(@Args('chatId') chatId: string) {
    return this.budgetService.getBudgetsByChatId(chatId);
  }

  @Mutation(() => Budget)
  createBudget(@Args('input') input: CreateBudgetInput) {
    return this.budgetService.createBudget(input);
  }

  @Mutation(() => Budget)
  updateBudget(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateBudgetInput,
  ) {
    return this.budgetService.updateBudget(id, input);
  }

  @Query(() => [Budget], { name: 'budgetsByProfessional' })
  getBudgetsByProfessional(
    @Args('professionalId', { type: () => Int }) professionalId: number,
  ) {
    return this.budgetService.getBudgetsByProfessional(professionalId);
  }

  @Mutation(() => Budget)
  async updateBudgetStatus(
    @Args('id', { type: () => Int }) id: number,
    @Args('status') status: string,
  ) {
    return this.budgetService.updateBudgetStatus(id, status);
  }

  // Nova mutation para deleção
  @Mutation(() => Budget)
  async deleteBudget(@Args('id', { type: () => Int }) id: number) {
    return this.budgetService.deleteBudget(id);
  }
}
