import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { CreateOrderDto } from './create-order.dto';
import { Order } from './order.entity';
import { UpdateOrderDto } from './update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  findAll(): Promise<Order[]> {
    return this.orderRepository.find();
  }

  async importOrders(
    file: Express.Multer.File | undefined,
  ): Promise<{ imported: number }> {
    if (!file) {
      throw new Error('Arquivo não enviado');
    }

    const buffer: Buffer = file.buffer;
    const workbook = XLSX.read(buffer, {
      type: 'buffer',
    });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json<any>(sheet, {
      header: 1,
      defval: '',
    });

    jsonData.shift();
    jsonData.shift();

    const columnMapping: Record<number, string> = {
      0: 'nome',
      1: 'pago',
      2: 'vendedor',
      3: 'contato',
      4: 'endereço',
      5: 'quantidade',
      6: 'observação',
      7: 'retirar',
    };

    let importedCount = 0;

    for (const row of jsonData) {
      const mappedRow: Record<string, unknown> = {};

      for (const [colIndex, columnName] of Object.entries(columnMapping)) {
        const value = row[parseInt(colIndex, 10)];
        mappedRow[columnName] = value !== undefined ? value : '';
      }

      const customerName =
        typeof mappedRow.nome === 'string' ? mappedRow.nome : '';

      if (!customerName.trim()) {
        continue;
      }

      const existingOrder = await this.orderRepository.findOne({
        where: { customerName },
      });

      const contactValue =
        typeof mappedRow.contato === 'string' ? mappedRow.contato : '';
      const addressValue =
        typeof mappedRow.endereço === 'string' ? mappedRow.endereço : '';
      const notesValue =
        typeof mappedRow.observação === 'string' ? mappedRow.observação : '';

      const orderData = {
        customerName,
        paid:
          typeof mappedRow.pago === 'string' &&
          mappedRow.pago.toUpperCase() === 'SIM',
        seller:
          typeof mappedRow.vendedor === 'string' ? mappedRow.vendedor : '',
        contact: contactValue || undefined,
        address: addressValue || undefined,
        quantity:
          typeof mappedRow.quantidade === 'number'
            ? mappedRow.quantidade
            : typeof mappedRow.quantidade === 'string'
              ? parseInt(mappedRow.quantidade, 10)
              : 1,
        notes: notesValue || undefined,
        isPickup:
          typeof mappedRow.retirar === 'string' &&
          mappedRow.retirar.toUpperCase() === 'SIM',
        status: 'PENDING' as const,
      };

      if (existingOrder) {
        Object.assign(existingOrder, orderData);
        await this.orderRepository.save(existingOrder);
      } else {
        await this.orderRepository.save(this.orderRepository.create(orderData));
      }
      importedCount++;
    }

    return { imported: importedCount };
  }

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new Error('Order not found');
    }

    order.status = status;
    return this.orderRepository.save(order);
  }

  async getSellerRanking(): Promise<{ seller: string; totalSales: number }[]> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.seller', 'seller')
      .addSelect('SUM(order.quantity)', 'totalSales')
      .groupBy('order.seller')
      .orderBy('totalSales', 'DESC')
      .getRawMany();

    return result.map((row) => ({
      seller: row.seller,
      totalSales: Number(row.totalSales) || 0,
    }));
  }

  async markAsPaid(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new Error('Order not found');
    }

    order.paid = true;
    return this.orderRepository.save(order);
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create(createOrderDto);
    return this.orderRepository.save(order);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    Object.assign(order, updateOrderDto);
    return this.orderRepository.save(order);
  }
}
