import { IsString, IsArray, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  ticket_id!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  severity!: string;

  @IsArray()
  logs!: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  temperature?: number;
}