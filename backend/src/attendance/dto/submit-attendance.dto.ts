import { IsString, IsNotEmpty } from 'class-validator';

export class SubmitAttendanceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  matricNumber: string;

  @IsString()
  @IsNotEmpty()
  qrCodeData: string;
}
