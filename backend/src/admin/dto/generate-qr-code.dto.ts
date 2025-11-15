import { IsInt, IsNotEmpty } from 'class-validator';

export class GenerateQrCodeDto {
  @IsInt()
  @IsNotEmpty()
  expiresIn: number;
}
