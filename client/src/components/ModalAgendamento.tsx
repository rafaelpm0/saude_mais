import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  useGetEspecialidadesQuery,
  useGetMedicosByEspecialidadeQuery,
  useGetConveniosByMedicoEspecialidadeQuery,
  useGetDiasHabilitadosQuery,
  useCalcularHorariosDisponiveisMutation,
  useCriarConsultaMutation,
  type Especialidade,
  type Medico,
  type Convenio,
  type HorarioSlot
} from '../services/endpoints/consultas';

interface AgendamentoFormData {
  especialidade: string;
  medico: string;
  convenio: string;
  data: string;
  hora: string;
  observacao: string;
}

interface ModalAgendamentoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function ModalAgendamento({ isOpen, onClose, onSuccess }: ModalAgendamentoProps) {
  const [selectedEspecialidade, setSelectedEspecialidade] = useState<number | null>(null);
  const [selectedMedico, setSelectedMedico] = useState<number | null>(null);
  const [selectedData, setSelectedData] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<HorarioSlot[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AgendamentoFormData>();

  // Queries
  const { data: especialidades = [] } = useGetEspecialidadesQuery();
  
  const { data: medicos = [] } = useGetMedicosByEspecialidadeQuery(
    selectedEspecialidade!,
    { skip: !selectedEspecialidade }
  );

  const { data: convenios = [] } = useGetConveniosByMedicoEspecialidadeQuery(
    { medicoId: selectedMedico!, especialidadeId: selectedEspecialidade! },
    { skip: !selectedMedico || !selectedEspecialidade }
  );

  const { data: diasHabilitados } = useGetDiasHabilitadosQuery(
    { 
      medicoId: selectedMedico!, 
      ano: currentMonth.getFullYear(), 
      mes: currentMonth.getMonth() + 1 
    },
    { skip: !selectedMedico }
  );

  // Mutations
  const [calcularHorarios] = useCalcularHorariosDisponiveisMutation();
  const [criarConsulta, { isLoading: isCreating }] = useCriarConsultaMutation();

  // Watch form values
  const watchEspecialidade = watch('especialidade');
  const watchMedico = watch('medico');

  // Reset dependent fields when parent changes
  useEffect(() => {
    if (watchEspecialidade) {
      setSelectedEspecialidade(parseInt(watchEspecialidade));
      setValue('medico', '');
      setValue('convenio', '');
      setValue('data', '');
      setValue('hora', '');
      setSelectedMedico(null);
      setSelectedData('');
      setAvailableSlots([]);
    }
  }, [watchEspecialidade, setValue]);

  useEffect(() => {
    if (watchMedico) {
      setSelectedMedico(parseInt(watchMedico));
      setValue('convenio', '');
      setValue('data', '');
      setValue('hora', '');
      setSelectedData('');
      setAvailableSlots([]);
    }
  }, [watchMedico, setValue]);

  // Handle day click
  const handleDayClick = async (day: number) => {
    if (!selectedMedico || !selectedEspecialidade) return;
    
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = clickedDate.toISOString().split('T')[0];
    
    setSelectedData(dateString);
    setValue('data', dateString);
    setValue('hora', '');

    try {
      const result = await calcularHorarios({
        idMedico: selectedMedico,
        idEspecialidade: selectedEspecialidade,
        data: dateString
      }).unwrap();
      
      console.log('Horários recebidos:', result); // Log temporário para debug
      setAvailableSlots(result);
    } catch (error) {
      console.error('Erro ao calcular horários:', error);
      toast.error('Erro ao carregar horários disponíveis');
      setAvailableSlots([]);
    }
  };

  // Generate calendar
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const isDayEnabled = (day: Date) => {
    if (!selectedMedico || !diasHabilitados) return false;
    
    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
    const isPastDate = day < new Date(new Date().setHours(0, 0, 0, 0));
    
    return isCurrentMonth && !isPastDate && diasHabilitados.dias.includes(day.getDate());
  };

  const onSubmit = async (data: AgendamentoFormData) => {
    try {
      // Enviar data/hora sem conversão de timezone (sem o .000Z no final)
      const dataHora = `${data.data}T${data.hora}:00`;
      
      await criarConsulta({
        idMedico: parseInt(data.medico),
        idEspecialidade: parseInt(data.especialidade),
        idConvenio: parseInt(data.convenio),
        dataHora,
        observacao: data.observacao || undefined
      }).unwrap();

      toast.success('Consulta agendada com sucesso!');
      onSuccess();
      handleClose();
    } catch (error) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Erro ao agendar consulta';
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedEspecialidade(null);
    setSelectedMedico(null);
    setSelectedData('');
    setAvailableSlots([]);
    onClose();
  };

  if (!isOpen) return null;

  const calendarDays = generateCalendar();
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Agendar Consulta</h2>
            <button
              onClick={handleClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="space-y-4">
                {/* Especialidade */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Especialidade</span>
                  </label>
                  <select
                    className={`select select-bordered w-full ${errors.especialidade ? 'select-error' : ''}`}
                    {...register('especialidade', { required: 'Especialidade é obrigatória' })}
                  >
                    <option value="">Selecione uma especialidade</option>
                    {especialidades.map((esp: Especialidade) => (
                      <option key={esp.id} value={esp.id}>
                        {esp.descricao}
                      </option>
                    ))}
                  </select>
                  {errors.especialidade && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.especialidade.message}</span>
                    </label>
                  )}
                </div>

                {/* Médico */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Médico</span>
                  </label>
                  <select
                    className={`select select-bordered w-full ${errors.medico ? 'select-error' : ''}`}
                    {...register('medico', { required: 'Médico é obrigatório' })}
                    disabled={!selectedEspecialidade}
                  >
                    <option value="">Selecione um médico</option>
                    {medicos.map((medico: Medico) => (
                      <option key={medico.id} value={medico.id}>
                        {medico.nome} - {medico.crm}
                      </option>
                    ))}
                  </select>
                  {errors.medico && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.medico.message}</span>
                    </label>
                  )}
                </div>

