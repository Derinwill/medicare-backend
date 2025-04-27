import { AccessRole, RecordType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateMedicalRecordDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  condition: string;

  @IsString()
  @IsNotEmpty()
  note: string;
}

export class GrantAccessDto {
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsEnum(AccessRole)
  @IsNotEmpty()
  role: AccessRole;
}
