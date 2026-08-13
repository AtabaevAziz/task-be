export class StudentEntity {
  id!: string;
  name!: string;
  age!: number;
  email!: string;
  createdAt!: Date;

  constructor(data: Partial<StudentEntity> = {}) {
    Object.assign(this, data);
  }
}
