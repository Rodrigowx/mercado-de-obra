// @/types/Budget.ts
export interface Budget {
    id: number;
    description?: string;
    status: string;
    amount?: number;
    laborCost?: number;
    totalCost?: number;
    createdAt?: string;
    updatedAt?: string;
  
    // Relações:
    need?: {
      id: number;
      title: string;
    };
    client?: {
      id: number;
      user: {
        name: string;
      };
    };
  }
  