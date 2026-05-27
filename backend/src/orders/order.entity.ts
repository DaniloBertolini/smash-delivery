import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type OrderStatus =
  | 'PENDING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'PENDING_PICKUP'
  | 'PICKED_UP';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerName: string;

  @Column()
  seller: string;

  @Column({ type: 'boolean' })
  paid: boolean;

  @Column({ nullable: true })
  contact: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'boolean' })
  isPickup: boolean;

  @Column({
    type: 'enum',
    enum: [
      'PENDING',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'PENDING_PICKUP',
      'PICKED_UP',
    ],
    default: 'PENDING',
  })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}