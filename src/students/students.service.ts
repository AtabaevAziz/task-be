import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Student as PrismaStudent } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentEntity } from './entities/student.entity';
import { StudentModel } from './models/student.model';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStudentDto): Promise<StudentEntity> {
    const existingStudent = await this.prisma.student.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existingStudent) {
      throw new ConflictException('Student with this email already exists');
    }

    const student = await this.prisma.student.create({
      data: {
        name: dto.name,
        age: dto.age,
        email: dto.email,
      },
    });

    return this.toEntity(student);
  }

  async findAll(): Promise<StudentEntity[]> {
    const students = await this.prisma.student.findMany({
      orderBy: { name: 'asc' },
    });

    return students.map((student) => this.toEntity(student));
  }

  async remove(id: string): Promise<StudentEntity> {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`Student with id ${id} was not found`);
    }

    const deletedStudent = await this.prisma.student.delete({
      where: { id },
    });

    return this.toEntity(deletedStudent);
  }

  private toEntity(student: PrismaStudent): StudentEntity {
    const model: StudentModel = {
      id: student.id,
      name: student.name,
      age: student.age,
      email: student.email,
      createdAt: student.createdAt,
    };

    return new StudentEntity(model);
  }
}

