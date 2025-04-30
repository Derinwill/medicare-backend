import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { PatientLogController } from './patient_log.controller';
import { PatientLogService } from './patient_log.service';

@Module({
  controllers: [PatientLogController],
  providers: [PatientLogService, PrismaService, JwtService],
})
export class PatientLogModule {}