import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { CreateStudentDto } from './dto/create-student.dto';
import { StudentEntity } from './entities/student.entity';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() dto: CreateStudentDto): Promise<StudentEntity> {
    return this.studentsService.create(dto);
  }

  @Get()
  findAll(): Promise<StudentEntity[]> {
    return this.studentsService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<StudentEntity> {
    return this.studentsService.remove(id);
  }
}

