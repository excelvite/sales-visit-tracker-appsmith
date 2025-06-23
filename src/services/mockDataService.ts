import { faker } from "@faker-js/faker";
import { User, UserRole, Store, StoreCategory, VisitLog, VisitType, VisitStatus, PotentialLevel, WeeklySummary, MonthlySummary, UniverseTracking, Species, PaymentTerms } from "@/types";

// Data initialization
let stores: Store[] = [];
let users: User[] = [];
let visitLogs: VisitLog[] = [];

// Add products list management
let productsList = [
  "EVFA PRO",
  "EVFA PRO KatzE",
  "EVFA Cap",
  "EVFA PRO PLUS"
];

// Add salesperson list management
let salespersonList = [
  "John Smith",
  "Sarah Johnson", 
  "Mike Chen",
  "Lisa Wong",
  "David Brown"
];

// Helper function to generate random date within the last year
const getRandomDate = () => {
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  return faker.date.between({ from: oneYearAgo, to: now });
};

// Helper function to ensure date is a Date object
const ensureDate = (date: any): Date => {
  if (date instanceof Date) {
    return date;
  }
  return new Date(date);
};

// Create demo admin user first
const demoAdmin: User = {
  id: faker.string.uuid(),
  name: "Demo Administrator",
  email: "admin@demo.com",
  role: UserRole.ADMIN,
  joinDate: new Date(),
  password: 'admin123',
};
users.push(demoAdmin);

// Generate mock users
for (let i = 0; i < 5; i++) {
  users.push({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: faker.helpers.enumValue(UserRole),
    joinDate: getRandomDate(),
    password: 'password123',
  });
}

// Generate mock stores
for (let i = 0; i < 20; i++) {
  const storeCategory = faker.helpers.enumValue(StoreCategory);
  const isVet = storeCategory === StoreCategory.VET;
  
  stores.push({
    id: faker.string.uuid(),
    name: faker.company.name(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    category: storeCategory,
    otherCategoryName: storeCategory === StoreCategory.OTHER ? faker.word.noun() : undefined,
    region: faker.location.county(),
    area: faker.location.nearbyGPSCoordinate().toString(),
    picInfo: faker.person.jobTitle(),
    salesperson: faker.helpers.arrayElement(salespersonList),
    species: isVet ? faker.helpers.enumValue(Species) : undefined,
    otherSpecies: isVet && faker.datatype.boolean() ? faker.animal.type() : undefined,
    paymentTerms: faker.helpers.enumValue(PaymentTerms),
    otherPaymentTerms: faker.finance.transactionType(),
    isNew: faker.datatype.boolean(),
    createdAt: getRandomDate(),
    isExCustomer: faker.datatype.boolean(),
  });
}

// Generate mock visit logs
for (let i = 0; i < 50; i++) {
  const store = faker.helpers.arrayElement(stores);
  const visitDate = getRandomDate();
  
  visitLogs.push({
    id: faker.string.uuid(),
    storeId: store.id,
    storeName: store.name,
    userId: faker.helpers.arrayElement(users).id,
    userName: faker.person.fullName(),
    visitType: faker.helpers.enumValue(VisitType),
    visitStatus: [faker.helpers.enumValue(VisitStatus)],
    potentialLevel: faker.helpers.enumValue(PotentialLevel),
    date: visitDate,
    notes: faker.lorem.sentence(),
    productsPromoted: [faker.helpers.arrayElement(productsList)],
    nextSteps: faker.lorem.sentence(),
    accountOpenedDate: faker.date.future({ years: 1, refDate: visitDate }),
  });
}

// Mock weekly summary data
const generateWeeklySummary = (): WeeklySummary => {
  const now = new Date();
  const weekStartDate = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)));
  const weekEndDate = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? 0 : 7)));

  const allVisits = getVisitLogs();
  const thisWeekVisits = allVisits.filter(
    visit => {
      const visitDate = ensureDate(visit.date);
      return visitDate >= weekStartDate && visitDate <= weekEndDate;
    }
  );

  const visitsBySalesperson: { [key: string]: number } = {};
  stores.forEach(store => {
    const salesperson = store.salesperson || "Unassigned";
    visitsBySalesperson[salesperson] = (visitsBySalesperson[salesperson] || 0) + 1;
  });

  return {
    totalVisits: thisWeekVisits.length,
    completedVisits: thisWeekVisits.filter(visit => visit.visitStatus.includes(VisitStatus.COMPLETED)).length,
    pendingVisits: thisWeekVisits.filter(visit => visit.visitStatus.includes(VisitStatus.PENDING)).length,
    topPerformers: faker.helpers.arrayElements(users.map(user => user.name), 2),
    weekStartDate: weekStartDate,
    weekEndDate: weekEndDate,
    storesVisited: faker.number.int({ min: 5, max: 15 }),
    newAccounts: faker.number.int({ min: 1, max: 5 }),
    visitsBySalesperson: visitsBySalesperson,
  };
};

