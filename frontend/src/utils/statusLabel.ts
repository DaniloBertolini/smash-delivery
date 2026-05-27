import type { OrderStatus } from "../types/Order";

export function getStatusLabel(status: OrderStatus) {
  const labels: Record<string, string> = {
    PENDING: 'Pendente',
    OUT_FOR_DELIVERY: 'Saiu para entrega',
    DELIVERED: 'Entregue',
    PENDING_PICKUP: 'Pendente retirada',
    PICKED_UP: 'Retirado',
  };

  return labels[status] ?? status;
}