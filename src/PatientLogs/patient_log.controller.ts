import { Controller, Get, UseGuards } from "@nestjs/common";
import { PatientLogService } from "./patient_log.service";
import { PatientGuard } from "src/auth/guards/patient.guard";
import { UserDecorator } from "src/auth/decorators/user.decorator";
import { User } from "src/utils/types";

@Controller()
export class PatientLog{
    constructor(private patientLogService:PatientLogService){}
    @Get('patient-logs')
    @UseGuards(PatientGuard)
    getAllPatientLogs(@UserDecorator() user: User){
        return this.patientLogService.getAllPatientLogs()
    }
}