// Mock monthly summary data
const generateMonthlySummary = (): MonthlySummary => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const allVisits = getVisitLogs();
  const thisMonthVisits = allVisits.filter(
    visit => {
      const visitDate = ensureDate(visit.date);
      return visitDate.getFullYear() === currentYear && visitDate.getMonth() === currentMonth;
    }
  );

  const newAccountsThisMonth = stores.filter(
    store => {
      if (!store.createdAt) return false;
      const createdDate = ensureDate(store.createdAt);
      return createdDate.getFullYear() === currentYear && createdDate.getMonth() === currentMonth;
    }
  );

  const visitsBySalesperson: { [key: string]: number } = {};
  stores.forEach(store => {
    const salesperson = store.salesperson || "Unassigned";
    visitsBySalesperson[salesperson] = (visitsBySalesperson[salesperson] || 0) + 1;
  });

  return {
    totalVisits: thisMonthVisits.length,
    newAccounts: newAccountsThisMonth,
    conversionRate: faker.number.float({ min: 0.1, max: 0.9, fractionDigits: 2 }),
    topProducts: faker.helpers.arrayElements(productsList, 3),
    year: currentYear,
    month: currentMonth,
    totalRevisitedStores: faker.number.int({ min: 10, max: 30 }),
    visitsBySalesperson: visitsBySalesperson,
  };
};

// Mock universe tracking data
const generateUniverseTracking = (): UniverseTracking => {
  const totalVetUniverse = faker.number.int({ min: 100, max: 500 });
  const totalPetStores = faker.number.int({ min: 200, max: 800 });
  const visitedVetStores = faker.number.int({ min: 50, max: totalVetUniverse });
  const visitedPetStores = faker.number.int({ min: 100, max: totalPetStores });

  const stateBreakdown: {
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
  } = {};

  const states = ["Kuala Lumpur", "Selangor", "Penang", "Johor", "Perak"];
  states.forEach(state => {
    const vetTotal = faker.number.int({ min: 10, max: 100 });
    const vetVisited = faker.number.int({ min: 5, max: vetTotal });
    const petStoreTotal = faker.number.int({ min: 20, max: 200 });
    const petStoreVisited = faker.number.int({ min: 10, max: petStoreTotal });

    stateBreakdown[state] = {
      vet: {
        total: vetTotal,
        visited: vetVisited,
        coverage: parseFloat(((vetVisited / vetTotal) * 100).toFixed(2)),
      },
      petStore: {
        total: petStoreTotal,
        visited: petStoreVisited,
        coverage: parseFloat(((petStoreVisited / petStoreTotal) * 100).toFixed(2)),
      },
    };
  });

  return {
    totalVetUniverse: totalVetUniverse,
    totalPetStores: totalPetStores,
    visitedVetStores: visitedVetStores,
    visitedPetStores: visitedPetStores,
    stateBreakdown: stateBreakdown,
  };
};

// Function to export data to CSV format
export const exportToCSV = (data: any[], fileName: string): string => {
  if (!data.length) {
    return "No data to export.";
  }

  const csvRows = [];
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  
  // Create a download link
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  return "CSV file has been downloaded.";
};

// Product management functions
export const getProductsList = (): string[] => {
  return [...productsList];
};

export const updateProductsList = (newProducts: string[]): void => {
  productsList = [...newProducts];
  localStorage.setItem('productsList', JSON.stringify(productsList));
};

// Salesperson management functions
export const getSalespersonList = (): string[] => {
  return [...salespersonList];
};

export const updateSalespersonList = (newSalespersonList: string[]): void => {
  salespersonList = [...newSalespersonList];
  localStorage.setItem('salespersonList', JSON.stringify(salespersonList));
};

// Local storage functions
export const getStores = (): Store[] => {
  const storedStores = localStorage.getItem('stores');
  return storedStores ? JSON.parse(storedStores) : stores;
};

