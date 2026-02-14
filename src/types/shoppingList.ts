export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  category?: string;
  isCompleted: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface ShoppingList {
  id: string;
  title: string;
  ownerId: string;
  memberIds: string[];
  isArchived: boolean;
  items: ShoppingItem[];
  createdAt: Date;
  updatedAt: Date;
}
