import { registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client'; // Importe o enum gerado pelo Prisma

// Registrando o enum 'Role' para o GraphQL entender
registerEnumType(Role, {
  name: 'Role', // Nome do tipo GraphQL que será usado no schema
  description: 'User role - can be CLIENT or PROFESSIONAL', // Descrição opcional
});
