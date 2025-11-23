import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  useGetDiasHabilitadosQuery,
  useCalcularHorariosDisponiveisMutation,
  useAtualizarConsultaMutation,
  type ConsultaResponse,
  type HorarioSlot
} from '../services/endpoints/consultas';

interface RemarcarFormData {
  data: string;
  hora: string;
}

interface ModalRemarcarSimplesProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  consulta: ConsultaResponse;
}

function ModalRemarcarSimples({ isOpen, onClose, onSuccess, consulta }: ModalRemarcarSimplesProps) {
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
  } = useForm<RemarcarFormData>();

  // Usar dados da consulta existente
  const medicoId = consulta.agenda.medico.id;
  const especialidadeId = consulta.especialidade?.id || 1; // Fallback para Clínica Geral
  
  // Queries
  const { data: diasHabilitados } = useGetDiasHabilitadosQuery(
    { 
      medicoId, 
      ano: currentMonth.getFullYear(), 
      mes: currentMonth.getMonth() + 1 
    }
  );

  // Mutations
  const [calcularHorarios] = useCalcularHorariosDisponiveisMutation();
  const [atualizarConsulta] = useAtualizarConsultaMutation();

  const watchData = watch('data');

  // Efeito para recalcular horários quando data muda
  React.useEffect(() => {
    const handleDataChange = async (data: string) => {
      if (!data) {
        setAvailableSlots([]);
        return;
      }

      try {
        const result = await calcularHorarios({
          idMedico: medicoId,
          idEspecialidade: especialidadeId,
          data: data
        }).unwrap();

        setAvailableSlots(result || []);
      } catch (error) {
        console.error('Erro ao calcular horários:', error);
        setAvailableSlots([]);
        toast.error('Erro ao carregar horários disponíveis');
      }
    };

    if (watchData) {
      handleDataChange(watchData);
    }
  }, [watchData, calcularHorarios, medicoId, especialidadeId]);

  const onSubmit = async (data: RemarcarFormData) => {
    if (!data.data || !data.hora) {
      toast.error('Por favor, selecione data e horário');
      return;
    }

    // Validar se a data não é no passado
    const selectedDate = new Date(data.data);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error('Não é possível remarcar para datas passadas');
      return;
    }
    
    // Validar antecedência mínima de 24 horas
    const now = new Date();
    const selectedDateTime = new Date(`${data.data}T${data.hora}`);
    const diffHours = (selectedDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      toast.error('Remarcação deve ser feita com pelo menos 24 horas de antecedência');
      return;
    }

    try {
      await atualizarConsulta({
        id: consulta.id,
        data: {
          dataHora: `${data.data}T${data.hora}:00.000Z`
        }
      }).unwrap();

      toast.success('Consulta remarcada com sucesso!');
      onSuccess();
      onClose();
      reset();
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

  // Gerar calendário
  const generateCalendar = () => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const isDateEnabled = (date: Date) => {
    const dayOfWeek = date.getDay();
    return diasHabilitados?.dias.includes(dayOfWeek) || false;
  };

  const isDateInCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateClick = (date: Date) => {
    if (!isDateEnabled(date) || !isDateInCurrentMonth(date)) return;
    
    const formattedDate = formatDateForInput(date);
    setSelectedData(formattedDate);
    setValue('data', formattedDate);
  };

  if (!isOpen) return null;

  const calendarDays = generateCalendar();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Remarcar Consulta</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Informações da consulta atual */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">Consulta Atual:</h3>
          <p><strong>Médico:</strong> {consulta.agenda.medico.nome}</p>
          <p><strong>Convênio:</strong> {consulta.convenio.nome}</p>
          <p><strong>Data/Hora Atual:</strong> {new Date(consulta.agenda.dtaInicial.replace('Z', '')).toLocaleString('pt-BR')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendário */}
          <div>
            <label className="block text-sm font-medium mb-2">Nova Data</label>
            
            {/* Controles do mês */}
            <div className="flex justify-between items-center mb-4">
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="btn btn-sm btn-outline"
              >
                ←
              </button>
              <h3 className="text-lg font-semibold">
                {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="btn btn-sm btn-outline"
              >
                →
              </button>
            </div>

            {/* Grid do calendário */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
                  {day}
                </div>
              ))}
              
              {calendarDays.map((date, index) => {
                const isEnabled = isDateEnabled(date);
                const isCurrentMonth = isDateInCurrentMonth(date);
                const isSelected = selectedData === formatDateForInput(date);
                const isPast = date < new Date();
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateClick(date)}
                    disabled={!isEnabled || !isCurrentMonth || isPast}
                    className={`
                      p-2 text-sm border rounded
                      ${isSelected ? 'bg-blue-500 text-white' : ''}
                      ${isEnabled && isCurrentMonth && !isPast ? 'hover:bg-blue-100 cursor-pointer border-blue-200' : ''}
                      ${!isCurrentMonth ? 'text-gray-300' : ''}
                      ${isPast || !isEnabled ? 'text-gray-400 cursor-not-allowed bg-gray-100' : ''}
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <input type="hidden" {...register('data', { required: 'Selecione uma data' })} />
            {errors.data && <p className="text-red-500 text-sm mt-1">{errors.data.message}</p>}
          </div>

          {/* Horários disponíveis */}
          <div>
            <label className="block text-sm font-medium mb-2">Novo Horário</label>
            
            {selectedData ? (
              <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                {availableSlots.length > 0 ? (
                  availableSlots
                    .filter(slot => slot.disponivel)
                    .map((slot) => {
                      const isSelected = watch('hora') === slot.hora;
                      return (
                        <label key={slot.hora} className="cursor-pointer">
                          <input
                            type="radio"
                            value={slot.hora}
                            {...register('hora', { required: 'Selecione um horário' })}
                            className="sr-only"
                          />
                          <div className={`p-2 text-center border rounded transition-all ${
                            isSelected 
                              ? 'bg-blue-500 text-white border-blue-600 shadow-md' 
                              : 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                          }`}>
                            {slot.hora}
                          </div>
                        </label>
                      );
                    })
                ) : (
                  <p className="col-span-3 text-center text-gray-500 py-4">
                    Nenhum horário disponível
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Selecione uma data para ver os horários disponíveis
              </p>
            )}

            {errors.hora && <p className="text-red-500 text-sm mt-1">{errors.hora.message}</p>}
          </div>

          {/* Botões */}
          <div className="lg:col-span-2 flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Remarcar Consulta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalRemarcarSimples;