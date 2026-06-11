export type StorageLocation = 'fridge' | 'freezer' | 'pantry' | 'other';

export type Category =
  | 'dairy' | 'meat' | 'seafood' | 'vegetables' | 'fruits'
  | 'beverages' | 'snacks' | 'condiments' | 'grains' | 'frozen' | 'other';

export interface PantryItem {
  id: string;
  householdId: string;
  addedByUserId: string;
  addedByName: string;
  name: string;
  brand?: string;
  category: Category;
  location: StorageLocation;
  imageUrl?: string;
  barcode?: string;
  quantity: number;
  unit: string;
  purchaseDate: Date;
  expiryDate: Date;
  openedDate?: Date;
  isConsumed: boolean;
  isExpired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  memberIds: string[];
  createdByUserId: string;
  createdAt: Date;
  settings: HouseholdSettings;
}

export interface HouseholdSettings {
  expiryWarningDays: number;
  notificationsEnabled: boolean;
  notificationTime: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  householdId?: string;
  createdAt: Date;
}
