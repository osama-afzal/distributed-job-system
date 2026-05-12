import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    status: 201,
    description: 'User created',
    schema: {
      example: {
        email: 'username@example.com',
        createdAt: '01/01/2026 00:00',
      },
    },
  })
  @Post('register')
  async register(@Body() data: RegisterDto): Promise<any> {
    const { email, password } = data;

    return await this.authService.register(email, password);
  }

  @ApiResponse({
    status: 201,
    description: 'User logged in',
    schema: {
      example: {
        access_token: 'exmaple_token',
      },
    },
  })
  @Post('login')
  async login(@Body() data: LoginDto): Promise<any> {
    const { email, password } = data;

    return await this.authService.login(email, password);
  }
}
