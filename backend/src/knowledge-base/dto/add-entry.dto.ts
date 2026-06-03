
import { IsString, IsArray, IsNotEmpty } from 'class-validator';

export class AddEntryDto {
  @IsString() @IsNotEmpty()
  ticket_id!: string;

  @IsString() @IsNotEmpty()
  title!: string;

  @IsString() @IsNotEmpty()
  description!: string;

  @IsArray()
  logs!: string[];

  @IsArray()
  resolution!: string[];

  @IsString() @IsNotEmpty()
  category!: string;

  @IsString() @IsNotEmpty()
  severity!: string;

  @IsString() @IsNotEmpty()
  detected_language!: string;
}
