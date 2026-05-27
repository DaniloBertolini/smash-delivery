import { useState } from 'react';

import type { Order } from '../types/Order';

import { OrdersContext } from './orders.context';

export function OrdersProvider({
  children,
}: React.PropsWithChildren) {
  const [orders, setOrders] = useState<Order[]>([]);

  return (
    <OrdersContext.Provider value={{ orders, setOrders }}>
      {children}
    </OrdersContext.Provider>
  );
}