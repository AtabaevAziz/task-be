import { ConflictException, NotFoundException } from '@nestjs/common';

import { CreateStudentDto } from './dto/create-student.dto';
import { StudentResponseDto } from './dto/student-response.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentEntity } from './entities/student.entity';
import { StudentsRepositoryContract } from './students.repository';
import { StudentsService } from './students.service';

describe('StudentsService', () => {
  let service: StudentsService;
  let repository: jest.Mocked<StudentsRepositoryContract>;

  const createdAt = new Date('2026-08-12T10:00:00.000Z');
  const baseStudent = new StudentEntity({
    id: 'student-1',
    name: 'Ivan',
    age: 20,
    email: 'ivan@example.com',
    createdAt,
  });
  const baseResponse: StudentResponseDto = {
    id: 'student-1',
    name: 'Ivan',
    age: 20,
    email: 'ivan@example.com',
    createdAt,
  };

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as jest.Mocked<StudentsRepositoryContract>;

    service = new StudentsService(repository);
  });

  it('creates a student when email is unique', async () => {
    const dto: CreateStudentDto = {
      name: 'Ivan',
      age: 20,
      email: 'ivan@example.com',
    };

    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockResolvedValue(baseStudent);

    await expect(service.create(dto)).resolves.toEqual(baseResponse);
    expect(repository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: dto.name,
        age: dto.age,
        email: dto.email,
      }),
    );
  });

  it('throws ConflictException when email already exists on create', async () => {
    const dto: CreateStudentDto = {
      name: 'Ivan',
      age: 20,
      email: 'ivan@example.com',
    };

    repository.findByEmail.mockResolvedValue(baseStudent);

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('returns one student by id', async () => {
    repository.findById.mockResolvedValue(baseStudent);

    await expect(service.findOne('student-1')).resolves.toEqual(baseResponse);
  });

  it('throws NotFoundException when student does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws ConflictException when update email belongs to another student', async () => {
    const dto: UpdateStudentDto = {
      email: 'other@example.com',
    };

    repository.findById.mockResolvedValue(baseStudent);
    repository.findByEmail.mockResolvedValue(
      new StudentEntity({
        ...baseStudent,
        id: 'student-2',
        email: 'other@example.com',
      }),
    );

    await expect(service.update(baseStudent.id, dto)).rejects.toBeInstanceOf(ConflictException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('updates a student and returns ResponseDTO', async () => {
    const dto: UpdateStudentDto = {
      name: 'Updated Ivan',
    };
    const updatedStudent = new StudentEntity({
      ...baseStudent,
      name: 'Updated Ivan',
    });

    repository.findById.mockResolvedValue(baseStudent);
    repository.update.mockResolvedValue(updatedStudent);

    await expect(service.update(baseStudent.id, dto)).resolves.toEqual({
      ...baseResponse,
      name: 'Updated Ivan',
    });
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: baseStudent.id,
        name: 'Updated Ivan',
        age: baseStudent.age,
        email: baseStudent.email,
      }),
    );
  });

  it('removes an existing student', async () => {
    repository.findById.mockResolvedValue(baseStudent);
    repository.remove.mockResolvedValue(baseStudent);

    await expect(service.remove(baseStudent.id)).resolves.toEqual(baseResponse);
    expect(repository.remove).toHaveBeenCalledWith(baseStudent.id);
  });

  it('returns ResponseDTO list for findAll', async () => {
    repository.findAll.mockResolvedValue([baseStudent]);

    await expect(service.findAll()).resolves.toEqual([baseResponse]);
  });
});
