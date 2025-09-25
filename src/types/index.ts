export interface Contributor {
  id: string;
  name: string;
  avatar?: string;
  amount: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  contributors: Contributor[];
  deadline?: string;
  category: string;
}