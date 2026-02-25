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
  categoryOrder?: string[];
  inviteCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invite {
  code: string;
  listId: string;
  listTitle: string;
  ownerName: string;
  ownerId: string;
  createdAt: Date;
}
