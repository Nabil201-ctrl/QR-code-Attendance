import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import type { StudentDocument } from './student.schema'; // Change this line

export type AttendanceDocument = Attendance & Document;

@Schema()
export class Attendance {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true })
  student: StudentDocument;

  @Prop({ required: true })
  date: Date;

  @Prop({ default: false })
  present: boolean;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
