import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  login: string; // pode ser CPF ou email

  @IsString()
  @IsNotEmpty()
  senha: string;
}

export class AuthResponseDto {
  access_token: string;
  user: {
    id: number;
    nome: string;
    tipo: number;
    nomeTipo: string;
  };
}