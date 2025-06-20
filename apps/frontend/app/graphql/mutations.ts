import { gql } from "@apollo/client";

export const CREATE_NEED = gql`
  mutation CreateNeed($input: CreateNeedInput!) {
    createNeed(createNeedInput: $input) {
      id
      title
      description
      clientId
      professionalId
      chatId
      serviceId
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_BUDGET = gql`
  mutation CreateBudget($input: CreateBudgetInput!) {
    createBudget(input: $input) {
      id
      needId
      clientId
      professionalId
      description
      status
      amount
      materialList
      materialCost
      totalCost
      serviceDetails
      createdAt
      updatedAt
      obraTitle
      obraAddress
      obraRules
      precisaAjudante
      valorDiariaAjudante
      qtdAjudantes
      valorAlimentacao
      valorTransporte
      margemLucro
      plannedStartDate
      plannedEndDate
      paymentDates
      paymentFrequency
      initialPaymentDate
      budgetServices {
        id
        unitOfMeasurementId
        task
        quantity
        serviceValue
        needsMaterials
        materialsJson
        createdAt
        updatedAt
      }
    }
  }
`;

export const DELETE_BUDGET = gql`
  mutation DeleteBudget($id: Int!) {
    deleteBudget(id: $id) {
      id
      needId
      clientId
      professionalId
      description
      status
      amount
      laborCost
      materialList
      materialCost
      totalCost
      serviceDetails
      createdAt
      updatedAt
      budgetServices {
        id
        unitOfMeasurementId
        task
        quantity
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_BUDGET = gql`
  mutation UpdateBudget($budgetId: Int!, $input: UpdateBudgetInput!) {
    updateBudget(id: $budgetId, input: $input) {
      id
      needId
      clientId
      professionalId
      description
      status
      amount
      laborCost
      materialList
      materialCost
      totalCost
      serviceDetails
      createdAt
      updatedAt
      obraTitle
      obraAddress
      obraRules
      precisaAjudante
      valorDiariaAjudante
      qtdAjudantes
      valorAlimentacao
      valorTransporte
      margemLucro
      plannedStartDate
      plannedEndDate
      paymentDates
      paymentFrequency
      initialPaymentDate
      budgetServices {
        id
        unitOfMeasurementId
        task
        quantity
        serviceValue
        needsMaterials
        materialsJson
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_BUDGET_STATUS = gql`
  mutation UpdateBudgetStatus($id: Int!, $status: String!) {
    updateBudgetStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

export const UPDATE_CHAT_LIST = gql`
  mutation UpdateChatList($userId: Int!, $chatId: String!) {
    updateChatList(userId: $userId, chatId: $chatId)
  }
`;

export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!, $role: String!) {
    login(loginUserDto: { email: $email, password: $password, role: $role }) {
      accessToken
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const REGISTER_USER = gql`
  mutation Register($registerUserDto: RegisterUserDto!) {
    register(registerUserDto: $registerUserDto) {
      id
      name
      email
      phoneNumber
      role
    }
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!, $role: String!) {
    requestPasswordReset(email: $email, role: $role)
  }
`;

export const VALIDATE_RESET_CODE = gql`
  mutation ValidateResetCode($email: String!, $role: String!, $code: String!) {
    validateResetCode(email: $email, role: $role, code: $code)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword(
    $email: String!
    $role: String!
    $newPassword: String!
  ) {
    resetPassword(email: $email, role: $role, newPassword: $newPassword)
  }
`;

export const ADD_PORTFOLIO = gql`
  mutation CreatePortfolio(
    $professionalId: Int!
    $title: String!
    $description: String!
    $serviceId: Int!
  ) {
    createPortfolio(
      professionalId: $professionalId
      data: { title: $title, description: $description, serviceId: $serviceId }
    ) {
      id
      title
      description
      serviceId
      professionalId
      createdAt
      updatedAt
      images {
        id
        url
      }
    }
  }
`;

export const UPDATE_PORTFOLIO = gql`
  mutation UpdatePortfolio(
    $professionalId: Int!
    $id: Int!
    $input: UpdatePortfolioInput!
  ) {
    updatePortfolio(professionalId: $professionalId, id: $id, input: $input) {
      id
      title
      description
      serviceId
      professionalId
      createdAt
      updatedAt
      images
    }
  }
`;

export const REMOVE_PORTFOLIO = gql`
  mutation RemovePortfolio($userId: Int!, $id: Int!) {
    deletePortfolio(userId: $userId, id: $id) {
      id
      title
      description
      serviceId
      professionalId
      createdAt
      updatedAt
      images
    }
  }
`;

export const CREATE_PORTFOLIO_WITH_IMAGES = gql`
  mutation CreatePortfolioWithImages(
    $professionalId: Int!
    $input: CreatePortfolioInput!
  ) {
    createPortfolioWithImages(professionalId: $professionalId, input: $input) {
      id
      title
      description
      serviceId
      professionalId
      createdAt
      updatedAt
      images
    }
  }
`;

export const UPLOAD_PROFILE_IMAGE = gql`
  mutation UploadProfileImage($userId: Int!, $file: Upload!) {
    uploadProfileImage(userId: $userId, file: $file) {
      id
      profileImage
      updatedAt
    }
  }
`;
