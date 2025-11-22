import { useState, useCallback } from 'react';
import { 
  useCriarConsultaMedicoMutation,
  useLazyGetPacientesQuery,
  useGetConveniosMedicoQuery,
  useGetEspecialidadesMedicoQuery
} from '../services/endpoints/medico';
import { toast } from './ui/toast';
import SearchSelect from './ui/SearchSelect';
import type { Paciente } from '../types/types';

interface ModalCriarConsultaMedicoProps {
  onClose: () => void;
  onSuccess: () => void;
}

function ModalCriarConsultaMedico({ onClose, onSuccess }: ModalCriarConsultaMedicoProps) {
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
  const [idEspecialidade, setIdEspecialidade] = useState<number>(0);
  const [idConvenio, setIdConvenio] = useState<number>(0);
  const [dataHora, setDataHora] = useState('');
  const [duracao, setDuracao] = useState(30); // Duração em minutos
  const [observacao, setObservacao] = useState('');

  // Lazy queries
  const [getPacientes, { data: pacientes, isLoading: loadingPacientes }] = useLazyGetPacientesQuery();
  const { data: especialidades, isLoading: loadingEspecialidades } = useGetEspecialidadesMedicoQuery();
  const { data: convenios, isLoading: loadingConvenios } = useGetConveniosMedicoQuery();

  const [criarConsulta, { isLoading: isCreating }] = useCriarConsultaMedicoMutation();

  // Handler para buscar pacientes
  const handleBuscarPacientes = useCallback((termo: string) => {
    if (termo.length >= 2) {
      getPacientes(termo);
    }
  }, [getPacientes]);

  // Validar formulário
  const validarFormulario = (): string | null => {
    if (!pacienteSelecionado) return 'Selecione um paciente';
    if (pacienteSelecionado.faltasConsecutivas >= 3) return 'Paciente bloqueado por faltas consecutivas';
    if (!idEspecialidade) return 'Selecione uma especialidade';
    if (!idConvenio) return 'Selecione um convênio';
    if (!dataHora) return 'Informe a data e hora da consulta';
    
    const dataConsulta = new Date(dataHora);
    if (dataConsulta < new Date()) return 'Não é possível criar consulta no passado';
    if (duracao < 15) return 'Duração mínima de 15 minutos';

    return null;
  };

  // Handler para salvar consulta
  const handleSalvar = async () => {
    const erro = validarFormulario();
    if (erro) {
      toast.error(erro);
      return;
    }

    try {
      const dataHoraInicio = new Date(dataHora);
      const dataHoraFim = new Date(dataHoraInicio.getTime() + duracao * 60000);

      await criarConsulta({
        idPaciente: pacienteSelecionado!.id,
        idEspecialidade,
        idConvenio,
        dataHoraInicio: dataHoraInicio.toISOString(),
        dataHoraFim: dataHoraFim.toISOString(),
        observacao: observacao.trim() || undefined
      }).unwrap();

      toast.success('Consulta criada com sucesso!');
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || 'Erro ao criar consulta');
    }
  };

  // Obter datetime mínimo (agora)
  const dataTimeMinimo = new Date().toISOString().slice(0, 16);

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        {/* Cabeçalho */}
        <h3 className="font-bold text-2xl mb-4">Nova Consulta</h3>

        {/* Formulário */}
        <div className="space-y-4">
          {/* Busca de Paciente */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Paciente *</span>
            </label>
            <SearchSelect<Paciente>
              data={pacientes || []}
              isLoading={loadingPacientes}
              value={pacienteSelecionado}
              onChange={setPacienteSelecionado}
              onSearch={handleBuscarPacientes}
              getLabel={(p) => `${p.nome} - CPF: ${p.cpf}`}
              getKey={(p) => p.id}
              placeholder="Digite o nome ou CPF do paciente..."
              noResultsText="Nenhum paciente encontrado"
              minSearchLength={2}
              renderOption={(p) => (
                <div className="flex flex-col">
                  <span className="font-semibold">{p.nome}</span>
                  <span className="text-sm text-base-content text-opacity-60">CPF: {p.cpf}</span>
                  {p.faltasConsecutivas >= 3 && (
                    <span className="text-xs text-error">⚠️ BLOQUEADO</span>
                  )}
                </div>
              )}
            />
          </div>

          {/* Alerta se paciente bloqueado */}
          {pacienteSelecionado && pacienteSelecionado.faltasConsecutivas >= 3 && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Paciente bloqueado por {pacienteSelecionado.faltasConsecutivas} faltas consecutivas</span>
            </div>
          )}

          {/* Especialidade */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Especialidade *</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={idEspecialidade}
              onChange={(e) => setIdEspecialidade(Number(e.target.value))}
              disabled={loadingEspecialidades}
            >
              <option value={0}>Selecione uma especialidade</option>
              {especialidades?.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.descricao}
                </option>
              ))}
            </select>
          </div>

          {/* Convênio */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Convênio *</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={idConvenio}
              onChange={(e) => setIdConvenio(Number(e.target.value))}
              disabled={loadingConvenios}
            >
              <option value={0}>Selecione um convênio</option>
              {convenios?.map((conv: { id: number; nome: string }) => (
                <option key={conv.id} value={conv.id}>
                  {conv.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Data e Hora *</span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered w-full"
                value={dataHora}
                onChange={(e) => setDataHora(e.target.value)}
                min={dataTimeMinimo}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Duração (min) *</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={duracao}
                onChange={(e) => setDuracao(Number(e.target.value))}
                min={15}
                max={180}
                step={15}
                required
              />
            </div>
          </div>

          {/* Observação Inicial */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Observação Inicial (opcional)</span>
              <span className="label-text-alt">{observacao.length}/500</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-20"
              placeholder="Observações sobre a consulta..."
              value={observacao}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setObservacao(e.target.value);
                }
              }}
            />
          </div>
        </div>

        {/* Botões de ação */}
        <div className="modal-action">
          <button
            className="btn"
            onClick={onClose}
            disabled={isCreating}
          >
            Cancelar
          </button>

          <button
            className="btn btn-primary"
            onClick={handleSalvar}
            disabled={isCreating || (pacienteSelecionado?.faltasConsecutivas ?? 0) >= 3}
          >
            {isCreating ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Criando...
              </>
            ) : (
              'Criar Consulta'
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

export default ModalCriarConsultaMedico;