export const getStoreById = (id: string): Store | undefined => {
  const storedStores = localStorage.getItem('stores');
  const storeList: Store[] = storedStores ? JSON.parse(storedStores) : stores;
  return storeList.find(store => store.id === id);
};

export const addStore = (store: Store): void => {
  const storedStores = localStorage.getItem('stores');
  const storeList: Store[] = storedStores ? JSON.parse(storedStores) : stores;
  storeList.push(store);
  localStorage.setItem('stores', JSON.stringify(storeList));
  stores = storeList;
};

export const updateStore = (updatedStore: Store): void => {
  const storedStores = localStorage.getItem('stores');
  let storeList: Store[] = storedStores ? JSON.parse(storedStores) : stores;
  storeList = storeList.map(store => store.id === updatedStore.id ? updatedStore : store);
  localStorage.setItem('stores', JSON.stringify(storeList));
  stores = storeList;
};

export const deleteStore = (id: string): void => {
  const storedStores = localStorage.getItem('stores');
  let storeList: Store[] = storedStores ? JSON.parse(storedStores) : stores;
  storeList = storeList.filter(store => store.id !== id);
  localStorage.setItem('stores', JSON.stringify(storeList));
  stores = storeList;
};

export const getUsers = (): User[] => {
  return users;
};

export const getUserByEmail = (email: string): User | undefined => {
    return users.find(user => user.email === email);
};

export const getVisitLogs = (): VisitLog[] => {
  const storedVisitLogs = localStorage.getItem('visitLogs');
  if (storedVisitLogs) {
    const visitLogList: VisitLog[] = JSON.parse(storedVisitLogs);
    // Ensure dates are Date objects
    return visitLogList.map(visit => ({
      ...visit,
      date: ensureDate(visit.date),
      accountOpenedDate: visit.accountOpenedDate ? ensureDate(visit.accountOpenedDate) : undefined
    }));
  }
  return visitLogs;
};

export const getVisitLogsByStoreId = (storeId: string): VisitLog[] => {
  const allVisits = getVisitLogs();
  return allVisits.filter(visit => visit.storeId === storeId);
};

export const addVisitLog = (visitLog: VisitLog): void => {
  const storedVisitLogs = localStorage.getItem('visitLogs');
  const visitLogList: VisitLog[] = storedVisitLogs ? JSON.parse(storedVisitLogs) : visitLogs;
  visitLogList.push(visitLog);
  localStorage.setItem('visitLogs', JSON.stringify(visitLogList));
  visitLogs = visitLogList;
};

export const updateVisitLog = (updatedVisitLog: VisitLog): void => {
  const storedVisitLogs = localStorage.getItem('visitLogs');
  let visitLogList: VisitLog[] = storedVisitLogs ? JSON.parse(storedVisitLogs) : visitLogs;
  visitLogList = visitLogList.map(visitLog => visitLog.id === updatedVisitLog.id ? updatedVisitLog : visitLog);
  localStorage.setItem('visitLogs', JSON.stringify(visitLogList));
  visitLogs = visitLogList;
};

export const deleteVisitLog = (id: string): void => {
  const storedVisitLogs = localStorage.getItem('visitLogs');
  let visitLogList: VisitLog[] = storedVisitLogs ? JSON.parse(storedVisitLogs) : visitLogs;
  visitLogList = visitLogList.filter(visitLog => visitLog.id !== id);
  localStorage.setItem('visitLogs', JSON.stringify(visitLogList));
  visitLogs = visitLogList;
};

export const getWeeklySummary = (): WeeklySummary => {
  return generateWeeklySummary();
};

export const getMonthlySummary = (): MonthlySummary => {
  return generateMonthlySummary();
};

export const getUniverseTracking = (): UniverseTracking => {
  return generateUniverseTracking();
};

// Add missing authentication functions
export const registerUser = (name: string, email: string, password: string, role: UserRole = UserRole.SALES): User => {
  const newUser: User = {
    id: faker.string.uuid(),
    name: name,
    email: email,
    role: role,
    joinDate: new Date(),
    password: password,
  };
  users.push(newUser);
  return newUser;
};

export const loginUser = (email: string, password: string): User | null => {
  console.log("Looking for user with email:", email, "and password:", password);
  console.log("Available users:", users.map(u => ({ email: u.email, password: u.password, role: u.role })));
  return users.find(user => user.email === email && user.password === password) || null;
};