                {/* Convênio */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Convênio</span>
                  </label>
                  <select
                    className={`select select-bordered w-full ${errors.convenio ? 'select-error' : ''}`}
                    {...register('convenio', { required: 'Convênio é obrigatório' })}
                    disabled={!selectedMedico}
                  >
                    <option value="">Selecione um convênio</option>
                    {convenios.map((convenio: Convenio) => (
                      <option key={convenio.id} value={convenio.id}>
                        {convenio.nome}
                      </option>
                    ))}
                  </select>
                  {errors.convenio && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.convenio.message}</span>
                    </label>
                  )}
                </div>


              </div>

              {/* Right Column - Calendar and Time Slots */}
              <div className="space-y-4">
                {/* Calendar */}
                {selectedMedico && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Data da Consulta</span>
                    </label>
                    <div className="bg-base-100 border border-base-300 rounded-lg p-4">
                      {/* Calendar Header */}
                      <div className="flex justify-between items-center mb-4">
                        <button
                          type="button"
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                          className="btn btn-ghost btn-sm"
                        >
                          ←
                        </button>
                        <span className="font-semibold">
                          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                          className="btn btn-ghost btn-sm"
                        >
                          →
                        </button>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                          <div key={day} className="p-2 font-semibold text-gray-600">
                            {day}
                          </div>
                        ))}
                        {calendarDays.map((day, index) => {
                          const isEnabled = isDayEnabled(day);
                          const isSelected = selectedData === day.toISOString().split('T')[0];
                          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                          
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => isEnabled ? handleDayClick(day.getDate()) : null}
                              className={`
                                p-2 text-sm rounded transition-colors
                                ${!isCurrentMonth ? 'text-gray-300' : ''}
                                ${isEnabled ? 'hover:bg-blue-100 cursor-pointer text-blue-600 font-semibold' : 'text-gray-400 cursor-not-allowed'}
                                ${isSelected ? 'bg-blue-600 text-white' : ''}
                              `}
                              disabled={!isEnabled}
                            >
                              {day.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Time Slots */}
                {selectedData && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Horários Disponíveis</span>
                    </label>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                        {availableSlots.map((slot) => {
                          const isSelected = watch('hora') === slot.hora;
                          return (
                            <label key={slot.hora} className="cursor-pointer">
                              <input
                                type="radio"
                                className="sr-only"
                                value={slot.hora}
                                {...register('hora', { required: 'Horário é obrigatório' })}
                              />
                              <div className={`btn btn-sm w-full transition-all ${
                                isSelected 
                                  ? 'btn-primary' 
                                  : 'btn-outline hover:btn-primary'
                              }`}>
                                {slot.hora}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>Nenhum horário disponível</p>
                        <p className="text-xs mt-1">Tente outro dia ou médico</p>
                      </div>
                    )}
                    {errors.hora && (
                      <label className="label">
                        <span className="label-text-alt text-error">{errors.hora.message}</span>
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-outline"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${isCreating ? 'loading' : ''}`}
                disabled={isCreating || !selectedData || availableSlots.length === 0}
              >
                {isCreating ? 'Agendando...' : 'Agendar Consulta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ModalAgendamento;