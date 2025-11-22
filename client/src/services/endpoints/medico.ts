import { api } from '../api';
import type {
  ConsultaMedico,
  BloqueioHorario,
  DisponibilidadeSemanal,
  HistoricoPaciente,
  Paciente,
  CriarConsultaMedicoDto,
  AtualizarConsultaMedicoDto
} from '../../types/types';

/**
 * Endpoints específicos para o módulo de médicos
 */
export const medicoApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Buscar agenda do médico por período
    getAgendaMedico: builder.query<ConsultaMedico[], { dataInicio: string; dataFim: string }>({
      query: ({ dataInicio, dataFim }) => ({
        url: `medico/agenda?dataInicio=${dataInicio}&dataFim=${dataFim}`,
        method: 'GET'
      }),
      keepUnusedDataFor: 0, // Sempre buscar dados frescos
    }),

    // Criar consulta manualmente
    criarConsultaMedico: builder.mutation<ConsultaMedico, CriarConsultaMedicoDto>({
      query: (body) => ({
        url: 'medico/consulta',
        method: 'POST',
        body
      })
    }),

    // Criar bloqueio de horário
    criarBloqueio: builder.mutation<ConsultaMedico, BloqueioHorario>({
      query: (body) => ({
        url: 'medico/bloqueio',
        method: 'POST',
        body
      })
    }),

    // Atualizar consulta (observação e/ou status)
    atualizarConsultaMedico: builder.mutation<ConsultaMedico, { id: number } & AtualizarConsultaMedicoDto>({
      query: ({ id, ...body }) => ({
        url: `medico/consulta/${id}`,
        method: 'PUT',
        body
      })
    }),

    // Buscar histórico de consultas de um paciente
    getHistoricoPaciente: builder.query<HistoricoPaciente, number>({
      query: (idPaciente) => ({
        url: `medico/paciente/${idPaciente}/historico`,
        method: 'GET'
      }),
      keepUnusedDataFor: 1800 // Cache de 30 minutos para histórico
    }),

    // Buscar disponibilidade do médico
    getDisponibilidade: builder.query<DisponibilidadeSemanal[], void>({
      query: () => ({
        url: 'medico/disponibilidade',
        method: 'GET'
      }),
      keepUnusedDataFor: 300 // Cache de 5 minutos
    }),

    // Atualizar disponibilidade do médico
    atualizarDisponibilidade: builder.mutation<DisponibilidadeSemanal[], { disponibilidades: DisponibilidadeSemanal[] }>({
      query: (body) => ({
        url: 'medico/disponibilidade',
        method: 'PUT',
        body
      })
    }),

    // Buscar lista de pacientes com filtro
    getPacientes: builder.query<Paciente[], string | void>({
      query: (busca) => ({
        url: busca ? `medico/pacientes?busca=${busca}` : 'medico/pacientes',
        method: 'GET'
      }),
      keepUnusedDataFor: 0 // Não fazer cache, sempre buscar fresco
    }),

    // Buscar convênios disponíveis para o médico
    getConveniosMedico: builder.query<any[], void>({
      query: () => ({
        url: 'medico/convenios',
        method: 'GET'
      }),
      keepUnusedDataFor: 600 // Cache de 10 minutos
    }),

    // Buscar especialidades do médico
    getEspecialidadesMedico: builder.query<any[], void>({
      query: () => ({
        url: 'medico/especialidades',
        method: 'GET'
      }),
      keepUnusedDataFor: 600 // Cache de 10 minutos
    })
  }),
  overrideExisting: false
});

export const {
  useGetAgendaMedicoQuery,
  useLazyGetAgendaMedicoQuery,
  useCriarConsultaMedicoMutation,
  useCriarBloqueioMutation,
  useAtualizarConsultaMedicoMutation,
  useGetHistoricoPacienteQuery,
  useLazyGetHistoricoPacienteQuery,
  useGetDisponibilidadeQuery,
  useAtualizarDisponibilidadeMutation,
  useGetPacientesQuery,
  useLazyGetPacientesQuery,
  useGetConveniosMedicoQuery,
  useGetEspecialidadesMedicoQuery
} = medicoApi;
