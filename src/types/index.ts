
// User types
export enum UserRole {
  SALES = "sales",
  MANAGEMENT = "management", 
  ADMIN = "admin",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinDate: Date;
  password?: string;
}

// Store types
export enum StoreCategory {
  VET = "vet",
  PET_STORE = "pet_store",
  GROOMING = "grooming",
  BREEDING = "breeding",
  OTHER = "other",
}

export enum Species {
  CAT_ONLY = "cat_only",
  DOG_ONLY = "dog_only",
  MAJORITY_DOG = "majority_dog",
  MAJORITY_CAT = "majority_cat",
  FIFTY_FIFTY = "50_50",
  OTHERS = "others",
}

export enum PaymentTerms {
  CONSIGNMENT = "consignment",
  ADVANCED_PAYMENT = "advanced_payment",
  THIRTY_DAYS = "30_days",
  SIXTY_DAYS = "60_days",
  NINETY_DAYS = "90_days",
  OTHERS = "others",
}

export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  category: StoreCategory;
  otherCategoryName?: string; // For when category is OTHER
  region?: string;
  area?: string;
  picInfo?: string;
  salesperson?: string;
  species?: Species;
  otherSpecies?: string; // For when species is OTHERS
  paymentTerms?: PaymentTerms;
  otherPaymentTerms?: string; // For when paymentTerms is OTHERS
  isNew?: boolean;
  createdAt?: Date;
  isExCustomer?: boolean;
}

// Visit types
export enum VisitType {
  INITIAL = "initial",
  FIRST_VISIT = "first_visit",
  FOLLOW_UP = "follow_up",
  REVISIT = "revisit",
}

export enum VisitStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  VISITED = "visited",
  OPENED_ACCOUNT = "opened_account",
  NO_INTEREST = "no_interest",
  FOLLOW_UP_REQUIRED = "follow_up_required",
  REJECTED_VISIT = "rejected_visit",
  CLOSED_DOWN = "closed_down",
  EX_CUSTOMER = "ex_customer",
}

export enum PotentialLevel {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  NA = "na",
}

export interface VisitLog {
  id: string;
  storeId: string;
  storeName: string;
  userId?: string;
  userName: string;
  visitType: VisitType;
  visitStatus: VisitStatus[];
  potentialLevel: PotentialLevel;
  date: Date;
  notes: string;
  productsPromoted: string[];
  nextSteps: string;
  accountOpenedDate?: Date;
}

// Export types
export enum ExportFormat {
  CSV = "CSV",
  EXCEL = "Excel",
  PDF = "PDF",
}

// Summary types
export interface WeeklySummary {
  totalVisits: number;
  completedVisits: number;
  pendingVisits: number;
  topPerformers: string[];
  weekStartDate: Date;
  weekEndDate: Date;
  storesVisited: number;
  newAccounts: number;
  visitsBySalesperson: { [key: string]: number };
}

export interface MonthlySummary {
  totalVisits: number;
  newAccounts: Store[];
  conversionRate: number;
  topProducts: string[];
  year: number;
  month: number;
  totalRevisitedStores: number;
  visitsBySalesperson: { [key: string]: number };
}

// Universe tracking
export interface UniverseTracking {
  totalVetUniverse: number;
  totalPetStores: number;
  visitedVetStores: number;
  visitedPetStores: number;
  stateBreakdown: {
    [state: string]: {
      vet: {
        total: number;
        visited: number;
        coverage: number;
      };
      petStore: {
        total: number;
        visited: number;
        coverage: number;
      };
    };
  };
}
