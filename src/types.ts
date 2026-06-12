export type ServiceCategory = 'pintura' | 'hidraulica' | 'eletrica' | 'alvenaria' | 'marcenaria' | 'carpintaria';

export interface ServiceDetail {
  id: ServiceCategory;
  title: string;
  shortDesc: string;
  description: string;
  iconName: string;
  subServices: string[];
}

export interface PortfolioProject {
  id: string;
  title: string;
  category: ServiceCategory;
  categoryLabel: string;
  description: string;
  location: string;
  imageUrl: string;
  beforeAfter?: {
    beforeDesc: string;
    afterDesc: string;
  };
}

export interface BudgetInquiry {
  id: string;
  name: string;
  phone: string;
  city: string;
  services: ServiceCategory[];
  scale: 'pequeno' | 'medio' | 'grande' | 'comercial';
  description: string;
  createdAt: string;
  status: 'aberto' | 'em_andamento' | 'finalizado' | 'aceito' | 'recusado';
  phase?: 'planejamento' | 'preparacao' | 'execucao' | 'acabamento' | 'entregue';
  notes?: Array<{ id: string; date: string; text: string; author?: string }>;
  finance?: {
    budgetTotal: number;
    materialsCost: number;
    laborCost: number;
    otherExpenses: number;
    payments: Array<{
      id: string;
      date: string;
      amount: number;
      description: string;
      type: 'receita' | 'despesa';
    }>;
  };
}
