import { StudentModel } from '../models/student.model';

export class StudentEntity {
  id!: string;
  name!: string;
  age!: number;
  email!: string;
  createdAt!: Date;

  constructor(model: StudentModel) {
    Object.assign(this, model);
  }
}

