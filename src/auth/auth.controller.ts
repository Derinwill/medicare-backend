import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignupDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UserDecorator } from './decorators/user.decorator';
import { User } from 'src/utils/types';
import { AuthGuard } from './guards/auth.guard';
import { Role } from 'src/typings/enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() signupDto: SignupDto) {
    return this.authService.create(signupDto);
  }

  @Post('login')
  signIn(@Body() signinDto: SignInDto) {
    console.log('log', signinDto);
    return this.authService.signIn(signinDto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@UserDecorator() user: User) {
    return this.authService.me(user);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Put('me')
  @UseGuards(AuthGuard)
  updateDoctorProfile(
    @UserDecorator() user: User,
    @Body()
    body: Omit<Partial<SignInDto>, 'password'>,
  ) {
    return this.authService.updateUserProfile(user, Role.DOCTOR, body);
  }

  updateUserProfile(
    @UserDecorator() user: User,
    @Body()
    body: Omit<Partial<SignInDto>, 'password'>,
  ) {
    return this.authService.updateUserProfile(user, Role.PATIENT, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
