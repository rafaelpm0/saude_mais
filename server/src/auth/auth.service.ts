import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto, AuthResponseDto, RegisterDto, RegisterResponseDto } from './dto/auth.dto';

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

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const { nome, cpf, email, telefone, senha, tipo } = registerDto;

    // Verificar se já existe usuário com esse CPF ou email
    const existingUser = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { cpf: cpf },
          { email: email },
        ],
      },
    });

    if (existingUser) {
      throw new BadRequestException('Usuário já existe com este CPF ou email');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Criar usuário
    const user = await this.prisma.usuario.create({
      data: {
        nome,
        cpf,
        email,
        telefone,
        senha: hashedPassword,
        tipo,
        login: cpf, // usando CPF como login
        crm: tipo === 2 ? '' : null, // apenas médicos têm CRM
        faltasConsecutivas: tipo === 1 ? 0 : 0, // apenas pacientes têm faltas
      },
    });

    return {
      message: 'Usuário cadastrado com sucesso',
      id: user.id,
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