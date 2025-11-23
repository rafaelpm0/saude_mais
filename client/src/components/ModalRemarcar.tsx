import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  useGetEspecialidadesQuery,
  useGetMedicosByEspecialidadeQuery,
  useGetConveniosByMedicoEspecialidadeQuery,
  useGetDiasHabilitadosQuery,
  useCalcularHorariosDisponiveisMutation,
  useAtualizarConsultaMutation,
  type ConsultaResponse,
  type HorarioSlot
} from '../services/endpoints/consultas';

interface RemarcarFormData {
  especialidade: string;
  medico: string;
  convenio: string;
  data: string;
  hora: string;
}

interface ModalRemarcarProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  consulta: ConsultaResponse;
}

function ModalRemarcar({ isOpen, onClose, onSuccess, consulta }: ModalRemarcarProps) {
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
  } = useForm<RemarcarFormData>({
    defaultValues: {
      medico: consulta.agenda.medico.id.toString(),
      convenio: consulta.convenio.id.toString()
    }
  });

  // Estados para controlar seleções
  const especialidadeSelecionada = watch('especialidade');
  const medicoSelecionado = watch('medico');
  // const convenioSelecionado = watch('convenio');
  
  // Queries
  const { data: _especialidades } = useGetEspecialidadesQuery();
  
  const { data: _medicos } = useGetMedicosByEspecialidadeQuery(
    parseInt(especialidadeSelecionada), 
    { skip: !especialidadeSelecionada }
  );
  
  const { data: _convenios } = useGetConveniosByMedicoEspecialidadeQuery(
    { 
      medicoId: parseInt(medicoSelecionado), 
      especialidadeId: parseInt(especialidadeSelecionada) 
    },
    { skip: !medicoSelecionado || !especialidadeSelecionada }
  );
  
  const { data: diasHabilitados } = useGetDiasHabilitadosQuery(
    { 
      medicoId: parseInt(medicoSelecionado), 
      ano: currentMonth.getFullYear(), 
      mes: currentMonth.getMonth() + 1 
    },
    { skip: !medicoSelecionado }
  );

  // Mutations
  const [calcularHorarios] = useCalcularHorariosDisponiveisMutation();
  const [atualizarConsulta, { isLoading: isUpdating }] = useAtualizarConsultaMutation();

  // Watch form values
  const watchHora = watch('hora');

  // Handle day click
  const handleDayClick = async (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = clickedDate.toISOString().split('T')[0];
    
    setSelectedData(dateString);
    setValue('data', dateString);
    setValue('hora', '');

    try {
      const result = await calcularHorarios({
        idMedico: medicoSelecionado ? parseInt(medicoSelecionado) : 0,
        idEspecialidade: especialidadeSelecionada ? parseInt(especialidadeSelecionada) : 0,
        data: dateString
      }).unwrap();
      
      setAvailableSlots(result);
    } catch {
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
    if (!diasHabilitados) return false;
    
    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
    const isPastDate = day < new Date(new Date().setHours(0, 0, 0, 0));
    
    return isCurrentMonth && !isPastDate && diasHabilitados.dias.includes(day.getDate());
  };

  const onSubmit = async (data: RemarcarFormData) => {
    try {
      const dataHora = `${data.data}T${data.hora}:00.000Z`;
      
      await atualizarConsulta({
        id: consulta.id,
        data: { dataHora }
      }).unwrap();

      toast.success('Consulta remarcada com sucesso!');
      onSuccess();
      handleClose();
    } catch (error) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Erro ao remarcar consulta';
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    reset();
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Remarcar Consulta</h2>
              <p className="text-gray-600">
                {consulta.agenda.medico.nome} - {consulta.convenio.nome}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Current Info */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Agendamento Atual</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Data:</span>
                      <p className="font-medium">
                        {new Date(consulta.agenda.dtaInicial.replace('Z', '')).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Horário:</span>
                      <p className="font-medium">
                        {new Date(consulta.agenda.dtaInicial.replace('Z', '')).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">⚠️ Importante</h4>
                  <p className="text-sm text-blue-700">
                    A remarcação deve ser feita with pelo menos 24 horas de antecedência.
                  </p>
                </div>
              </div>

              {/* Right Column - Calendar and Time Slots */}
              <div className="space-y-4">
                {/* Calendar */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Nova Data</span>
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

                {/* Time Slots */}
                {selectedData && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Novo Horário</span>
                    </label>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                        {availableSlots.map((slot) => {
                          const isSelected = watchHora === slot.hora;
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
                                  ? 'btn-primary shadow-md scale-105' 
                                  : 'btn-outline hover:btn-primary hover:scale-105'
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
                        <p className="text-xs mt-1">Tente outro dia</p>
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
                className={`btn btn-primary ${isUpdating ? 'loading' : ''}`}
                disabled={isUpdating || !selectedData || availableSlots.length === 0}
              >
                {isUpdating ? 'Remarcando...' : 'Remarcar Consulta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ModalRemarcar;