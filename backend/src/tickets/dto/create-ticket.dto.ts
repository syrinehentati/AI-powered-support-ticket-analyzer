import { IsString, IsArray, IsNotEmpty } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  language!: string;

  @IsArray()
  logs!: string[];
}