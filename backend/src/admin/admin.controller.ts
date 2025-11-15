import { Controller, Post, Body, UsePipes, ValidationPipe, Get, Delete, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { GenerateQrCodeDto } from './dto/generate-qr-code.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('qr-code')
  @UsePipes(new ValidationPipe())
  generateQrCode(@Body() generateQrCodeDto: GenerateQrCodeDto) {
    return this.adminService.generateQrCode(generateQrCodeDto);
  }

  @Get('attendance')
  getAttendance() {
    return this.adminService.getAttendance();
  }

  @Get('students') // New endpoint
  getStudents() {
    return this.adminService.getStudents();
  }

  @Delete('attendance/:id')
  deleteAttendance(@Param('id') id: string) {
    return this.adminService.deleteAttendance(id);
  }
}