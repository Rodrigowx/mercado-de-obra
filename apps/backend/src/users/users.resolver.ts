/* eslint-disable @typescript-eslint/no-unused-vars */
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto'; // Add update DTO

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { nullable: true })
  async user(@Args('id') id: number): Promise<User | null> {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    return user;
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserDto') createUserDto: CreateUserDto,
  ): Promise<User> {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw new Error('Erro ao criar o usuário');
    }
  }

  // Add mutation to update user
  @Mutation(() => User)
  async updateUser(
    @Args('id') id: number,
    @Args('updateUserDto') updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto); // Add update logic in the service
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args('id') id: number): Promise<boolean> {
    try {
      return await this.usersService.delete(id);
    } catch (error) {
      throw new Error('Erro ao deletar o usuário');
    }
  }
}
