// admin.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateStudentDto } from './dto/create-student.dto'; // Add this
import { GenerateQrCodeDto } from './dto/generate-qr-code.dto';
import { UpdateStudentDto } from './dto/update-student.dto'; // Add this

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('qr-code')
  @UsePipes(new ValidationPipe())
  generateQrCode(@Body() generateQrCodeDto: GenerateQrCodeDto) {
    console.log('Creating qr-code')
    return this.adminService.generateQrCode(generateQrCodeDto);
  }

  @Get('attendance')
  getAttendance() {
      console.log("getting attendance endoints")
    return this.adminService.getAttendance();
  }

  @Get('students')
  getStudents() {
      console.log("getting students endpoints")
    return this.adminService.getStudents();
  }

  // ADD THESE NEW ENDPOINTS:
  @Post('students')
  @UsePipes(new ValidationPipe())
  createStudent(@Body() createStudentDto: CreateStudentDto) {
      console.log("getting studnets")
    return this.adminService.createStudent(createStudentDto);
  }

  @Put('students/:id')
  @UsePipes(new ValidationPipe())
  updateStudent(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto
  ) {
    console.log("getting students by id")
    return this.adminService.updateStudent(id, updateStudentDto);
  }

  @Delete('students/:id')
  deleteStudent(@Param('id') id: string) {
    return this.adminService.deleteStudent(id);
  }

  @Delete('attendance/:id')
  deleteAttendance(@Param('id') id: string) {
    return this.adminService.deleteAttendance(id);
  }
}