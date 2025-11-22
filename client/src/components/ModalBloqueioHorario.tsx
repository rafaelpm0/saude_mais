import { useState } from 'react';
import { useCriarBloqueioMutation } from '../services/endpoints/medico';
import { toast } from './ui/toast';

interface ModalBloqueioHorarioProps {
  onClose: () => void;
  onSuccess: () => void;
}

function ModalBloqueioHorario({ onClose, onSuccess }: ModalBloqueioHorarioProps) {
  const [data, setData] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [motivo, setMotivo] = useState('');

  const [criarBloqueio, { isLoading }] = useCriarBloqueioMutation();

  // Validar formulário
  const validarFormulario = (): boolean => {
    if (!data) {
      toast.error('Informe a data do bloqueio');
      return false;
    }

    if (!horaInicio || !horaFim) {
      toast.error('Informe os horários de início e fim');
      return false;
    }

    // Validar se data não está no passado
    const dataSelecionada = new Date(`${data}T${horaInicio}`);
    const agora = new Date();
    
    if (dataSelecionada < agora) {
      toast.error('Não é possível criar bloqueio no passado');
      return false;
    }

    // Validar se hora fim é maior que hora início
    if (horaFim <= horaInicio) {
      toast.error('Horário de fim deve ser posterior ao horário de início');
      return false;
    }

    // Validar duração mínima (opcional)
    const [hIni, mIni] = horaInicio.split(':').map(Number);
    const [hFim, mFim] = horaFim.split(':').map(Number);
    const minutosTotal = (hFim * 60 + mFim) - (hIni * 60 + mIni);
    
    if (minutosTotal < 15) {
      toast.error('Duração mínima de 15 minutos');
      return false;
    }

    return true;
  };

  // Handler para salvar bloqueio
  const handleSalvar = async () => {
    if (!validarFormulario()) return;

    try {
      // Enviar data no formato local sem conversão de timezone
      const dataHoraInicio = `${data}T${horaInicio}:00`;
      const dataHoraFim = `${data}T${horaFim}:00`;

      await criarBloqueio({
        dataHoraInicio,
        dataHoraFim,
        motivo: motivo || 'Horário bloqueado'
      }).unwrap();

      toast.success('Horário bloqueado com sucesso!');
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || 'Erro ao criar bloqueio');
    }
  };

  // Obter data mínima (hoje)
  const dataMinima = new Date().toISOString().split('T')[0];

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        {/* Cabeçalho */}
        <h3 className="font-bold text-2xl mb-4">Bloquear Horário</h3>
        <p className="text-sm text-base-content text-opacity-70 mb-4">
          Bloqueie um período em sua agenda para que não seja possível agendar consultas neste horário.
        </p>

        {/* Formulário */}
        <div className="space-y-4">
          {/* Data */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Data</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={data}
              onChange={(e) => setData(e.target.value)}
              min={dataMinima}
              required
            />
          </div>

          {/* Horários */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Hora Início</span>
              </label>
              <input
                type="time"
                className="input input-bordered w-full"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Hora Fim</span>
              </label>
              <input
                type="time"
                className="input input-bordered w-full"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Motivo */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Motivo (opcional)</span>
              <span className="label-text-alt">{motivo.length}/200</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-20"
              placeholder="Ex: Reunião, Almoço, Compromisso pessoal..."
              value={motivo}
              onChange={(e) => {
                if (e.target.value.length <= 200) {
                  setMotivo(e.target.value);
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
            disabled={isLoading}
          >
            Cancelar
          </button>

          <button
            className="btn btn-warning"
            onClick={handleSalvar}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Bloqueando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Bloquear Horário
              </>
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

export default ModalBloqueioHorario;