export const getRegisteredUsers = (): User[] => {
  return users;
};

export const updateUserProfile = (userId: string, updates: Partial<User>): User | null => {
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    return users[userIndex];
  }
  return null;
};

export const resetUserPassword = (userId: string, newPassword: string = 'temp123'): boolean => {
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    users[userIndex].password = newPassword;
    return true;
  }
  return false;
};

// Add missing visit import function
export const addVisitLogFromImport = (visitData: any): void => {
  const newVisitLog: VisitLog = {
    id: faker.string.uuid(),
    storeId: visitData.storeId || faker.string.uuid(),
    storeName: visitData.storeName || 'Unknown Store',
    userId: visitData.userId || faker.helpers.arrayElement(users).id,
    userName: visitData.userName || faker.person.fullName(),
    visitType: visitData.visitType || faker.helpers.enumValue(VisitType),
    visitStatus: visitData.visitStatus || [faker.helpers.enumValue(VisitStatus)],
    potentialLevel: visitData.potentialLevel || faker.helpers.enumValue(PotentialLevel),
    date: visitData.date ? new Date(visitData.date) : getRandomDate(),
    notes: visitData.notes || '',
    productsPromoted: visitData.productsPromoted || [faker.helpers.arrayElement(productsList)],
    nextSteps: visitData.nextSteps || '',
    accountOpenedDate: visitData.accountOpenedDate ? new Date(visitData.accountOpenedDate) : undefined,
  };
  addVisitLog(newVisitLog);
};

export const importStoreWithVisit = (storeData: any): { storeAdded: boolean; storeUpdated: boolean; visitCreated: boolean } => {
  // Create store if it doesn't exist
  const existingStore = stores.find(s => s.name.toLowerCase() === storeData.name.toLowerCase());
  let storeId = existingStore?.id;
  let storeAdded = false;
  let storeUpdated = false;
  
  if (!existingStore) {
    const newStore: Store = {
      id: faker.string.uuid(),
      name: storeData.name || 'Unknown Store',
      category: storeData.category || StoreCategory.PET_STORE,
      region: storeData.region || '',
      area: storeData.area || '',
      address: storeData.address || "",
      city: storeData.city || "",
      state: storeData.state || "Kuala Lumpur",
      zipCode: storeData.zipCode || "",
      phone: storeData.phone || "",
      email: storeData.email || "",
      picInfo: storeData.picInfo || "",
      salesperson: storeData.salesperson || "",
      isNew: true,
      createdAt: new Date()
    };
    addStore(newStore);
    storeId = newStore.id;
    storeAdded = true;
  } else {
    storeUpdated = true;
  }
  
  let visitCreated = false;
  // Add visit log
  if (storeId) {
    addVisitLogFromImport({ ...storeData, storeId });
    visitCreated = true;
  }

  return { storeAdded, storeUpdated, visitCreated };
};

export const setupAutomaticBackup = () => {
  // Mock function for automatic backup setup
  console.log('Automatic backup setup completed');
};

// Initialize from localStorage on load
const initializeFromStorage = () => {
  // Load stores
  const storedStores = localStorage.getItem('stores');
  if (storedStores) {
    try {
      stores = JSON.parse(storedStores);
    } catch (e) {
      console.error('Error parsing stored stores:', e);
    }
  }

  // Load visit logs
  const storedVisitLogs = localStorage.getItem('visitLogs');
  if (storedVisitLogs) {
    try {
      visitLogs = JSON.parse(storedVisitLogs);
    } catch (e) {
      console.error('Error parsing stored visit logs:', e);
    }
  }

  // Load products list
  const storedProducts = localStorage.getItem('productsList');
  if (storedProducts) {
    try {
      productsList = JSON.parse(storedProducts);
    } catch (e) {
      console.error('Error parsing stored products list:', e);
    }
  }

  // Load salesperson list
  const storedSalespersons = localStorage.getItem('salespersonList');
  if (storedSalespersons) {
    try {
      salespersonList = JSON.parse(storedSalespersons);
    } catch (e) {
      console.error('Error parsing stored salesperson list:', e);
    }
  }

  // Ensure demo admin user exists
  const demoAdminExists = users.find(user => user.email === "admin@demo.com");
  if (!demoAdminExists) {
    users.unshift(demoAdmin);
  }
};

initializeFromStorage();
