import { api } from '../api';

export interface RelatorioQueryParams {
  dataInicio: string;
  dataFim: string;
  formato?: 'json' | 'pdf';
}

export interface EstatisticasMedicoEspecialidade {
  totalGeral: number;
  porStatus: {
    ativas: number;
    finalizadas: number;
    canceladas: number;
    faltas: number;
    transferidas: number;
  };
  porMedico: {
    medicoNome: string;
    especialidade: string;
    total: number;
    finalizadas: number;
  }[];
}

export interface ConsultaMedicoEspecialidade {
  medico: {
    id: number;
    nome: string;
    crm: string;
  };
  especialidade: {
    id: number;
    descricao: string;
  };
  convenio: {
    id: number;
    nome: string;
  };
  paciente: {
    id: number;
    nome: string;
    cpf: string;
  };
  dataConsulta: string;
  status: string;
  statusDescricao: string;
  observacao?: string;
}

export interface RelatorioConsultasMedicoEspecialidade {
  estatisticas: EstatisticasMedicoEspecialidade;
  consultas: ConsultaMedicoEspecialidade[];
}

export interface CancelamentoRemarcacao {
  totalConsultas: number;
  canceladas: number;
  transferidas: number;
  faltas: number;
  percentualCanceladas: number;
  percentualTransferidas: number;
  percentualFaltas: number;
  porMedico: {
    medicoNome: string;
    especialidade: string;
    total: number;
    canceladas: number;
    transferidas: number;
    faltas: number;
  }[];
}

export interface PacienteFrequente {
  paciente: {
    id: number;
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
  };
  totalConsultas: number;
  consultasFinalizadas: number;
  especialidades: string[];
  medicos: string[];
  primeiraConsulta: string;
  ultimaConsulta: string;
}

export interface RelatorioPacientesFrequentes {
  estatisticas: {
    totalPacientes: number;
    totalConsultas: number;
    mediaConsultasPorPaciente: number;
  };
  pacientes: PacienteFrequente[];
}

export const relatoriosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRelatorioConsultasMedicoEspecialidade: builder.query<
      RelatorioConsultasMedicoEspecialidade,
      RelatorioQueryParams
    >({
      query: ({ dataInicio, dataFim }) => ({
        url: `admin/relatorios/consultas-medico-especialidade`,
        params: { dataInicio, dataFim, formato: 'json' },
      }),
    }),
    getRelatorioCancelamentosRemarcacoes: builder.query<
      CancelamentoRemarcacao,
      RelatorioQueryParams
    >({
      query: ({ dataInicio, dataFim }) => ({
        url: `admin/relatorios/cancelamentos-remarcacoes`,
        params: { dataInicio, dataFim, formato: 'json' },
      }),
    }),
    getRelatorioPacientesFrequentes: builder.query<
      RelatorioPacientesFrequentes,
      RelatorioQueryParams
    >({
      query: ({ dataInicio, dataFim }) => ({
        url: `admin/relatorios/pacientes-frequentes`,
        params: { dataInicio, dataFim, formato: 'json' },
      }),
    }),
  }),
});

export const {
  useGetRelatorioConsultasMedicoEspecialidadeQuery,
  useGetRelatorioCancelamentosRemarcacoesQuery,
  useGetRelatorioPacientesFrequentesQuery,
} = relatoriosApi;
