export interface UserCheckIn {
  type: 'Check In';
  userId: string;
}

export interface UserPurchaseItem {
  type: 'Purchase Item';
  userId: string;
  itemId: string;
}
