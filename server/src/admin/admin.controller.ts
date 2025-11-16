import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import {
  CreateEspecialidadeDto,
  UpdateEspecialidadeDto,
  EspecialidadeResponseDto,
  CreateConvenioDto,
  UpdateConvenioDto,
  ConvenioResponseDto,
  CreateMedicoDto,
  UpdateMedicoDto,
  MedicoResponseDto
} from './dto/admin.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ========== ESPECIALIDADES ==========

  @Get('especialidades')
  @ApiOperation({ summary: 'Buscar todas as especialidades' })
  @ApiResponse({ status: 200, description: 'Lista de especialidades retornada com sucesso.', type: [EspecialidadeResponseDto] })
  @ApiResponse({ status: 403, description: 'Acesso negado. Apenas administradores.' })
  async getEspecialidades(): Promise<EspecialidadeResponseDto[]> {
    return this.adminService.getEspecialidades();
  }

  @Post('especialidades')
  @ApiOperation({ summary: 'Criar nova especialidade' })
  @ApiResponse({ status: 201, description: 'Especialidade criada com sucesso.', type: EspecialidadeResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 403, description: 'Acesso negado. Apenas administradores.' })
  async createEspecialidade(@Body() dto: CreateEspecialidadeDto): Promise<EspecialidadeResponseDto> {
    return this.adminService.createEspecialidade(dto);
  }

  @Put('especialidades/:id')
  @ApiOperation({ summary: 'Atualizar especialidade' })
  @ApiResponse({ status: 200, description: 'Especialidade atualizada com sucesso.', type: EspecialidadeResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 404, description: 'Especialidade não encontrada.' })
  @ApiResponse({ status: 403, description: 'Acesso negado. Apenas administradores.' })
  async updateEspecialidade(
    @Param('id') id: string,
    @Body() dto: UpdateEspecialidadeDto
  ): Promise<EspecialidadeResponseDto> {
    return this.adminService.updateEspecialidade(parseInt(id), dto);
  }

  @Delete('especialidades/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar especialidade' })
  @ApiResponse({ status: 204, description: 'Especialidade deletada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Especialidade não encontrada.' })
  @ApiResponse({ status: 403, description: 'Acesso negado. Apenas administradores.' })
  async deleteEspecialidade(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteEspecialidade(parseInt(id));
  }

  // ========== CONVÊNIOS ==========

  @Get('convenios')
  @ApiOperation({ summary: 'Buscar todos os convênios' })
  @ApiResponse({ status: 200, description: 'Lista de convênios retornada com sucesso.', type: [ConvenioResponseDto] })
  @ApiResponse({ status: 403, description: 'Acesso negado. Apenas administradores.' })
  async getConvenios(): Promise<ConvenioResponseDto[]> {
    return this.adminService.getConvenios();
  }

  @Post('convenios')
  @ApiOperation({ summary: 'Criar novo convênio' })
  @ApiResponse({ status: 201, description: 'Convênio criado com sucesso.', type: ConvenioResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 403, description: 'Acesso negado. Apenas administradores.' })
  async createConvenio(@Body() dto: CreateConvenioDto): Promise<ConvenioResponseDto> {
    return this.adminService.createConvenio(dto);
  }

  @Put('convenios/:id')
  @ApiOperation({ summary: 'Atualizar convênio' })
  @ApiResponse({ status: 200, description: 'Convênio atualizado com sucesso.', type: ConvenioResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 404, description: 'Convênio não encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado. Apenas administradores.' })
  async updateConvenio(
    @Param('id') id: string,
    @Body() dto: UpdateConvenioDto
  ): Promise<ConvenioResponseDto> {
    return this.adminService.updateConvenio(parseInt(id), dto);
  }

  @Delete('convenios/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar convênio' })
  @ApiResponse({ status: 204, description: 'Convênio deletado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Convênio não encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado. Apenas administradores.' })
  async deleteConvenio(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteConvenio(parseInt(id));
  }

  // ========== MÉDICOS ==========

  @Get('medicos')
  @ApiOperation({ summary: 'Buscar todos os médicos com especialidades e convênios' })
  @ApiResponse({ status: 200, description: 'Lista de médicos retornada com sucesso.', type: [MedicoResponseDto] })
  @ApiResponse({ status: 403, description: 'Acesso negado. Apenas administradores.' })
  async getMedicos(): Promise<MedicoResponseDto[]> {
    return this.adminService.getMedicos();
  }

  @Get('medicos/:id')
  @ApiOperation({ summary: 'Buscar médico por ID com relacionamentos' })
  @ApiResponse({ status: 200, description: 'Médico encontrado com sucesso.', type: MedicoResponseDto })
  @ApiResponse({ status: 404, description: 'Médico não encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado. Apenas administradores.' })
  async getMedicoById(@Param('id') id: string): Promise<MedicoResponseDto> {
    return this.adminService.getMedicoById(parseInt(id));
  }

  @Post('medicos')
  @ApiOperation({ summary: 'Criar novo médico' })
  @ApiResponse({ status: 201, description: 'Médico criado com sucesso.', type: MedicoResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou médico deve ter pelo menos uma especialidade com convênio.' })
  @ApiResponse({ status: 403, description: 'Acesso negado. Apenas administradores.' })
  async createMedico(@Body() dto: CreateMedicoDto): Promise<MedicoResponseDto> {
    return this.adminService.createMedico(dto);
  }

  @Put('medicos/:id')
  @ApiOperation({ summary: 'Atualizar médico' })
  @ApiResponse({ status: 200, description: 'Médico atualizado com sucesso.', type: MedicoResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou médico deve ter pelo menos uma especialidade com convênio.' })
  @ApiResponse({ status: 404, description: 'Médico não encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado. Apenas administradores.' })
  async updateMedico(
    @Param('id') id: string,
    @Body() dto: UpdateMedicoDto
  ): Promise<MedicoResponseDto> {
    return this.adminService.updateMedico(parseInt(id), dto);
  }

  @Delete('medicos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar médico' })
  @ApiResponse({ status: 204, description: 'Médico deletado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Médico não encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado. Apenas administradores.' })
  async deleteMedico(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteMedico(parseInt(id));
  }
}