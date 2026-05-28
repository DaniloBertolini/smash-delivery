import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  seller: string;

  @IsBoolean()
  paid: boolean;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  isPickup: boolean;
}
