import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateStudentDto } from './dto/create-student.dto';
import { StudentResponseDto } from './dto/student-response.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentEntity } from './entities/student.entity';
import {
  StudentsRepository,
  StudentsRepositoryContract,
} from './students.repository';

@Injectable()
export class StudentsService {
  constructor(
    @Inject(StudentsRepository)
    private readonly studentsRepository: StudentsRepositoryContract,
  ) {}

  async create(dto: CreateStudentDto): Promise<StudentResponseDto> {
    // Business logic checks whether the request can create a new student before touching the database.
    const existingStudent = await this.studentsRepository.findByEmail(dto.email);

    if (existingStudent) {
      throw new ConflictException('Student with this email already exists');
    }

    // The service converts the incoming DTO into a domain entity for persistence.
    const student = await this.studentsRepository.create(
      new StudentEntity({
        name: dto.name,
        age: dto.age,
        email: dto.email,
      }),
    );

    return this.toResponseDto(student);
  }

  async findAll(): Promise<StudentResponseDto[]> {
    const students = await this.studentsRepository.findAll();
    return students.map((student) => this.toResponseDto(student));
  }

  async findOne(id: string): Promise<StudentResponseDto> {
    const student = await this.getStudentOrThrow(id);
    return this.toResponseDto(student);
  }

  async update(id: string, dto: UpdateStudentDto): Promise<StudentResponseDto> {
    const student = await this.getStudentOrThrow(id);
    if (dto.email && dto.email !== student.email) {
      const existingStudent = await this.studentsRepository.findByEmail(dto.email);
      if (existingStudent) {
        throw new ConflictException('Student with this email already exists');
      }
    }

    const updatedStudent = await this.studentsRepository.update(
      new StudentEntity({
        id: student.id,
        name: dto.name ?? student.name,
        age: dto.age ?? student.age,
        email: dto.email ?? student.email,
        createdAt: student.createdAt,
      }),
    );
    return this.toResponseDto(updatedStudent);
  }

  async remove(id: string): Promise<StudentResponseDto> {
    await this.getStudentOrThrow(id);
    const deletedStudent = await this.studentsRepository.remove(id);
    return this.toResponseDto(deletedStudent);
  }

  private toResponseDto(student: StudentEntity): StudentResponseDto {
    // The service maps the domain entity back into the API response contract.
    return {
      id: student.id,
      name: student.name,
      age: student.age,
      email: student.email,
      createdAt: student.createdAt,
    };
  }

  private async getStudentOrThrow(id: string): Promise<StudentEntity> {
    const student = await this.studentsRepository.findById(id);

    if (!student) {
      throw new NotFoundException(`Student with id ${id} was not found`);
    }

    return student;
  }
}
