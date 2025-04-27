import { Injectable, Logger } from '@nestjs/common';
import { SignInDto, SignupDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from 'src/typings/enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/utils/types';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = 10;
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async create(signupDto: SignupDto) {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    //check if user exists by email
    const user = await this.prisma.user.findUnique({
      where: { email: signupDto.email },
    });

    console.log('log', user);
    if (user) {
      throw new Error('Email already exists');
    }
    let currentUser;
    const newPassword = await bcrypt.hash(signupDto.password, this.saltRounds);
    const uniqId = await this.generateUnique4DigitId();
    signupDto.password = newPassword;
    switch (signupDto.userType) {
      case Role.PATIENT:
        currentUser = await this.prisma.user.create({
          data: {
            email: signupDto.email,
            password: signupDto.password,
            role: signupDto.userType,
            gender: signupDto.gender,
            patient: {
              create: {
                name: `${signupDto.firstName} ${signupDto.lastName}`,
                uniqId: String(uniqId),
                dob: signupDto.dob || undefined,
                address: signupDto.address || undefined,
              },
            },
          },
        });
        break;
      case Role.DOCTOR:
        currentUser = await this.prisma.user.create({
          data: {
            email: signupDto.email,
            password: signupDto.password,
            role: signupDto.userType,
            gender: signupDto.gender,
            doctor: {
              create: {
                name: `${signupDto.firstName} ${signupDto.lastName}`,
                speciality: signupDto.speciality || undefined,
                hospital_name: signupDto.hospitalName,
              },
            },
          },
        });
        break;
      default:
        throw new Error('Invalid user type');
    }
    console.log('Loaded JWT_SECRET:', jwtSecret);
    const token = this.jwtService.sign(currentUser, { secret: jwtSecret });
    return {
      message: 'success',
      user: currentUser,
      accessToken: token,
    };
  }
  async generateUnique4DigitId() {
    let unique = false;
    let uniqId;

    while (!unique) {
      uniqId = Math.floor(1000 + Math.random() * 9000); // generates a 4-digit number between 1000–9999
      const existingUser = await this.prisma.patient.findFirst({
        where: { uniqId: String(uniqId) as string },
      });
      if (!existingUser) {
        unique = true;
      }
    }

    return uniqId;
  }

  async signIn(signinDto: SignInDto) {
    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const user = await this.prisma.user.findUnique({
        where: { email: signinDto.email },
      });

      if (!user) {
        throw new Error('Invalid email');
      }

      const isPasswordTheSame = await bcrypt.compare(
        signinDto.password,
        user.password,
      );

      if (!isPasswordTheSame) {
        throw new Error('Invalid Password');
      }

      const accessToken = this.jwtService.sign(user, { secret: jwtSecret });

      return {
        message: 'success',
        user,
        accessToken: accessToken,
      };
    } catch (err) {
      this.logger.error(`${err.message}`);
      throw new Error(err.message);
    }
  }

  async me(user: User) {
    try {
      const selectedUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: {
          patient: true,
          doctor: true,
        },
      });

      return selectedUser;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async updateUserProfile(
    user: User,
    userType: Role,
    body: Omit<Partial<SignupDto>, 'password'>,
  ) {
    console.log('Updating', body);
    try {
      switch (userType) {
        case Role.PATIENT:
          await this.prisma.user.update({
            where: { id: user.id },
            data: {
              email: body.email || undefined,
              gender: body.gender || undefined,
              patient: {
                update: {
                  name: `${body.firstName} ${body.lastName}`,
                  dob: body.dob || undefined,
                  address: body.address || undefined,
                },
              },
            },
          });
          break;
        case Role.DOCTOR:
          await this.prisma.user.update({
            where: { id: user.id },
            data: {
              email: body.email || undefined,

              role: body.userType || undefined,
              gender: body.gender || undefined,
              doctor: {
                update: {
                  name: `${body.firstName} ${body.lastName}`,
                  speciality: body.speciality || undefined,
                  hospital_name: body.hospitalName || undefined,
                },
              },
            },
          });
          break;
        default:
          throw new Error('Invalid user type');
      }
    } catch (error) {
      throw new Error(`Error updating user profile, ${error}`);
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
