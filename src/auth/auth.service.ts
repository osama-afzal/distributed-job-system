import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async register(email: string, password: string): Promise<any> {
        const hashedPass = await bcrypt.hash(password, 10)

        const existingUser = await this.prismaService.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new BadRequestException('Email already exists')
        }

        const user = await this.prismaService.user.create({
            data: {
                email,
                password: hashedPass
            }
        })

        return {
            email: user.email,
            createdAt: user.createdAt
        }
    }

    async login(email: string, password: string): Promise<any> {
        const user = await this.prismaService.user.findUnique({
            where: { email }
        })

        if (!user) {
            throw new UnauthorizedException('Invalid credentials')
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid credentials')
        }

        const payload = {
            sub: user.id,
            email: user.email
        }

        return {
            access_token: await this.jwtService.signAsync(payload)
        }
    }
}
