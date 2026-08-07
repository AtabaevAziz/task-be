import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [PrismaModule, StudentsModule],
})
export class AppModule {}

