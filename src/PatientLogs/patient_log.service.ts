import { HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { User } from "src/utils/types";

@Injectable()
export class PatientLogService{
    constructor(private prisma: PrismaService){

    }
    async getAllPatientLogs(user: User){
        try {
            const getPatientData = await this.prisma.user.findUnique({
                where: {
                  id: user.id,
                },
                select: {
                  patient: true,
                },
              });
        const logsData =  this.prisma.logsRecord.findMany({
                where:{
                    patientId: getPatientData.patient.id
                }
            }) 

            return logsData;
        } catch (error) {
            throw new HttpException('Unable to fetch logs at this time', 400)
        }
      
    }
}