import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define StudentDocument to explicitly include _id as a string
export interface StudentDocument extends Document {
  _id: string; // Explicitly define _id as string
  name: string;
  matricNumber: string;
}

@Schema()
export class Student {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  matricNumber: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
