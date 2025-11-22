import { useState, useEffect, useMemo } from 'react';
import { useGetAgendaMedicoQuery, useDeletarBloqueioMutation } from '../services/endpoints/medico';
import type { ConsultaMedico } from '../types/types';
import { toast } from '../components/ui/toast';
import ModalAtenderConsulta from '../components/ModalAtenderConsulta';
import ModalBloqueioHorario from '../components/ModalBloqueioHorario';
import ModalCriarConsultaMedico from '../components/ModalCriarConsultaMedico';

function MedicoAgenda() {
  // Estados para controle de datas
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Estados para modais
  const [modalAtender, setModalAtender] = useState<ConsultaMedico | null>(null);
  const [modalBloqueio, setModalBloqueio] = useState(false);
  const [modalNovaConsulta, setModalNovaConsulta] = useState(false);

  // Inicializar com a semana atual
  useEffect(() => {
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    
    // Calcular início da semana (segunda-feira)
    const inicioSemana = new Date(hoje);
    const diasAteSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
    inicioSemana.setDate(hoje.getDate() + diasAteSegunda);
    inicioSemana.setHours(0, 0, 0, 0);
    
    // Calcular fim da semana (domingo)
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    fimSemana.setHours(23, 59, 59, 999);
    
    setDataInicio(inicioSemana.toISOString().split('T')[0]);
    setDataFim(fimSemana.toISOString().split('T')[0]);
  }, []);

  // Buscar agenda
  const { data: consultas, isLoading, error, refetch } = useGetAgendaMedicoQuery(
    { dataInicio, dataFim },
    { skip: !dataInicio || !dataFim }
  );

  // Mutation para deletar bloqueio
  const [deletarBloqueio] = useDeletarBloqueioMutation();

  // Agrupar consultas por dia
  const consultasAgrupadas = useMemo(() => {
    if (!consultas) return {};
    
    return consultas.reduce((acc, consulta) => {
      // Extrair data sem conversão de timezone
      const dia = consulta.agenda.dtaInicial.split('T')[0];
      
      if (!acc[dia]) {
        acc[dia] = [];
      }
      acc[dia].push(consulta);
      
      return acc;
    }, {} as Record<string, ConsultaMedico[]>);
  }, [consultas]);

  // Ordenar dias
  const diasOrdenados = useMemo(() => {
    return Object.keys(consultasAgrupadas).sort();
  }, [consultasAgrupadas]);

  // Formatar data para exibição
  const formatarData = (dataStr: string) => {
    // Parse manual para evitar conversão de timezone
    const [ano, mes, dia] = dataStr.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(data);
  };

  // Formatar horário
  const formatarHorario = (dataStr: string) => {
    // As datas estão salvas em UTC mas representam horário local
    const date = new Date(dataStr);
    const hora = String(date.getUTCHours()).padStart(2, '0');
    const minuto = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hora}:${minuto}`;
  };

  // Obter classe CSS do status
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'A': return 'badge-info';
      case 'F': return 'badge-success';
      case 'N': return 'badge-error';
      case 'C': return 'badge-warning';
      case 'R': return 'badge-warning';
      default: return 'badge-ghost';
    }
  };

  // Obter texto do status
  const getStatusTexto = (status: string) => {
    switch (status) {
      case 'A': return 'Agendada';
      case 'F': return 'Finalizada';
      case 'N': return 'Não Compareceu';
      case 'C': return 'Cancelada';
      case 'R': return 'Bloqueado';
      default: return status;
    }
  };

  // Função para deletar bloqueio
  const handleDeletarBloqueio = async (consultaId: number) => {
    if (!confirm('Tem certeza que deseja deletar este bloqueio?')) {
      return;
    }
    
    try {
      await deletarBloqueio(consultaId).unwrap();
      toast.success('Bloqueio deletado com sucesso!');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Erro ao deletar bloqueio');
    }
  };

  if (error) {
    toast.error('Erro ao carregar agenda');
  }

  return (
    <div className="container  p-4">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Minha Agenda</h1>
          <p className="text-base-content text-opacity-70">Visualize e gerencie suas consultas agendadas</p>
        </div>
        
        {/* Filtros de data */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Data Início</span>
            </label>
            <input
              type="date"
              className="input input-bordered"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Data Fim</span>
            </label>
            <input
              type="date"
              className="input input-bordered"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>

          <button 
            className="btn btn-primary mt-8"
            onClick={() => refetch()}
          >
            Atualizar
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Lista de consultas agrupadas por dia */}
      {!isLoading && consultas && (
        <div className="space-y-8">
          {diasOrdenados.length === 0 ? (
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Nenhuma consulta encontrada no período selecionado.</span>
            </div>
          ) : (
            diasOrdenados.map((dia) => (
              <div key={dia} className="card bg-base-100 shadow-lg">
                <div className="card-body p-4">
                  {/* Cabeçalho do dia */}
                  <h2 className="card-title text-xl capitalize mb-3 border-b pb-2">
                    {formatarData(dia)}
                  </h2>

                  {/* Consultas do dia */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {consultasAgrupadas[dia].map((consulta) => (
                      <div
                        key={consulta.id}
                        className={`card border ${
                          consulta.tipo === 'bloqueio'
                            ? 'bg-warning bg-opacity-10 border-warning'
                            : 'bg-base-200 border-base-300 hover:border-primary cursor-pointer'
                        }`}
                        onClick={() => {
                          if (consulta.tipo !== 'bloqueio') {
                            setModalAtender(consulta);
                          }
                        }}
                      >
                        <div className="card-body p-3">
                          {/* Horário */}
                          <div className="flex justify-between items-start gap-2">
                            <div className="text-sm font-bold">
                              {formatarHorario(consulta.agenda.dtaInicial)} - {formatarHorario(consulta.agenda.dtaFinal)}
                            </div>
                            <div className={`badge badge-sm ${getStatusClass(consulta.status)}`}>
                              {getStatusTexto(consulta.status)}
                            </div>
                          </div>

                          {/* Informações */}
                          {consulta.tipo === 'bloqueio' ? (
                            <>
                              <div className="flex items-center justify-between gap-1 mt-1">
                                <div className="flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span className="text-xs font-semibold">BLOQUEADO</span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletarBloqueio(consulta.id);
                                  }}
                                  className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error hover:text-white"
                                  title="Deletar bloqueio"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                              {consulta.observacao && (
                                <p className="text-xs mt-1 text-base-content text-opacity-70 line-clamp-2">
                                  {consulta.observacao}
                                </p>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="mt-1 space-y-0.5">
                                <p className="font-semibold text-sm truncate">{consulta.agenda.cliente.nome}</p>
                                <p className="text-xs text-base-content text-opacity-70 truncate">
                                  {consulta.convenio.nome}
                                  {consulta.especialidade && ` • ${consulta.especialidade.descricao}`}
                                </p>
                                {consulta.agenda.cliente.faltasConsecutivas > 0 && (
                                  <div className="badge badge-error badge-xs">
                                    {consulta.agenda.cliente.faltasConsecutivas} falta(s)
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Botões de ação flutuantes */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        <button
          className="btn btn-primary btn-circle btn-lg shadow-lg"
          onClick={() => setModalNovaConsulta(true)}
          title="Nova Consulta"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <button
          className="btn btn-warning btn-circle btn-lg shadow-lg"
          onClick={() => setModalBloqueio(true)}
          title="Bloquear Horário"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </button>
      </div>

      {/* Modais */}
      {modalAtender && (
        <ModalAtenderConsulta
          consulta={modalAtender}
          onClose={() => setModalAtender(null)}
          onSuccess={() => {
            refetch();
            toast.success('Consulta atualizada com sucesso!');
          }}
        />
      )}

      {modalBloqueio && (
        <ModalBloqueioHorario
          onClose={() => setModalBloqueio(false)}
          onSuccess={() => {
            refetch();
            toast.success('Horário bloqueado com sucesso!');
          }}
        />
      )}

      {modalNovaConsulta && (
        <ModalCriarConsultaMedico
          onClose={() => setModalNovaConsulta(false)}
          onSuccess={() => {
            refetch();
            toast.success('Consulta criada com sucesso!');
          }}
        />
      )}
    </div>
  );
}

export default MedicoAgenda;
