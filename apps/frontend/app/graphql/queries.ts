import { gql } from "@apollo/client";

export const GET_CHAT_LIST = gql`
  query GetChatList($userId: Int!) {
    getChatList(userId: $userId)
  }
`;

export const GET_RANDOM_PORTFOLIOS = gql`
  query getRandomPortfolios {
    getRandomPortfolios {
      id
      title
      description
      serviceId
      professionalId
      images
    }
  }
`;

export const ALL_UNITS = gql`
  query AllUnits {
    allUnits {
      id
      code
      description
    }
  }
`;

export const GET_TOP_SERVICES = gql`
  query GetTopServices {
    topServices {
      id
      name
      rating
      portfolioImages
      professional {
        id
      }
    }
  }
`;

export const GET_SERVICES = gql`
  query {
    services {
      id
      name
      icon
    }
  }
`;

export const BUDGETS_BY_PROFESSIONAL = gql`
  query BudgetsByProfessional($professionalId: Int!) {
    budgetsByProfessional(professionalId: $professionalId) {
      id
      description
      status
      totalCost
      createdAt
      need {
        id
        title
        serviceId
      }
      client {
        id
        user {
          name
        }
      }
      budgetServices {
        id
        task
        quantity
        unitOfMeasurementId
        serviceValue
        unitOfMeasurement {
          code
          description
        }
      }
    }
  }
`;


export const BUDGET_BY_NEED_ID = gql`
  query BudgetByNeedId($needId: Int!) {
    budgetByNeedId(needId: $needId) {
      id
      description
      status
      amount
      createdAt
      updatedAt
      totalCost
      budgetServices {
        id
        unitOfMeasurementId
        task
        quantity
        serviceValue
        createdAt
        updatedAt
      }
    }
  }
`;


export const NEED_BY_CHAT_ID = gql`
  query NeedByChatId($chatId: String!) {
    needsByChatId(chatId: $chatId) {
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

export const GET_PROFESSIONAL = gql`
  query($id: Int!) {
    getProfessionalByUserId(id: $id) {
      createdAt
      id
      user {
        name
      }
      portfolios {
        id
        title
        description
        serviceId
        images
      }
    }
  }
`;

export const GET_SKILLS_BY_PROFESSIONAL = gql`
  query getSkillsByProfessionalId($id: Int!) {
    getSkillsByProfessionalId(id: $id) {
      id
      serviceId
      serviceName
      createdAt
      updatedAt
    }
  }
`;

export const GET_PORTFOLIOS = gql`
  query GetPortfolios($professionalId: Int!) {
    getPortfolios(professionalId: $professionalId) {
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

export const GET_PROFILE_IMAGE_URL = gql`
  query GetProfileImageUrl($blobName: String!) {
    getProfileImageUrl(blobName: $blobName)
  }
`;

export const GET_PORTFOLIO_IMAGE_URLS = gql`
  query GetPortfolioImageUrls($blobNames: [String!]!) {
    getPortfolioImageUrls(blobNames: $blobNames)
  }
`;
