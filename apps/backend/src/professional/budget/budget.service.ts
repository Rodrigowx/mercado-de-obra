// budget.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetInput } from './dto/create-budget.input';
import { UpdateBudgetInput } from './dto/update-budget-input';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  async createBudget(input: CreateBudgetInput) {
    const {
      needId, clientId, professionalId, budgetServices, ...rest
    } = input;
    return this.prisma.budget.create({
      data: {
        needId,
        clientId,
        professionalId,
        ...rest,
        ...(budgetServices && {
          budgetServices: {
            create: budgetServices.map((bs) => ({
              unitOfMeasurementId: bs.unitOfMeasurementId,
              task: bs.task,
              serviceValue: bs.serviceValue,
              quantity: bs.quantity,
              needsMaterials: bs.needsMaterials,
              materialsJson: bs.materialsJson || [],
            })),
          },
        }),
      },
      include: {
        budgetServices: {
          include: {
            unitOfMeasurement: true,
          },
        },
        need: true,
        professional: true,
        client: true,
      },
    }).then((budget) => ({
      ...budget,
      budgetServices: budget.budgetServices.map((svc) => ({
        ...svc,
        materialsJson: svc.materialsJson || [],
      })),
    }));
  }

  async getBudgetsByChatId(chatId: string) {
    return this.prisma.budget.findMany({
      where: {
        need: { chatId },
      },
      include: {
        budgetServices: true,
      },
    });
  }

  async updateBudget(id: number, input: UpdateBudgetInput) {
    const { budgetServices, ...data } = input;

    if (budgetServices) {
      await this.prisma.budgetService.deleteMany({ where: { budgetId: id } });
    }

    return this.prisma.budget.update({
      where: { id },
      data: {
        ...data,
        ...(budgetServices && {
          budgetServices: {
            create: budgetServices.map((bs) => ({
              unitOfMeasurementId: bs.unitOfMeasurementId,
              task: bs.task,
              quantity: bs.quantity,
              serviceValue: bs.serviceValue,
              needsMaterials: bs.needsMaterials,
              materialsJson: bs.materialsJson || [],
            })),
          },
        }),
      },
      include: {
        budgetServices: {
          include: {
            unitOfMeasurement: true,
          },
        },
        need: true,
        professional: true,
        client: true,
      },
    }).then((budget) => ({
      ...budget,
      budgetServices: budget.budgetServices.map((svc) => ({
        ...svc,
        materialsJson: svc.materialsJson || [],
      })),
    }));
  }

  async getBudgetById(id: number) {
    return this.prisma.budget.findUnique({
      where: { id },
      include: { budgetServices: true },
    });
  }

  async getBudgetByNeedId(needId: number) {
    return this.prisma.budget.findFirst({
      where: { needId },
      include: {
        budgetServices: { include: { unitOfMeasurement: true } },
        need: true,
        professional: true,
        client: true,
      },
    });
  }

  async getBudgetsByProfessional(professionalId: number) {
    return this.prisma.budget.findMany({
      where: { professionalId },
      include: {
        need: true,
        client: {
          include: {
            user: true,
          },
        },
        budgetServices: { include: { unitOfMeasurement: true } },
      },
    });
  }

  async updateBudgetStatus(id: number, status: string) {
    return this.prisma.budget.update({
      where: { id },
      data: { status },
    });
  }

  // Nova função de deleção
  async deleteBudget(id: number) {
    // Verifica se o orçamento existe
    const budget = await this.prisma.budget.findUnique({ where: { id } });
    if (!budget) {
      throw new Error('Orçamento não encontrado');
    }
    return this.prisma.budget.delete({
      where: { id },
      // Caso precise retornar relações, inclua o parâmetro include
      include: {
        budgetServices: true,
        need: true,
        professional: true,
        client: true,
      },
    });
  }
}
