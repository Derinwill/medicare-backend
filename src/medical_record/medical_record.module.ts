import { Module } from '@nestjs/common';
import { MedicalRecordService } from './medical_record.service';
import { MedicalRecordController } from './medical_record.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [MedicalRecordController],
  providers: [MedicalRecordService, PrismaService, JwtService],
})
export class MedicalRecordModule {}
