import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { StudentEntity } from './entities/student.entity';

type PrismaStudentRecord = {
  id: string;
  name: string;
  age: number;
  email: string;
  createdAt: Date;
};

export interface StudentsRepositoryContract {
  findById(id: string): Promise<StudentEntity | null>;
  findByEmail(email: string): Promise<StudentEntity | null>;
  findAll(): Promise<StudentEntity[]>;
  create(entity: StudentEntity): Promise<StudentEntity>;
  update(entity: StudentEntity): Promise<StudentEntity>;
  remove(id: string): Promise<StudentEntity>;
}

@Injectable()
export class StudentsRepository implements StudentsRepositoryContract {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<StudentEntity | null> {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    return student ? this.toEntity(student) : null;
  }

  async findByEmail(email: string): Promise<StudentEntity | null> {
    const student = await this.prisma.student.findUnique({
      where: { email },
    });

    return student ? this.toEntity(student) : null;
  }

  async findAll(): Promise<StudentEntity[]> {
    const students: PrismaStudentRecord[] = await this.prisma.student.findMany({
      orderBy: { name: 'asc' },
    });

    return students.map((student) => this.toEntity(student));
  }

  async create(entity: StudentEntity): Promise<StudentEntity> {
    const student = await this.prisma.student.create({
      data: {
        name: entity.name,
        age: entity.age,
        email: entity.email,
      },
    });

    return this.toEntity(student);
  }

  async update(entity: StudentEntity): Promise<StudentEntity> {
    const student = await this.prisma.student.update({
      where: { id: entity.id },
      data: {
        name: entity.name,
        age: entity.age,
        email: entity.email,
      },
    });

    return this.toEntity(student);
  }

  async remove(id: string): Promise<StudentEntity> {
    const student = await this.prisma.student.delete({
      where: { id },
    });

    return this.toEntity(student);
  }

  private toEntity(student: PrismaStudentRecord): StudentEntity {
    return new StudentEntity({
      id: student.id,
      name: student.name,
      age: student.age,
      email: student.email,
      createdAt: student.createdAt,
    });
  }
}
