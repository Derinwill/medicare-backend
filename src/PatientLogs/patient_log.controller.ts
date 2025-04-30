import { Controller, Get, UseGuards } from "@nestjs/common";
import { PatientLogService } from "./patient_log.service";
import { PatientGuard } from "src/auth/guards/patient.guard";

@Controller()
export class PatientLog{
    constructor(private patientLogService:PatientLogService){}
    @Get('patient-logs')
    @UseGuards(PatientGuard)
    getAllPatientLogs(){
        this.patientLogService.getAllPatientLogs()
    }
}