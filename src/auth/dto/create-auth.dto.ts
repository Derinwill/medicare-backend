import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GenderEnum, Role } from 'src/typings/enum';

export class SignInDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class SignupDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsEnum(GenderEnum)
  @IsString()
  gender: GenderEnum;

  @IsEnum(Role)
  @IsNotEmpty()
  userType: Role;

  @IsOptional()
  @IsString()
  dob: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  speciality: string;

  @IsOptional()
  @IsString()
  hospitalName: string;
}
