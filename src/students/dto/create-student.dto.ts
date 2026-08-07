import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(6)
  age!: number;

  @IsEmail()
  email!: string;
}

