import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Guard para proteger rotas exclusivas de médicos
 * Verifica se o usuário autenticado tem tipo = 2 (médico)
 */
@Injectable()
export class MedicoGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Verificar se o usuário está autenticado e é médico (tipo = 2)
    if (!user || user.tipo !== 2) {
      throw new ForbiddenException('Acesso restrito apenas para médicos');
    }

    return true;
  }
}
