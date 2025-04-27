import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateMedicalRecordDto,
  GrantAccessDto,
} from './dto/create-medical_record.dto';

import { UpdateMedicalRecordDto } from './dto/update-medical_record.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/utils/types';
import { Role } from 'src/typings/enum';
import { LogsRecord, LogsAction } from '@prisma/client';

@Injectable()
export class MedicalRecordService {
  constructor(private prisma: PrismaService) {}
  async create(createMedicalRecordDto: CreateMedicalRecordDto, user: User) {
    try {
      const getDoctorData = await this.prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          doctor: true,
        },
      });

      if (!getDoctorData) {
        throw new HttpException(
          'Does not have a corresponding doctor profile',
          400,
        );
      }

      //Check if doctor has access to create medical record for patient
      const checkIfDoctorHasAccessToPatient =
        await this.prisma.patientDoctorPermission.findFirst({
          where: {
            doctorId: getDoctorData.doctor.id,
            patientId: createMedicalRecordDto.patientId,
          },
        });

      if (!checkIfDoctorHasAccessToPatient) {
        throw new UnauthorizedException(
          'You dont have access to create medical record for this patient',
        );
      }

      const medicalRecordData = {
        doctorId: getDoctorData.doctor.id,
        patientId: String(createMedicalRecordDto.patientId),
        note: createMedicalRecordDto.note,
        condition: createMedicalRecordDto.condition,
      };
      await this.prisma.medicalRecord.create({
        data: medicalRecordData,
      });

      this.recordLogs(
        createMedicalRecordDto.patientId,
        getDoctorData.doctor.id,
        LogsAction.CREATE_MEDICAL_RECORD,
      );
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async getAllDoctors() {
    try {
      const allDoctors = await this.prisma.doctor.findMany({});
      return allDoctors;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async grantAccessToDoctor(user: User, dto: GrantAccessDto) {
    try {
      const getPatientData = await this.prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          patient: true,
        },
      });
      console.log('log', getPatientData);
      await Promise.all([getPatientData]);

      if (!getPatientData) {
        throw new HttpException('User does not have a patient profile', 400);
      }

      //check if access is already granted
      const checkIfUserHasGrantedAccess =
        await this.prisma.patientDoctorPermission.findFirst({
          where: {
            doctorId: dto.doctorId,
            patientId: getPatientData.patient.id,
          },
        });

      if (checkIfUserHasGrantedAccess) {
        throw new HttpException('Already granted Access', 400);
      }
      await this.prisma.patientDoctorPermission.create({
        data: {
          patientId: getPatientData.patient.id as string,
          role: dto.role,
          doctorId: dto.doctorId,
        },
      });

      this.recordLogs(
        getPatientData.patient.id,
        dto.doctorId,
        LogsAction.GRANTED_ACCESS,
      );
    } catch (error) {
      throw new HttpException(
        `An error occured while granting accessToDoctor ${error}`,
        400,
      );
    }
  }

  async getPatient(user: User) {
    try {
      const getDoctorData = await this.prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          doctor: true,
        },
      });
      console.log('log', getDoctorData);
      await Promise.all([getDoctorData]);

      const allPatient = await this.prisma.patientDoctorPermission.findMany({
        where: {
          doctorId: getDoctorData.doctor.id,
        },
        select: {
          patientId: true,
          doctorId: true,
          role: true,
          doctor: true,
          patient: true,
        },
      });

      return allPatient;
    } catch (error) {
      console.error('An error occured while getting patient', error);
      throw new HttpException(error, 400);
    }
  }

  async findAll(user: User) {
    try {
      if (user.role === Role.DOCTOR) {
        const getDoctorData = await this.prisma.user.findUnique({
          where: {
            id: user.id,
          },
          select: {
            doctor: true,
          },
        });

        await Promise.all([getDoctorData]);

        if (!getDoctorData) {
          throw new HttpException('User doesnt have a doctor profile', 400);
        }
        const records = await this.prisma.medicalRecord.findMany({
          where: {
            doctorId: getDoctorData.doctor.id,
          },
          select: {
            patient: true,
            condition: true,
            createdAt: true,
            note: true,
          },
        });

        return records;
      } else if (user.role === Role.PATIENT) {
        const getPatientData = await this.prisma.user.findUnique({
          where: {
            id: user.id,
          },
          select: {
            patient: true,
          },
        });

        await Promise.all([getPatientData]);

        if (!getPatientData) {
          throw new HttpException('User doesnt have a patient profile', 400);
        }

        const records = await this.prisma.medicalRecord.findMany({
          where: {
            patientId: getPatientData.patient.id,
          },
          select: {
            doctor: true,
            condition: true,
            createdAt: true,
            note: true,
          },
        });

        return records;
      }
    } catch (error) {
      throw new HttpException(
        `An error occured while getting records ${error}`,
        400,
      );
    }
  }

  async recordLogs(patientId: string, createdBy: string, action: LogsAction) {
    try {
      const record = {
        patientId: patientId,
        createdBy,
        action,
      };
      await this.prisma.logsRecord.create({
        data: record,
      });
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async findPatientRecord(user: User, query: Record<string, unknown>) {
    try {
      if (!query) {
        throw new Error('Invalid Query');
      }

      if (query && query.uniqId) {
        const getDoctorData = await this.prisma.user.findUnique({
          where: {
            id: user.id,
          },
          select: {
            doctor: true,
          },
        });

        const patientRecords = await this.prisma.patient.findFirst({
          where: {
            uniqId: query.uniqId,
          },
          select: {
            name: true,
            id: true,
            uniqId: true,
            user: true,
            dob: true,
            address: true,
            records: true,
          },
        });
        const doctorHaveAccessToViewPatientRecord =
          await this.prisma.patientDoctorPermission.findFirst({
            where: {
              doctorId: getDoctorData.doctor.id,
              patientId: patientRecords.id,
            },
          });

        if (!doctorHaveAccessToViewPatientRecord) {
          throw new Error('Doctor dont have access to patient profile');
        }

        return patientRecords;
      }
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async findAllDoctorsAccess(user: User) {
    try {
      const getPatientData = await this.prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          patient: true,
        },
      });
      const allPermission = await this.prisma.patientDoctorPermission.findMany({
        where: {
          patientId: getPatientData.patient.id,
        },
        select: {
          patientId: true,
          doctorId: true,
          role: true,
          id: true,
          doctor: true,
          patient: true,
        },
      });
      return allPermission;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async revokeAccess(user: User, body: { doctorId: string }) {
    const getPatientData = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        patient: true,
      },
    });
    await this.prisma.patientDoctorPermission.deleteMany({
      where: {
        doctorId: body.doctorId as string,
        patientId: getPatientData.patient.id,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} medicalRecord`;
  }

  update(id: number, updateMedicalRecordDto: UpdateMedicalRecordDto) {
    return `This action updates a #${id} medicalRecord`;
  }

  remove(id: number) {
    return `This action removes a #${id} medicalRecord`;
  }
}
