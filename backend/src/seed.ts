import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Student } from './schemas/student.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const studentModel: Model<Student> = app.get(getModelToken(Student.name));

  const students = [
    { name: 'John Doe', matricNumber: '1001' },
    { name: 'Jane Smith', matricNumber: '1002' },
    { name: 'Peter Jones', matricNumber: '1003' },
  ];

  for (const student of students) {
    await studentModel.findOneAndUpdate(
      { matricNumber: student.matricNumber },
      student,
      { upsert: true, new: true },
    );
  }

  console.log('Student data seeded successfully!');

  await app.close();
}
bootstrap();
