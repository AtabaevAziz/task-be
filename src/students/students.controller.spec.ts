import { Test } from '@nestjs/testing';

import { CreateStudentDto } from './dto/create-student.dto';
import { StudentResponseDto } from './dto/student-response.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

describe('StudentsController', () => {
  let controller: StudentsController;
  const responseDto: StudentResponseDto = {
    id: 'student-1',
    name: 'Ivan',
    age: 20,
    email: 'ivan@example.com',
    createdAt: new Date('2026-08-12T10:00:00.000Z'),
  };

  const studentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        {
          provide: StudentsService,
          useValue: studentsService,
        },
      ],
    }).compile();

    controller = moduleRef.get(StudentsController);
    jest.clearAllMocks();
  });

  it('delegates create to the service', async () => {
    const dto: CreateStudentDto = {
      name: 'Ivan',
      age: 20,
      email: 'ivan@example.com',
    };

    studentsService.create.mockResolvedValue(responseDto);

    await expect(controller.create(dto)).resolves.toEqual(responseDto);

    expect(studentsService.create).toHaveBeenCalledWith(dto);
  });

  it('delegates findAll to the service', async () => {
    studentsService.findAll.mockResolvedValue([responseDto]);

    await expect(controller.findAll()).resolves.toEqual([responseDto]);

    expect(studentsService.findAll).toHaveBeenCalled();
  });

  it('delegates findOne to the service', async () => {
    studentsService.findOne.mockResolvedValue(responseDto);

    await expect(controller.findOne('student-1')).resolves.toEqual(responseDto);

    expect(studentsService.findOne).toHaveBeenCalledWith('student-1');
  });

  it('delegates update to the service', async () => {
    const dto: UpdateStudentDto = { name: 'Updated Ivan' };

    studentsService.update.mockResolvedValue({
      ...responseDto,
      name: 'Updated Ivan',
    });

    await expect(controller.update('student-1', dto)).resolves.toEqual({
      ...responseDto,
      name: 'Updated Ivan',
    });

    expect(studentsService.update).toHaveBeenCalledWith('student-1', dto);
  });

  it('delegates remove to the service', async () => {
    studentsService.remove.mockResolvedValue(responseDto);

    await expect(controller.remove('student-1')).resolves.toEqual(responseDto);

    expect(studentsService.remove).toHaveBeenCalledWith('student-1');
  });
});
