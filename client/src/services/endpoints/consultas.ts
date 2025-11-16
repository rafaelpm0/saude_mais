import { api } from '../api';

// Interfaces
export interface Especialidade {
  id: number;
  descricao: string;
}

export interface Medico {
  id: number;
  nome: string;
  crm: string;
  especialidades: {
    id: number;
    descricao: string;
    tempoConsulta: number;
  }[];
}

export interface Convenio {
  id: number;
  nome: string;
}

export interface HorarioSlot {
  hora: string;
  disponivel: boolean;
  ocupadoPor?: string;
}

export interface CreateConsultaRequest {
  idMedico: number;
  idEspecialidade: number;
  idConvenio: number;
  dataHora: string;
  observacao?: string;
}

export interface UpdateConsultaRequest {
  dataHora?: string;
  observacao?: string;
  status?: string;
}

export interface HorariosDisponiveisRequest {
  idMedico: number;
  idEspecialidade: number;
  data: string;
}

export interface ConsultaResponse {
  id: number;
  agenda: {
    id: number;
    dtaInicial: string;
    dtaFinal: string;
    status: string;
    medico: {
      id: number;
      nome: string;
      crm: string;
    };
    cliente: {
      id: number;
      nome: string;
    };
  };
  convenio: {
    id: number;
    nome: string;
  };
  especialidade?: {
    id: number;
    descricao: string;
  };
  observacao?: string;
  status: string;
}

export interface DiasHabilitados {
  dias: number[];
}

// API Endpoints
export const consultasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Buscar especialidades
    getEspecialidades: builder.query<Especialidade[], void>({
      query: () => 'consultas/especialidades',
      providesTags: ['Especialidade'],
    }),

    // Buscar médicos por especialidade
    getMedicosByEspecialidade: builder.query<Medico[], number>({
      query: (especialidadeId) => `consultas/especialidades/${especialidadeId}/medicos`,
      providesTags: (result, error, especialidadeId) => [
        { type: 'Medico', id: especialidadeId }
      ],
    }),

    // Buscar convênios por médico e especialidade
    getConveniosByMedicoEspecialidade: builder.query<Convenio[], { medicoId: number; especialidadeId: number }>({
      query: ({ medicoId, especialidadeId }) => 
        `consultas/medicos/${medicoId}/especialidades/${especialidadeId}/convenios`,
      providesTags: (result, error, { medicoId, especialidadeId }) => [
        { type: 'Convenio', id: `${medicoId}-${especialidadeId}` }
      ],
    }),

    // Buscar dias habilitados no calendário
    getDiasHabilitados: builder.query<DiasHabilitados, { medicoId: number; ano: number; mes: number }>({
      query: ({ medicoId, ano, mes }) => 
        `consultas/medicos/${medicoId}/calendario?ano=${ano}&mes=${mes}`,
      providesTags: (result, error, { medicoId, ano, mes }) => [
        { type: 'Calendario', id: `${medicoId}-${ano}-${mes}` }
      ],
    }),

    // Calcular horários disponíveis (mutation porque é um POST)
    calcularHorariosDisponiveis: builder.mutation<HorarioSlot[], HorariosDisponiveisRequest>({
      query: (body) => ({
        url: 'consultas/horarios-disponiveis',
        method: 'POST',
        body,
      }),
    }),

    // Criar nova consulta
    criarConsulta: builder.mutation<ConsultaResponse, CreateConsultaRequest>({
      query: (newConsulta) => ({
        url: 'consultas',
        method: 'POST',
        body: newConsulta,
      }),
      invalidatesTags: ['Consulta', 'Calendario'],
    }),

    // Buscar minhas consultas
    getMinhasConsultas: builder.query<ConsultaResponse[], void>({
      query: () => 'consultas/minhas',
      providesTags: ['Consulta'],
    }),

    // Buscar consulta por ID
    getConsultaById: builder.query<ConsultaResponse, number>({
      query: (id) => `consultas/${id}`,
      providesTags: (result, error, id) => [{ type: 'Consulta', id }],
    }),

    // Atualizar consulta
    atualizarConsulta: builder.mutation<ConsultaResponse, { id: number; data: UpdateConsultaRequest }>({
      query: ({ id, data }) => ({
        url: `consultas/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Consulta', id },
        'Consulta',
        'Calendario'
      ],
    }),

    // Cancelar consulta
    cancelarConsulta: builder.mutation<void, number>({
      query: (id) => ({
        url: `consultas/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Consulta', id },
        'Consulta',
        'Calendario'
      ],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useGetEspecialidadesQuery,
  useGetMedicosByEspecialidadeQuery,
  useGetConveniosByMedicoEspecialidadeQuery,
  useGetDiasHabilitadosQuery,
  useCalcularHorariosDisponiveisMutation,
  useCriarConsultaMutation,
  useGetMinhasConsultasQuery,
  useGetConsultaByIdQuery,
  useAtualizarConsultaMutation,
  useCancelarConsultaMutation,
} = consultasApi;