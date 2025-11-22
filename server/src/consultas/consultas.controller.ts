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
  HttpStatus,
  BadRequestException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ConsultasService } from './consultas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { 
  CreateConsultaDto, 
  UpdateConsultaDto, 
  HorariosDisponiveisDto,
  ConsultaResponseDto,
  HorarioSlotDto,
  EspecialidadeDto,
  MedicoDto,
  ConvenioDto,
  UpdateStatusConsultaDto
} from './dto/consultas.dto';

@ApiTags('consultas')
@Controller('consultas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConsultasController {
  constructor(private consultasService: ConsultasService) {}

  @Get('especialidades')
  @ApiOperation({ summary: 'Buscar todas as especialidades disponíveis' })
  @ApiResponse({ status: 200, description: 'Lista de especialidades retornada com sucesso.' })
  async getEspecialidades(): Promise<EspecialidadeDto[]> {
    return this.consultasService.getEspecialidades();
  }

  @Get('especialidades/:id/medicos')
  @ApiOperation({ summary: 'Buscar médicos por especialidade' })
  @ApiResponse({ status: 200, description: 'Lista de médicos retornada com sucesso.' })
  async getMedicosByEspecialidade(@Param('id') especialidadeId: string): Promise<MedicoDto[]> {
    return this.consultasService.getMedicosByEspecialidade(parseInt(especialidadeId));
  }

  @Get('medicos/:medicoId/especialidades/:especialidadeId/convenios')
  @ApiOperation({ summary: 'Buscar convênios por médico e especialidade' })
  @ApiResponse({ status: 200, description: 'Lista de convênios retornada com sucesso.' })
  async getConveniosByMedicoEspecialidade(
    @Param('medicoId') medicoId: string,
    @Param('especialidadeId') especialidadeId: string
  ): Promise<ConvenioDto[]> {
    return this.consultasService.getConveniosByMedicoEspecialidade(
      parseInt(medicoId), 
      parseInt(especialidadeId)
    );
  }

  @Get('medicos/:id/calendario')
  @ApiOperation({ summary: 'Buscar dias habilitados para um médico em um mês' })
  @ApiResponse({ status: 200, description: 'Lista de dias habilitados retornada com sucesso.' })
  async getDiasHabilitados(
    @Param('id') medicoId: string,
    @Query('ano') ano: string,
    @Query('mes') mes: string
  ): Promise<{ dias: number[] }> {
    const dias = await this.consultasService.getDiasHabilitados(
      parseInt(medicoId),
      parseInt(ano),
      parseInt(mes)
    );
    return { dias };
  }

  @Post('horarios-disponiveis')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calcular horários disponíveis para uma data específica' })
  @ApiResponse({ status: 200, description: 'Horários disponíveis calculados com sucesso.' })
  async calcularHorariosDisponiveis(@Body() dto: HorariosDisponiveisDto): Promise<HorarioSlotDto[]> {
    return this.consultasService.calcularHorariosDisponiveis(dto);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova consulta' })
  @ApiResponse({ status: 201, description: 'Consulta criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou horário indisponível.' })
  async criarConsulta(
    @Body() createConsultaDto: CreateConsultaDto,
    @Request() req: any
  ): Promise<ConsultaResponseDto> {
    return this.consultasService.criarConsulta(createConsultaDto, req.user.userId);
  }

  @Get('minhas')
  @ApiOperation({ summary: 'Buscar consultas do usuário logado' })
  @ApiResponse({ status: 200, description: 'Lista de consultas retornada com sucesso.' })
  async getMinhasConsultas(@Request() req: any): Promise<ConsultaResponseDto[]> {
    return this.consultasService.getConsultasPacienteComProcessamento(req.user.userId);
  }

  @Post('processar-vencidas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Processar consultas vencidas e marcar como falta' })
  @ApiResponse({ status: 200, description: 'Consultas vencidas processadas com sucesso.' })
  async processarConsultasVencidas(): Promise<{ message: string }> {
    await this.consultasService.processarConsultasVencidas();
    return { message: 'Consultas vencidas processadas com sucesso' };
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Atualizar status da consulta (médicos e administradores)' })
  @ApiResponse({ status: 200, description: 'Status da consulta atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou sem permissão.' })
  @ApiResponse({ status: 404, description: 'Consulta não encontrada.' })
  async atualizarStatusConsulta(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusConsultaDto,
    @Request() req: any
  ): Promise<ConsultaResponseDto> {
    return this.consultasService.atualizarStatusConsulta(
      parseInt(id),
      updateStatusDto.status,
      req.user.userId,
      req.user.tipo
    );
  }

  @Get('medico/minhas')
  @ApiOperation({ summary: 'Buscar consultas do médico logado' })
  @ApiResponse({ status: 200, description: 'Lista de consultas do médico retornada com sucesso.' })
  async getConsultasMedico(@Request() req: any): Promise<ConsultaResponseDto[]> {
    // Verificar se o usuário é médico
    if (req.user.tipo !== 2) {
      throw new BadRequestException('Endpoint disponível apenas para médicos');
    }
    return this.consultasService.getConsultasMedico(req.user.userId);
  }

  @Get('debug/dados')
  @ApiOperation({ summary: 'Debug - verificar dados do banco' })
  async debugDados(): Promise<any> {
    const especialidades = await this.consultasService.getEspecialidades();
    const medicos = await this.consultasService.getMedicosByEspecialidade(1);
    const convenios = await this.consultasService.getConveniosByMedicoEspecialidade(1, 1);
    
    return {
      especialidades: especialidades.length,
      medicos: medicos.length,
      convenios: convenios.length,
      especialidadesData: especialidades,
      medicosData: medicos,
      conveniosData: convenios
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar consulta por ID' })
  @ApiResponse({ status: 200, description: 'Consulta encontrada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Consulta não encontrada.' })
  async getConsultaById(@Param('id') id: string): Promise<ConsultaResponseDto> {
    return this.consultasService.getConsultaById(parseInt(id));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar consulta' })
  @ApiResponse({ status: 200, description: 'Consulta atualizada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou sem permissão.' })
  @ApiResponse({ status: 404, description: 'Consulta não encontrada.' })
  async atualizarConsulta(
    @Param('id') id: string,
    @Body() updateConsultaDto: UpdateConsultaDto,
    @Request() req: any
  ): Promise<ConsultaResponseDto> {
    return this.consultasService.atualizarConsulta(
      parseInt(id), 
      updateConsultaDto, 
      req.user.userId
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar consulta' })
  @ApiResponse({ status: 204, description: 'Consulta cancelada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Sem permissão ou prazo insuficiente.' })
  @ApiResponse({ status: 404, description: 'Consulta não encontrada.' })
  async cancelarConsulta(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<void> {
    return this.consultasService.cancelarConsulta(parseInt(id), req.user.userId);
  }
}