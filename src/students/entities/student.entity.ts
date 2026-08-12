import { StudentModel } from '../models/student.model';

// Response object returned by the controller to API clients.
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
