import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QrCodeDocument = QrCode & Document;

@Schema()
export class QrCode {
  @Prop({ required: true, unique: true })
  data: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ required: true })
  expiresAt: Date;
}

export const QrCodeSchema = SchemaFactory.createForClass(QrCode);
