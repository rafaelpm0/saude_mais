import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Verificar se o usuário está autenticado e é administrador (tipo 3)
    if (!user || user.tipo !== 3) {
      throw new ForbiddenException('Acesso negado. Apenas administradores podem acessar esta funcionalidade.');
    }

    return true;
  }
}