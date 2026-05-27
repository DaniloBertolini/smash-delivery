import {
  useContext,
} from 'react';

import {
  OrdersContext,
} from '../context/orders.context';

export function useOrders() {
  return useContext(
    OrdersContext,
  );
}