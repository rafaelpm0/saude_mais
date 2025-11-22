import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import type { RootState } from '../app/store';
import ModalAgendamento from '../components/ModalAgendamento';
import ModalRemarcarSimples from '../components/ModalRemarcarSimples';
import { 
  useGetMinhasConsultasQuery,
  useCancelarConsultaMutation,
  type ConsultaResponse 
} from '../services/endpoints/consultas';

function Agendamento() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [modalAgendamentoOpen, setModalAgendamentoOpen] = useState(false);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [modalHistoricoOpen, setModalHistoricoOpen] = useState(false);
  const [modalRemarcarOpen, setModalRemarcarOpen] = useState(false);
  const [consultaSelecionada, setConsultaSelecionada] = useState<ConsultaResponse | null>(null);

  // Queries
  const { data: minhasConsultas = [], refetch } = useGetMinhasConsultasQuery();
  const [cancelarConsulta] = useCancelarConsultaMutation();

  // Filtrar consultas ativas (futuras) - CORRIGIDO
  const consultasFuturas = minhasConsultas.filter(consulta => {
    const dataConsulta = new Date(consulta.agenda.dtaInicial.replace('Z', ''));
    const agora = new Date();
    return dataConsulta > agora && consulta.status === 'A';
  });

  // Filtrar histórico (passadas, canceladas, finalizadas ou não compareceu) - CORRIGIDO
  const historicoConsultas = minhasConsultas.filter(consulta => {
    const dataConsulta = new Date(consulta.agenda.dtaInicial.replace('Z', ''));
    const agora = new Date();
    return dataConsulta <= agora || ['C', 'F', 'N'].includes(consulta.status);
  });

  const handleConsultaClick = (consulta: ConsultaResponse) => {
    setConsultaSelecionada(consulta);
    setModalDetalhesOpen(true);
  };

  const handleCancelarConsulta = async (consultaId: number) => {
    try {
      await cancelarConsulta(consultaId).unwrap();
      toast.success('Consulta cancelada com sucesso!');
      setModalDetalhesOpen(false);
      refetch();
    } catch (error) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Erro ao cancelar consulta';
      toast.error(errorMessage);
    }
  };

  const handleRemarcarConsulta = (consulta: ConsultaResponse) => {
    setConsultaSelecionada(consulta);
    setModalDetalhesOpen(false);
    setModalRemarcarOpen(true);
  };

  const formatDateTime = (dateString: string) => {
    // Remove o 'Z' para tratar como horário local, não UTC
    const date = new Date(dateString.replace('Z', ''));
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const canEditOrCancel = (dataConsulta: string) => {
    const consulta = new Date(dataConsulta.replace('Z', ''));
    const agora = new Date();
    const horasAntecedencia = (consulta.getTime() - agora.getTime()) / (1000 * 60 * 60);
    return horasAntecedencia >= 24;
  };

  return (
    <div className="flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Agendamentos</h1>
        <p className="text-gray-600">
          Bem-vindo(a), {user?.nome}! Gerencie seus agendamentos médicos aqui.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de Novo Agendamento */}
        <div className="card bg-white shadow-lg">
          <div className="card-body">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Novo Agendamento</h3>
                <p className="text-sm text-gray-600">Agende uma nova consulta</p>
              </div>
            </div>
            <button 
              className="btn btn-primary w-full"
              onClick={() => setModalAgendamentoOpen(true)}
            >
              Agendar Consulta
            </button>
          </div>
        </div>

        {/* Card de Próximas Consultas */}
        <div className="card bg-white shadow-lg">
          <div className="card-body">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Próximas Consultas</h3>
                <p className="text-sm text-gray-600">{consultasFuturas.length} consulta(s) agendada(s)</p>
              </div>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {consultasFuturas.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Nenhuma consulta agendada</p>
                </div>
              ) : (
                consultasFuturas.map((consulta) => {
                  const { date, time } = formatDateTime(consulta.agenda.dtaInicial);
                  return (
                    <div
                      key={consulta.id}
                      onClick={() => handleConsultaClick(consulta)}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm">{consulta.agenda.medico.nome}</p>
                          <p className="text-xs text-gray-600">{consulta.convenio.nome}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-blue-600">{date}</p>
                          <p className="text-xs text-gray-600">{time}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Card de Histórico */}
        <div className="card bg-white shadow-lg">
          <div className="card-body">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Histórico</h3>
                <p className="text-sm text-gray-600">{historicoConsultas.length} consulta(s) no histórico</p>
              </div>
            </div>
            <button 
              className="btn btn-outline w-full"
              onClick={() => setModalHistoricoOpen(true)}
            >
              Ver Histórico
            </button>
          </div>
        </div>
      </div>

      {/* Seção de Informações Importantes */}
      <div className="mt-8">
        <div className="card bg-blue-50 border border-blue-200">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Informações Importantes</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Chegue com 15 minutos de antecedência para seu atendimento
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Traga todos os exames e documentos necessários
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cancelamentos devem ser feitos com pelo menos 24h de antecedência
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de Agendamento */}
      <ModalAgendamento
        isOpen={modalAgendamentoOpen}
        onClose={() => setModalAgendamentoOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Modal de Detalhes da Consulta */}
      {modalDetalhesOpen && consultaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Detalhes da Consulta</h2>
                <button
                  onClick={() => setModalDetalhesOpen(false)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Médico</label>
                  <p className="text-gray-800">{consultaSelecionada.agenda.medico.nome}</p>
                  <p className="text-sm text-gray-600">{consultaSelecionada.agenda.medico.crm}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Data e Horário</label>
                  <p className="text-gray-800">
                    {formatDateTime(consultaSelecionada.agenda.dtaInicial).date} às {formatDateTime(consultaSelecionada.agenda.dtaInicial).time}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Convênio</label>
                  <p className="text-gray-800">{consultaSelecionada.convenio.nome}</p>
                </div>



                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p className={`text-sm font-semibold ${
                    consultaSelecionada.status === 'A' ? 'text-green-600' : 
                    consultaSelecionada.status === 'C' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {consultaSelecionada.status === 'A' ? 'Ativo' : 
                     consultaSelecionada.status === 'C' ? 'Cancelado' : 'Finalizado'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  onClick={() => setModalDetalhesOpen(false)}
                  className="btn btn-outline"
                >
                  Fechar
                </button>
                {consultaSelecionada.status === 'A' && canEditOrCancel(consultaSelecionada.agenda.dtaInicial) && (
                  <>
                    <button
                      onClick={() => handleRemarcarConsulta(consultaSelecionada)}
                      className="btn btn-warning"
                    >
                      Remarcar
                    </button>
                    <button
                      onClick={() => handleCancelarConsulta(consultaSelecionada.id)}
                      className="btn btn-error"
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Histórico */}
      {modalHistoricoOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Histórico de Consultas</h2>
                <button
                  onClick={() => setModalHistoricoOpen(false)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {historicoConsultas.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhuma consulta no histórico</p>
                ) : (
                  historicoConsultas.map((consulta) => {
                    const { date, time } = formatDateTime(consulta.agenda.dtaInicial);
                    return (
                      <div
                        key={consulta.id}
                        className="p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{consulta.agenda.medico.nome}</p>
                            <p className="text-sm text-gray-600">{consulta.convenio.nome}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{date}</p>
                            <p className="text-sm text-gray-600">{time}</p>
                            <p className={`text-xs font-semibold mt-1 ${
                              consulta.status === 'F' ? 'text-blue-600' : 
                              consulta.status === 'C' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {consulta.status === 'F' ? 'Finalizada' : 
                               consulta.status === 'C' ? 'Cancelada' : 'Não compareceu'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={() => setModalHistoricoOpen(false)}
                  className="btn btn-outline"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Remarcar */}
      {modalRemarcarOpen && consultaSelecionada && (
        <ModalRemarcarSimples
          isOpen={modalRemarcarOpen}
          onClose={() => setModalRemarcarOpen(false)}
          onSuccess={() => refetch()}
          consulta={consultaSelecionada}
        />
      )}
    </div>
  );
}

export default Agendamento;