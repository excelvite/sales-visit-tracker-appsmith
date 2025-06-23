
import { User, UserRole } from "@/types";

export interface Salesperson {
  id: string;
  name: string;
  email?: string;
  isManual: boolean;
  userId?: string;
  createdAt: Date;
}

const SALESPERSON_KEY = "svt_salespersons";

const initializeSalespersons = (): Salesperson[] => {
  const stored = localStorage.getItem(SALESPERSON_KEY);
  if (!stored) {
    localStorage.setItem(SALESPERSON_KEY, JSON.stringify([]));
    return [];
  }
  return JSON.parse(stored);
};

let mockSalespersons: Salesperson[] = initializeSalespersons();

const saveSalespersons = () => {
  localStorage.setItem(SALESPERSON_KEY, JSON.stringify(mockSalespersons));
};

export const getSalespersons = (): Salesperson[] => {
  mockSalespersons = initializeSalespersons();
  return mockSalespersons;
};

export const addManualSalesperson = (name: string, email?: string): Salesperson => {
  const newSalesperson: Salesperson = {
    id: String(Date.now() + Math.random()),
    name,
    email,
    isManual: true,
    createdAt: new Date(),
  };
  
  mockSalespersons.push(newSalesperson);
  saveSalespersons();
  return newSalesperson;
};

export const addUserAsSalesperson = (user: User): Salesperson => {
  const existingSalesperson = mockSalespersons.find(sp => sp.email === user.email);
  
  if (existingSalesperson && existingSalesperson.isManual) {
    // Merge with existing manual salesperson
    existingSalesperson.userId = user.id;
    existingSalesperson.isManual = false;
    saveSalespersons();
    return existingSalesperson;
  }
  
  const newSalesperson: Salesperson = {
    id: user.id,
    name: user.name,
    email: user.email,
    isManual: false,
    userId: user.id,
    createdAt: new Date(),
  };
  
  mockSalespersons.push(newSalesperson);
  saveSalespersons();
  return newSalesperson;
};

export const getSalespersonOptions = (): { value: string; label: string }[] => {
  const salespersons = getSalespersons();
  return salespersons.map(sp => ({
    value: sp.name,
    label: sp.name
  }));
};

export const mergeSalesperson = (manualSalespersonId: string, userId: string): boolean => {
  const salesperson = mockSalespersons.find(sp => sp.id === manualSalespersonId && sp.isManual);
  if (salesperson) {
    salesperson.userId = userId;
    salesperson.isManual = false;
    saveSalespersons();
    return true;
  }
  return false;
};
