import { Resolver, Query, Args, Mutation, Int } from '@nestjs/graphql'; 
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GqlAuthGuard } from '../auth/guards/gql-auth/gql-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { User as CurrentUserType } from '@prisma/client';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async user(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<User | null> {
    return this.usersService.findOneById(id);
  }

  @Query(() => User, { name: 'currentUser' })
  @UseGuards(GqlAuthGuard)
  async getCurrentUser(
    @CurrentUser() user: CurrentUserType,
  ): Promise<User | null> {
    if (!user?.id) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }
    // Retornamos o user completo (com name, role etc.)
    return this.usersService.findOneById(user.id);
  }

  @Query(() => [User])
  @UseGuards(GqlAuthGuard)
  async topProfessionals(): Promise<User[]> {
    return this.usersService.getTopProfessionals(); 
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async createUser(
    @Args('createUserDto') createUserDto: CreateUserDto,
  ): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateUserDto') updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Mutation(() => Boolean)
  // @UseGuards(GqlAuthGuard)
  async deleteUser(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.usersService.delete(id);
  }

  @Mutation(() => Boolean, { name: 'updateChatList' })
  async updateChatList(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('chatId', { type: () => String }) chatId: string,
  ): Promise<string[]> {
    return this.usersService.updateChatList(userId, chatId);
  }

  /**
   * Busca a lista de chats de um profissional
   */
  @Query(() => [String], { name: 'getChatList' })
  async getChatList(
    @Args('userId', { type: () => Int }) userId: number,
  ): Promise<string[]> {
    return this.usersService.getChatList(userId);
  }
}
