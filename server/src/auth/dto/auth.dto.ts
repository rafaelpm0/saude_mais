import { IsString, IsNotEmpty, IsEmail, IsInt, Min, Max, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  login: string; // pode ser CPF ou email

  @IsString()
  @IsNotEmpty()
  senha: string;
}

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsNotEmpty()
  @IsString()
  cpf: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  telefone: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 20)
  senha: string;

  @IsInt()
  @Min(1)
  @Max(3)
  tipo: number;
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

export class RegisterResponseDto {
  message: string;
  id: number;
}