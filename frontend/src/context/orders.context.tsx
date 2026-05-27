import {
  createContext,
} from 'react';

import type {
  Order,
} from '../types/Order';

type ContextType = {
  orders: Order[];

  setOrders: (
    orders: Order[],
  ) => void;
};

export const OrdersContext = createContext<ContextType>(
  {} as ContextType,
);
