import { GenderEnum, Role } from 'src/typings/enum';

export class User {
  id: string;
  email: string;
  password: string;
  role: Role;
  gender: GenderEnum;
  patient?: {
    name: string;
    dob: string;
    address: string;
  };

  doctor?: {
    name: string;
    speciality: string;
  };
}
