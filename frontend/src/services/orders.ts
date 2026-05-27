import { api } from './api';
import type { Order } from '../types/Order';

export async function getOrders(): Promise<Order[]> {
  const response = await api.get('/orders');
  return response.data;
}

export async function updateOrder(
  id: string,
  status: Order['status'],
): Promise<Order> {
  const response = await api.patch(`/orders/${id}/status`, { status });
  return response.data;
}

export async function getSellerRanking(): Promise<
  { seller: string; totalSales: number }[]
> {
  const response = await api.get('/orders/ranking/seller');
  return response.data;
}

export async function markAsPaid(id: string): Promise<Order> {
  const response = await api.patch(`/orders/${id}/paid`);
  return response.data;
}