import { useState, useEffect } from 'react';
import { useGetDisponibilidadeQuery, useAtualizarDisponibilidadeMutation } from '../services/endpoints/medico';
import type { DisponibilidadeSemanal } from '../types/types';
import { toast } from '../components/ui/toast';

function MedicoDisponibilidade() {
  const { data: disponibilidadeAtual, isLoading, refetch } = useGetDisponibilidadeQuery();
  const [atualizarDisponibilidade, { isLoading: isUpdating }] = useAtualizarDisponibilidadeMutation();

  // Estado local para gerenciar disponibilidade
  const [dias, setDias] = useState<DisponibilidadeSemanal[]>([
    { diaSemana: 0, horaInicio: '08:00', horaFim: '17:00', habilitado: false }, // Domingo
    { diaSemana: 1, horaInicio: '08:00', horaFim: '17:00', habilitado: false }, // Segunda
    { diaSemana: 2, horaInicio: '08:00', horaFim: '17:00', habilitado: false }, // Terça
    { diaSemana: 3, horaInicio: '08:00', horaFim: '17:00', habilitado: false }, // Quarta
    { diaSemana: 4, horaInicio: '08:00', horaFim: '17:00', habilitado: false }, // Quinta
    { diaSemana: 5, horaInicio: '08:00', horaFim: '17:00', habilitado: false }, // Sexta
    { diaSemana: 6, horaInicio: '08:00', horaFim: '17:00', habilitado: false }, // Sábado
  ]);

  // Carregar disponibilidade existente
  useEffect(() => {
    if (disponibilidadeAtual && disponibilidadeAtual.length > 0) {
      setDias(prevDias => {
        const novosDias = [...prevDias];
        
        disponibilidadeAtual.forEach((disp) => {
          const index = novosDias.findIndex(d => d.diaSemana === disp.diaSemana);
          if (index !== -1) {
            novosDias[index] = {
              ...disp,
              habilitado: true
            };
          }
        });
        
        return novosDias;
      });
    }
  }, [disponibilidadeAtual]);

  // Nomes dos dias da semana
  const nomesDias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  // Toggle habilitação do dia
  const toggleDia = (index: number) => {
    const novosDias = [...dias];
    novosDias[index].habilitado = !novosDias[index].habilitado;
    setDias(novosDias);
  };

  // Atualizar hora de início
  const setHoraInicio = (index: number, hora: string) => {
    const novosDias = [...dias];
    novosDias[index].horaInicio = hora;
    setDias(novosDias);
  };

  // Atualizar hora de fim
  const setHoraFim = (index: number, hora: string) => {
    const novosDias = [...dias];
    novosDias[index].horaFim = hora;
    setDias(novosDias);
  };

  // Validar horários
  const validarHorarios = (): boolean => {
    const diasHabilitados = dias.filter(d => d.habilitado);

    if (diasHabilitados.length === 0) {
      toast.error('Selecione pelo menos um dia da semana');
      return false;
    }

    for (const dia of diasHabilitados) {
      if (dia.horaFim <= dia.horaInicio) {
        toast.error(`${nomesDias[dia.diaSemana]}: Horário de fim deve ser posterior ao horário de início`);
        return false;
      }

      // Validar mínimo 1 hora
      const [horaIni, minIni] = dia.horaInicio.split(':').map(Number);
      const [horaFim, minFim] = dia.horaFim.split(':').map(Number);
      const minutosTotal = (horaFim * 60 + minFim) - (horaIni * 60 + minIni);
      
      if (minutosTotal < 60) {
        toast.error(`${nomesDias[dia.diaSemana]}: Período mínimo de 1 hora necessário`);
        return false;
      }
    }

    return true;
  };

  // Salvar alterações
  const handleSalvar = async () => {
    if (!validarHorarios()) return;

    try {
      // Enviar apenas dias habilitados
      const disponibilidades = dias
        .filter(d => d.habilitado)
        .map(d => ({
          diaSemana: d.diaSemana,
          horaInicio: d.horaInicio,
          horaFim: d.horaFim
        }));

      await atualizarDisponibilidade({ disponibilidades }).unwrap();
      
      toast.success('Disponibilidade atualizada com sucesso!');
      refetch();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || 'Erro ao atualizar disponibilidade');
    }
  };

  return (
    <div className="container p-4">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Minha Disponibilidade</h1>
        <p className="text-base-content text-opacity-70">
          Configure os horários em que você está disponível para atendimentos durante a semana
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Formulário de disponibilidade */}
      {!isLoading && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th className="w-12">Ativo</th>
                    <th>Dia da Semana</th>
                    <th>Hora Início</th>
                    <th>Hora Fim</th>
                    <th>Duração</th>
                  </tr>
                </thead>
                <tbody>
                  {dias.map((dia, index) => {
                    // Calcular duração
                    const [horaIni, minIni] = dia.horaInicio.split(':').map(Number);
                    const [horaFim, minFim] = dia.horaFim.split(':').map(Number);
                    const minutosTotal = (horaFim * 60 + minFim) - (horaIni * 60 + minIni);
                    const horas = Math.floor(minutosTotal / 60);
                    const minutos = minutosTotal % 60;
                    const duracao = dia.habilitado && minutosTotal > 0 
                      ? `${horas}h ${minutos > 0 ? `${minutos}min` : ''}`
                      : '-';

                    return (
                      <tr key={dia.diaSemana} className={dia.habilitado ? '' : 'opacity-50'}>
                        <td>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            checked={dia.habilitado}
                            onChange={() => toggleDia(index)}
                          />
                        </td>
                        <td className="font-semibold">{nomesDias[dia.diaSemana]}</td>
                        <td>
                          <input
                            type="time"
                            className="input input-bordered input-sm w-full max-w-xs"
                            value={dia.horaInicio}
                            onChange={(e) => setHoraInicio(index, e.target.value)}
                            disabled={!dia.habilitado}
                          />
                        </td>
                        <td>
                          <input
                            type="time"
                            className="input input-bordered input-sm w-full max-w-xs"
                            value={dia.horaFim}
                            onChange={(e) => setHoraFim(index, e.target.value)}
                            disabled={!dia.habilitado}
                          />
                        </td>
                        <td className="text-sm">{duracao}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Informações adicionais */}
            <div className="alert alert-info mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="text-sm">
                <p className="font-semibold">Observações importantes:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Período mínimo de 1 hora por dia</li>
                  <li>Os horários configurados são válidos para todas as semanas</li>
                  <li>Consultas já agendadas não serão afetadas por alterações na disponibilidade</li>
                </ul>
              </div>
            </div>

            {/* Botão de salvar */}
            <div className="card-actions justify-end mt-4">
              <button
                className="btn btn-primary"
                onClick={handleSalvar}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Salvando...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MedicoDisponibilidade;
