import { api } from '../api';

// ========== INTERFACES ==========

export interface Especialidade {
  id: number;
  descricao: string;
}

export interface CreateEspecialidadeRequest {
  descricao: string;
}

export interface UpdateEspecialidadeRequest {
  descricao: string;
}

export interface Convenio {
  id: number;
  nome: string;
}

export interface CreateConvenioRequest {
  nome: string;
}

export interface UpdateConvenioRequest {
  nome: string;
}

export interface MedicoEspecialidade {
  especialidadeId: number;
  convenioIds: number[];
  tempoConsulta: number;
}

export interface Medico {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  login: string;
  crm: string;
  especialidades: {
    especialidade: { id: number; descricao: string };
    convenio: { id: number; nome: string };
    tempoConsulta: number;
  }[];
}

export interface CreateMedicoRequest {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  login: string;
  senha: string;
  crm: string;
  especialidades: MedicoEspecialidade[];
}

export interface UpdateMedicoRequest {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  login: string;
  senha?: string;
  crm: string;
  especialidades: MedicoEspecialidade[];
}

// ========== API ENDPOINTS ==========

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ========== ESPECIALIDADES ==========
    getEspecialidades: builder.query<Especialidade[], void>({
      query: () => 'admin/especialidades',
      providesTags: ['Especialidade'],
    }),

    createEspecialidade: builder.mutation<Especialidade, CreateEspecialidadeRequest>({
      query: (data) => ({
        url: 'admin/especialidades',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Especialidade'],
    }),

    updateEspecialidade: builder.mutation<Especialidade, { id: number; data: UpdateEspecialidadeRequest }>({
      query: ({ id, data }) => ({
        url: `admin/especialidades/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Especialidade'],
    }),

    deleteEspecialidade: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/especialidades/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Especialidade'],
    }),

    // ========== CONVÊNIOS ==========
    getConvenios: builder.query<Convenio[], void>({
      query: () => 'admin/convenios',
      providesTags: ['Convenio'],
    }),

    createConvenio: builder.mutation<Convenio, CreateConvenioRequest>({
      query: (data) => ({
        url: 'admin/convenios',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Convenio'],
    }),

    updateConvenio: builder.mutation<Convenio, { id: number; data: UpdateConvenioRequest }>({
      query: ({ id, data }) => ({
        url: `admin/convenios/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Convenio'],
    }),

    deleteConvenio: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/convenios/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Convenio'],
    }),

    // ========== MÉDICOS ==========
    getMedicos: builder.query<Medico[], void>({
      query: () => 'admin/medicos',
      providesTags: ['Medico'],
    }),

    getMedicoById: builder.query<Medico, number>({
      query: (id) => `admin/medicos/${id}`,
      providesTags: (result, error, id) => [{ type: 'Medico', id }],
    }),

    createMedico: builder.mutation<Medico, CreateMedicoRequest>({
      query: (data) => ({
        url: 'admin/medicos',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Medico'],
    }),

    updateMedico: builder.mutation<Medico, { id: number; data: UpdateMedicoRequest }>({
      query: ({ id, data }) => ({
        url: `admin/medicos/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Medico'],
    }),

    deleteMedico: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/medicos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Medico'],
    }),
  }),
  overrideExisting: false,
});

// ========== EXPORT HOOKS ==========
export const {
  // Especialidades
  useGetEspecialidadesQuery,
  useCreateEspecialidadeMutation,
  useUpdateEspecialidadeMutation,
  useDeleteEspecialidadeMutation,

  // Convênios
  useGetConveniosQuery,
  useCreateConvenioMutation,
  useUpdateConvenioMutation,
  useDeleteConvenioMutation,

  // Médicos
  useGetMedicosQuery,
  useGetMedicoByIdQuery,
  useCreateMedicoMutation,
  useUpdateMedicoMutation,
  useDeleteMedicoMutation,
} = adminApi;