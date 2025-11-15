import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { SubmitAttendanceDto } from './dto/submit-attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  submitAttendance(@Body() submitAttendanceDto: SubmitAttendanceDto) {
    return this.attendanceService.submitAttendance(submitAttendanceDto);
  }
}