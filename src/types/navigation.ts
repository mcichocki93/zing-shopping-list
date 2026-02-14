export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  ShoppingLists: undefined;
  Archive: undefined;
  Profile: undefined;
};

export type ShoppingListsStackParamList = {
  ListsDashboard: undefined;
  ListDetail: { listId: string };
};
