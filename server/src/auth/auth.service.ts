import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto, AuthResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { login, senha } = loginDto;

    // Buscar usuário por CPF ou email
    const user = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { cpf: login },
          { email: login },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Determinar nome do tipo
    const getTipoNome = (tipo: number): string => {
      switch (tipo) {
        case 1: return 'Paciente';
        case 2: return 'Médico(a)';
        case 3: return 'Administrador(a)';
        default: return 'Usuário';
      }
    };

    const nomeTipo = getTipoNome(user.tipo);

    // Gerar JWT
    const payload = { 
      sub: user.id, 
      nome: user.nome, 
      tipo: user.tipo, 
      nomeTipo 
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        nome: user.nome,
        tipo: user.tipo,
        nomeTipo,
      },
    };
  }

  async validateUser(userId: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, nome: true, email: true, cpf: true },
    });

    return user;
  }
}