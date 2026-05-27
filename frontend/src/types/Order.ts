export type OrderStatus =
  | 'PENDING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'PENDING_PICKUP'
  | 'PICKED_UP';

export interface Order {
  id: string;
  customerName: string;
  seller: string;
  paid: boolean;
  contact: string;
  address: string;
  quantity: number;
  notes: string;
  isPickup: boolean;
  status: OrderStatus;
}