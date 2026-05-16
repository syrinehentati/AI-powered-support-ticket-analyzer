import { IsString, IsArray, ArrayNotEmpty, IsNotEmpty } from 'class-validator';

export class AnalyzeTicketDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsArray()
  @ArrayNotEmpty()
  logs!: string[];
}