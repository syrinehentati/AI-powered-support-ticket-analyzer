import { IsString, IsArray, ArrayNotEmpty, IsNotEmpty, IsOptional, Min, Max, IsNumber } from 'class-validator';

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

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  temperature?: number;
}