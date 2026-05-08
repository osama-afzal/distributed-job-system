import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('register')
    async register(@Body() data: RegisterDto): Promise<any> {
        const {email, password} = data

        return await this.authService.register(email, password)
    }

    @Post('login')
    async login(@Body() data: LoginDto): Promise<any> {
        const {email, password} = data

        return await this.authService.login(email, password)
    }
}
