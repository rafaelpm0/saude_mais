import { useState } from 'react';
import { useAtualizarConsultaMedicoMutation, useLazyGetHistoricoPacienteQuery } from '../services/endpoints/medico';
import type { ConsultaMedico } from '../types/types';
import { toast } from './ui/toast';

interface ModalAtenderConsultaProps {
  consulta: ConsultaMedico;
  onClose: () => void;
  onSuccess: () => void;
}

function ModalAtenderConsulta({ consulta, onClose, onSuccess }: ModalAtenderConsultaProps) {
  const [observacao, setObservacao] = useState(consulta.observacao || '');
  const [showHistorico, setShowHistorico] = useState(false);

  const [atualizarConsulta, { isLoading: isUpdating }] = useAtualizarConsultaMedicoMutation();
  const [getHistorico, { data: historico, isLoading: isLoadingHistorico }] = useLazyGetHistoricoPacienteQuery();

  // Formatar data e hora
  const formatarDataHora = (dataStr: string) => {
    const data = new Date(dataStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  };

  // Handler para carregar histórico
  const handleVerHistorico = () => {
    if (!showHistorico) {
      getHistorico(consulta.agenda.cliente.id);
    }
    setShowHistorico(!showHistorico);
  };

  // Handler para finalizar consulta
  const handleFinalizar = async () => {
    try {
      await atualizarConsulta({
        id: consulta.id,
        observacao,
        status: 'F'
      }).unwrap();
      
      toast.success('Consulta finalizada com sucesso!');
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || 'Erro ao finalizar consulta');
    }
  };

  // Handler para marcar falta
  const handleMarcarFalta = async () => {
    if (!confirm('Confirma que o paciente não compareceu?')) return;
    
    try {
      await atualizarConsulta({
        id: consulta.id,
        observacao,
        status: 'N'
      }).unwrap();
      
      toast.success('Falta registrada com sucesso');
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || 'Erro ao registrar falta');
    }
  };

  // Handler para cancelar consulta
  const handleCancelar = async () => {
    if (!confirm('Confirma o cancelamento desta consulta?')) return;
    
    try {
      await atualizarConsulta({
        id: consulta.id,
        observacao,
        status: 'C'
      }).unwrap();
      
      toast.success('Consulta cancelada com sucesso');
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || 'Erro ao cancelar consulta');
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl">
        {/* Cabeçalho */}
        <h3 className="font-bold text-2xl mb-4">Atendimento de Consulta</h3>

        {/* Informações do paciente */}
        <div className="card bg-base-200 mb-4">
          <div className="card-body p-4">
            <h4 className="font-semibold text-lg mb-2">Dados do Paciente</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">Nome:</span> {consulta.agenda.cliente.nome}
              </div>
              <div>
                <span className="font-semibold">CPF:</span> {consulta.agenda.cliente.cpf}
              </div>
              <div>
                <span className="font-semibold">Telefone:</span> {consulta.agenda.cliente.telefone}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {consulta.agenda.cliente.email}
              </div>
              <div className="col-span-2">
                <span className="font-semibold">Horário:</span> {formatarDataHora(consulta.agenda.dtaInicial)} - {formatarDataHora(consulta.agenda.dtaFinal)}
              </div>
              <div>
                <span className="font-semibold">Convênio:</span> {consulta.convenio.nome}
              </div>
              {consulta.especialidade && (
                <div>
                  <span className="font-semibold">Especialidade:</span> {consulta.especialidade.descricao}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card de aviso para faltas consecutivas */}
        {consulta.agenda.cliente.faltasConsecutivas > 0 && (
          <div className="card bg-error bg-opacity-10 border border-error mb-4">
            <div className="card-body p-4">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-error flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-error">Atenção: Paciente com Faltas Consecutivas</h4>
                  <p className="text-sm mt-1">
                    Este paciente possui <span className="font-semibold">{consulta.agenda.cliente.faltasConsecutivas} falta(s) consecutiva(s)</span>. 
                    {consulta.agenda.cliente.faltasConsecutivas >= 3 && ' O paciente está bloqueado para novos agendamentos.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botão ver histórico */}
        <button
          className="btn btn-sm btn-outline mb-4"
          onClick={handleVerHistorico}
          disabled={isLoadingHistorico}
        >
          {isLoadingHistorico ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : showHistorico ? (
            'Ocultar Histórico'
          ) : (
            'Ver Histórico de Consultas'
          )}
        </button>

        {/* Histórico de consultas */}
        {showHistorico && historico && (
          <div className="card bg-base-200 mb-4 max-h-64 overflow-y-auto">
            <div className="card-body p-4">
              <h4 className="font-semibold mb-2">
                Histórico ({historico.totalConsultas} consultas - {historico.totalFinalizadas} finalizadas - {historico.totalFaltas} faltas)
              </h4>
              {historico.consultas.length === 0 ? (
                <p className="text-sm text-base-content text-opacity-70">Nenhum histórico anterior</p>
              ) : (
                <div className="space-y-2">
                  {historico.consultas.map((h) => (
                    <div key={h.id} className="border-l-4 border-primary pl-3 py-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold">{formatarDataHora(h.dtaInicial)}</p>
                          <p className="text-xs text-base-content text-opacity-70">
                            {h.convenio} {h.especialidade && `• ${h.especialidade}`}
                          </p>
                          {h.observacao && (
                            <p className="text-xs mt-1 italic">{h.observacao}</p>
                          )}
                        </div>
                        <div className={`badge badge-sm ${
                          h.status === 'F' ? 'badge-success' : 
                          h.status === 'N' ? 'badge-error' : 
                          'badge-warning'
                        }`}>
                          {h.status === 'F' ? 'Finalizada' : h.status === 'N' ? 'Falta' : 'Cancelada'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Observações */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text font-semibold">Observações do Atendimento</span>
            <span className="label-text-alt">{observacao.length}/500</span>
          </label>
          <textarea
            className="textarea textarea-bordered h-32"
            placeholder="Digite observações sobre o atendimento..."
            value={observacao}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setObservacao(e.target.value);
              }
            }}
            disabled={isUpdating}
          />
        </div>

        {/* Botões de ação */}
        <div className="modal-action flex-wrap gap-2">
          <button
            className="btn btn-error h-12"
            onClick={handleMarcarFalta}
            disabled={isUpdating || consulta.status === 'F' || consulta.status === 'N'}
          >
            {isUpdating ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'Não Compareceu'
            )}
          </button>

          <button
            className="btn btn-warning h-12"
            onClick={handleCancelar}
            disabled={isUpdating || consulta.status === 'F' || consulta.status === 'N'}
          >
            Cancelar Consulta
          </button>

          <button
            className="btn btn-success h-12"
            onClick={handleFinalizar}
            disabled={isUpdating || consulta.status === 'F' || consulta.status === 'N'}
          >
            {isUpdating ? (
              <span className="loading loading-spinner"></span>
            ) : (
              'Finalizar Atendimento'
            )}
          </button>

          <button
            className="btn h-12"
            onClick={onClose}
            disabled={isUpdating}
          >
            Fechar
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

export default ModalAtenderConsulta;
