import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { MedicalRecordService } from './medical_record.service';
import {
  CreateMedicalRecordDto,
  GrantAccessDto,
} from './dto/create-medical_record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical_record.dto';
import { DoctorGuard } from 'src/auth/guards/doctor.guard';
import { UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/utils/types';
import { PatientGuard } from 'src/auth/guards/patient.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('medical-record')
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Post()
  @UseGuards(DoctorGuard)
  create(
    @Body() createMedicalRecordDto: CreateMedicalRecordDto,
    @UserDecorator() user: User,
  ) {
    return this.medicalRecordService.create(createMedicalRecordDto, user);
  }

  @Get('patients')
  @UseGuards(DoctorGuard)
  getPatient(@UserDecorator() user: User) {
    return this.medicalRecordService.getPatient(user);
  }

  @Get('doctors')
  @UseGuards(PatientGuard)
  getAllDoctors(@UserDecorator() user: User) {
    return this.medicalRecordService.getAllDoctors();
  }

  @Post('grant-access')
  @UseGuards(PatientGuard)
  grantAccess(@Body() body: GrantAccessDto, @UserDecorator() user: User) {
    return this.medicalRecordService.grantAccessToDoctor(user, body);
  }
  @Get()
  @UseGuards(AuthGuard)
  findAll(@UserDecorator() user: User) {
    return this.medicalRecordService.findAll(user);
  }

  @Get('search')
  @UseGuards(DoctorGuard)
  findPatientRecord(
    @UserDecorator() user: User,
    @Query() query: Record<string, unknown>,
  ) {
    return this.medicalRecordService.findPatientRecord(user, query);
  }

  @Get('all-doctor')
  @UseGuards(PatientGuard)
  findAllDoctorsAccess(@UserDecorator() user: User) {
    return this.medicalRecordService.findAllDoctorsAccess(user);
  }

  @Put('revoke')
  @UseGuards(PatientGuard)
  revokeAccess(
    @UserDecorator() user: User,
    @Body() body: { doctorId: string },
  ) {
    return this.medicalRecordService.revokeAccess(user, body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
  ) {
    return this.medicalRecordService.update(+id, updateMedicalRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicalRecordService.remove(+id);
  }
}
