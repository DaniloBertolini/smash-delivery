import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { CreateOrderDto } from './create-order.dto';
import { Order } from './order.entity';
import { UpdateOrderDto } from './update-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.service.importOrders(file);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id')
    id: string,
    @Body('status')
    status: Order['status'],
  ) {
    return this.service.updateStatus(id, status);
  }

  @Get('ranking/seller')
  getSellerRanking() {
    return this.service.getSellerRanking();
  }

  @Patch(':id/paid')
  markAsPaid(@Param('id') id: string) {
    return this.service.markAsPaid(id);
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.service.create(createOrderDto);
  }

  @Patch(':id')
  update(
    @Param('id')
    id: string,
    @Body()
    updateOrderDto: UpdateOrderDto,
  ) {
    return this.service.update(id, updateOrderDto);
  }
}
