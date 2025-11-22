import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MedicoService } from './medico.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MedicoGuard } from './medico.guard';
import {
  AgendaMedicoQueryDto,
  CriarConsultaMedicoDto,
  CriarBloqueioDto,
  AtualizarConsultaMedicoDto,
  AtualizarDisponibilidadeDto,
  ConsultaMedicoResponseDto,
  HistoricoPacienteDto,
  DisponibilidadeDto,
  PacienteDto
} from './dto/medico.dto';

@ApiTags('medico')
@Controller('medico')
@UseGuards(JwtAuthGuard, MedicoGuard)
@ApiBearerAuth()
export class MedicoController {
  constructor(private medicoService: MedicoService) {}

  // Rotas GET sem parâmetros devem vir ANTES de rotas com parâmetros para evitar conflitos
  @Get('agenda')
  @ApiOperation({ summary: 'Buscar agenda do médico filtrada por período' })
  @ApiResponse({ status: 200, description: 'Lista de consultas e bloqueios do médico' })
  async getAgenda(
    @Query() query: AgendaMedicoQueryDto,
    @Request() req: any
  ): Promise<ConsultaMedicoResponseDto[]> {
    return this.medicoService.getAgendaMedico(req.user.userId, query);
  }

  @Get('disponibilidade')
  @ApiOperation({ summary: 'Buscar disponibilidade do médico' })
  @ApiResponse({ status: 200, description: 'Disponibilidade retornada com sucesso' })
  async getDisponibilidade(@Request() req: any): Promise<DisponibilidadeDto[]> {
    return this.medicoService.getDisponibilidade(req.user.userId);
  }

  @Get('pacientes')
  @ApiOperation({ summary: 'Buscar lista de pacientes com filtro' })
  @ApiResponse({ status: 200, description: 'Lista de pacientes retornada com sucesso' })
  async getPacientes(@Query('busca') busca?: string): Promise<PacienteDto[]> {
    return this.medicoService.getPacientes(busca);
  }

  @Get('convenios')
  @ApiOperation({ summary: 'Buscar convênios disponíveis para o médico' })
  @ApiResponse({ status: 200, description: 'Lista de convênios retornada com sucesso' })
  async getConvenios(@Request() req: any): Promise<any[]> {
    return this.medicoService.getConvenios(req.user.userId);
  }

  @Get('especialidades')
  @ApiOperation({ summary: 'Buscar especialidades do médico' })
  @ApiResponse({ status: 200, description: 'Lista de especialidades retornada com sucesso' })
  async getEspecialidades(@Request() req: any): Promise<any[]> {
    return this.medicoService.getEspecialidades(req.user.userId);
  }

  @Get('paciente/:id/historico')
  @ApiOperation({ summary: 'Buscar histórico de consultas de um paciente' })
  @ApiResponse({ status: 200, description: 'Histórico retornado com sucesso' })
  async getHistoricoPaciente(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<HistoricoPacienteDto> {
    return this.medicoService.getHistoricoPaciente(req.user.userId, parseInt(id));
  }

  @Post('consulta')
  @ApiOperation({ summary: 'Criar consulta manualmente' })
  @ApiResponse({ status: 201, description: 'Consulta criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou conflito de horário' })
  async criarConsulta(
    @Body() dto: CriarConsultaMedicoDto,
    @Request() req: any
  ): Promise<ConsultaMedicoResponseDto> {
    return this.medicoService.criarConsulta(req.user.userId, dto);
  }

  @Post('bloqueio')
  @ApiOperation({ summary: 'Criar bloqueio de horário' })
  @ApiResponse({ status: 201, description: 'Bloqueio criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou conflito de horário' })
  async criarBloqueio(
    @Body() dto: CriarBloqueioDto,
    @Request() req: any
  ): Promise<ConsultaMedicoResponseDto> {
    return this.medicoService.criarBloqueio(req.user.userId, dto);
  }

  @Put('consulta/:id')
  @ApiOperation({ summary: 'Atualizar consulta (observação e/ou status)' })
  @ApiResponse({ status: 200, description: 'Consulta atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou sem permissão' })
  @ApiResponse({ status: 404, description: 'Consulta não encontrada' })
  async atualizarConsulta(
    @Param('id') id: string,
    @Body() dto: AtualizarConsultaMedicoDto,
    @Request() req: any
  ): Promise<ConsultaMedicoResponseDto> {
    return this.medicoService.atualizarConsulta(req.user.userId, parseInt(id), dto);
  }

  @Put('disponibilidade')
  @ApiOperation({ summary: 'Atualizar disponibilidade do médico' })
  @ApiResponse({ status: 200, description: 'Disponibilidade atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async atualizarDisponibilidade(
    @Body() dto: AtualizarDisponibilidadeDto,
    @Request() req: any
  ): Promise<DisponibilidadeDto[]> {
    return this.medicoService.atualizarDisponibilidade(req.user.userId, dto);
  }

  @Delete('bloqueio/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar bloqueio de horário' })
  @ApiResponse({ status: 204, description: 'Bloqueio deletado com sucesso' })
  @ApiResponse({ status: 400, description: 'Não é possível deletar uma consulta normal' })
  @ApiResponse({ status: 404, description: 'Bloqueio não encontrado' })
  async deletarBloqueio(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<void> {
    return this.medicoService.deletarBloqueio(req.user.userId, parseInt(id));
  }
}
