import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  useGetEspecialidadesQuery,
  useGetConveniosQuery,
  useCreateMedicoMutation,
  useUpdateMedicoMutation,
  type Medico,
  type MedicoEspecialidade
} from '../services/endpoints/admin';

interface MedicoFormData {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  login: string;
  senha: string;
  crm: string;
  especialidades: {
    especialidadeId: number;
    convenioIds: number[];
    tempoConsulta: number;
  }[];
}

interface ModalCadastroMedicoProps {
  isOpen: boolean;
  onClose: () => void;
  medico?: Medico; // Para edição
}

function ModalCadastroMedico({ isOpen, onClose, medico }: ModalCadastroMedicoProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Carregar especialidades e convênios ao abrir modal
  const { data: todasEspecialidades = [] } = useGetEspecialidadesQuery(undefined, { skip: !isOpen });
  const { data: todosConvenios = [] } = useGetConveniosQuery(undefined, { skip: !isOpen });

  const [createMedico] = useCreateMedicoMutation();
  const [updateMedico] = useUpdateMedicoMutation();

  const isEditing = !!medico;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MedicoFormData>({
    defaultValues: {
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      login: '',
      senha: '',
      crm: '',
      especialidades: [
        {
          especialidadeId: 0,
          convenioIds: [],
          tempoConsulta: 30,
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'especialidades',
  });

  // Observar mudanças nos campos para validações
  const watchedEspecialidades = watch('especialidades');

  // Carregar dados do médico para edição
  useEffect(() => {
    if (isEditing && medico && isOpen) {
      // Agrupar especialidades por especialidadeId
      const especialidadesAgrupadas = medico.especialidades.reduce((acc, item) => {
        const espId = item.especialidade.id;
        if (!acc[espId]) {
          acc[espId] = {
            especialidadeId: espId,
            convenioIds: [],
            tempoConsulta: item.tempoConsulta,
          };
        }
        acc[espId].convenioIds.push(item.convenio.id);
        return acc;
      }, {} as Record<number, MedicoEspecialidade>);

      reset({
        nome: medico.nome,
        cpf: medico.cpf,
        email: medico.email,
        telefone: medico.telefone,
        login: medico.login,
        senha: '',
        crm: medico.crm,
        especialidades: Object.values(especialidadesAgrupadas),
      });
    } else if (!isEditing && isOpen) {
      reset({
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        login: '',
        senha: '',
        crm: '',
        especialidades: [
          {
            especialidadeId: 0,
            convenioIds: [],
            tempoConsulta: 30,
          }
        ],
      });
    }
  }, [isEditing, medico, isOpen, reset]);

  // Adicionar nova especialidade
  const adicionarEspecialidade = useCallback(() => {
    append({
      especialidadeId: 0,
      convenioIds: [],
      tempoConsulta: 30,
    });
    setExpandedIndex(fields.length); // Expandir a nova especialidade
  }, [append, fields.length]);

  // Remover especialidade
  const removerEspecialidade = useCallback((index: number) => {
    if (fields.length > 1) {
      remove(index);
      if (expandedIndex === index) {
        setExpandedIndex(0);
      } else if (expandedIndex !== null && expandedIndex > index) {
        setExpandedIndex(expandedIndex - 1);
      }
    }
  }, [remove, fields.length, expandedIndex]);

  // Toggle accordion
  const toggleAccordion = useCallback((index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  }, [expandedIndex]);

  // Manipular seleção de convênios
  const handleConvenioChange = useCallback((especialidadeIndex: number, convenioId: number, checked: boolean) => {
    const currentConvenios = watchedEspecialidades[especialidadeIndex]?.convenioIds || [];
    let newConvenios;
    
    if (checked) {
      newConvenios = [...currentConvenios, convenioId];
    } else {
      newConvenios = currentConvenios.filter(id => id !== convenioId);
    }

    // Usar setValue para atualizar o campo corretamente
    setValue(`especialidades.${especialidadeIndex}.convenioIds`, newConvenios);
  }, [watchedEspecialidades, setValue]);

  const onSubmit = async (data: MedicoFormData) => {
    if (isSubmitting) return;

    // Validações customizadas
    if (data.especialidades.length === 0) {
      toast.error('Médico deve ter pelo menos uma especialidade');
      return;
    }

    for (let i = 0; i < data.especialidades.length; i++) {
      const esp = data.especialidades[i];
      const especialidadeId = Number(esp.especialidadeId);
      const tempoConsulta = Number(esp.tempoConsulta);
      
      if (!especialidadeId || especialidadeId === 0) {
        toast.error(`Selecione uma especialidade para a seção ${i + 1}`);
        return;
      }
      if (!esp.convenioIds || esp.convenioIds.length === 0) {
        toast.error(`Selecione pelo menos um convênio para a especialidade ${i + 1}`);
        return;
      }
      if (!tempoConsulta || tempoConsulta < 15) {
        toast.error(`Tempo de consulta deve ser pelo menos 15 minutos para a especialidade ${i + 1}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        especialidades: data.especialidades.map(esp => ({
          especialidadeId: Number(esp.especialidadeId),
          convenioIds: esp.convenioIds.map(id => Number(id)),
          tempoConsulta: Number(esp.tempoConsulta),
        })),
      };

      if (isEditing) {
        await updateMedico({
          id: medico.id,
          data: payload
        }).unwrap();
        toast.success('Médico atualizado com sucesso!');
      } else {
        await createMedico(payload).unwrap();
        toast.success('Médico criado com sucesso!');
      }
      
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar médico:', error);
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Erro ao salvar médico';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setExpandedIndex(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <h3 className="font-bold text-lg mb-4">
          {isEditing ? 'Editar Médico' : 'Novo Médico'}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ========== DADOS BÁSICOS ========== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nome *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered ${errors.nome ? 'input-error' : ''}`}
                {...register('nome', { required: 'Nome é obrigatório' })}
              />
              {errors.nome && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.nome.message}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">CPF *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered ${errors.cpf ? 'input-error' : ''}`}
                {...register('cpf', { required: 'CPF é obrigatório' })}
              />
              {errors.cpf && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.cpf.message}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email *</span>
              </label>
              <input
                type="email"
                className={`input input-bordered ${errors.email ? 'input-error' : ''}`}
                {...register('email', { 
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Email inválido'
                  }
                })}
              />
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email.message}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Telefone *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered ${errors.telefone ? 'input-error' : ''}`}
                {...register('telefone', { required: 'Telefone é obrigatório' })}
              />
              {errors.telefone && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.telefone.message}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Login *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered ${errors.login ? 'input-error' : ''}`}
                {...register('login', { required: 'Login é obrigatório' })}
              />
              {errors.login && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.login.message}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Senha {!isEditing && '*'}</span>
              </label>
              <input
                type="password"
                className={`input input-bordered ${errors.senha ? 'input-error' : ''}`}
                {...register('senha', { 
                  required: isEditing ? false : 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'Senha deve ter pelo menos 6 caracteres'
                  }
                })}
              />
              {errors.senha && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.senha.message}</span>
                </label>
              )}
            </div>

            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text">CRM *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered ${errors.crm ? 'input-error' : ''}`}
                {...register('crm', { required: 'CRM é obrigatório' })}
              />
              {errors.crm && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.crm.message}</span>
                </label>
              )}
            </div>
          </div>

          {/* ========== ESPECIALIDADES ========== */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Especialidades e Convênios *</h4>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={adicionarEspecialidade}
              >
                + Adicionar Especialidade
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg">
                  {/* Header do Accordion */}
                  <div
                    className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleAccordion(index)}
                  >
                    <span className="font-medium">
                      Especialidade {index + 1}
                      {(() => {
                        const especialidadeId = watchedEspecialidades[index]?.especialidadeId;
                        const especialidade = especialidadeId > 0 ? todasEspecialidades.find(e => e.id === especialidadeId) : null;
                        return especialidade ? (
                          <span className="ml-2 text-sm text-gray-600">
                            ({especialidade.descricao})
                          </span>
                        ) : null;
                      })()} 
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {fields.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-error btn-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            removerEspecialidade(index);
                          }}
                        >
                          Remover
                        </button>
                      )}
                      <span className="text-sm">
                        {expandedIndex === index ? '−' : '+'}
                      </span>
                    </div>
                  </div>

                  {/* Conteúdo do Accordion */}
                  {expandedIndex === index && (
                    <div className="p-4 border-t border-gray-200 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Especialidade *</span>
                          </label>
                          <select
                            className={`select select-bordered ${
                              errors.especialidades?.[index]?.especialidadeId ? 'select-error' : ''
                            }`}
                            {...register(`especialidades.${index}.especialidadeId` as const, {
                              required: 'Especialidade é obrigatória',
                              validate: (value) => {
                                const numValue = Number(value);
                                return numValue > 0 || 'Selecione uma especialidade';
                              }
                            })}
                          >
                            <option value={0}>Selecione uma especialidade</option>
                            {todasEspecialidades.map((esp) => (
                              <option key={esp.id} value={esp.id}>
                                {esp.descricao}
                              </option>
                            ))}
                          </select>
                          {errors.especialidades?.[index]?.especialidadeId && (
                            <label className="label">
                              <span className="label-text-alt text-error">
                                {errors.especialidades[index]?.especialidadeId?.message}
                              </span>
                            </label>
                          )}
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Tempo Consulta (min) *</span>
                          </label>
                          <input
                            type="number"
                            min="15"
                            max="120"
                            className={`input input-bordered ${
                              errors.especialidades?.[index]?.tempoConsulta ? 'input-error' : ''
                            }`}
                            {...register(`especialidades.${index}.tempoConsulta` as const, {
                              required: 'Tempo é obrigatório',
                              validate: (value) => {
                                const numValue = Number(value);
                                if (numValue < 15) return 'Mínimo 15 minutos';
                                if (numValue > 120) return 'Máximo 120 minutos';
                                return true;
                              }
                            })}
                          />
                          {errors.especialidades?.[index]?.tempoConsulta && (
                            <label className="label">
                              <span className="label-text-alt text-error">
                                {errors.especialidades[index]?.tempoConsulta?.message}
                              </span>
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Convênios */}
                      <div>
                        <label className="label">
                          <span className="label-text">Convênios Aceitos *</span>
                        </label>
                        <div className="border border-gray-200 rounded p-3 max-h-40 overflow-y-auto bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {todosConvenios.map((convenio) => {
                              const isSelected = watchedEspecialidades[index]?.convenioIds?.includes(convenio.id) || false;
                              return (
                                <label 
                                  key={convenio.id} 
                                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                                    isSelected 
                                      ? 'bg-primary/10 border border-primary/20' 
                                      : 'hover:bg-gray-100 border border-transparent'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary checkbox-sm"
                                    checked={isSelected}
                                    onChange={(e) => handleConvenioChange(index, convenio.id, e.target.checked)}
                                  />
                                  <span className={`text-sm ${isSelected ? 'font-medium text-primary' : ''}`}>
                                    {convenio.nome}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                          {watchedEspecialidades[index]?.convenioIds?.length === 0 && (
                            <p className="text-xs text-gray-500 mt-2 text-center">
                              Selecione pelo menos um convênio
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalCadastroMedico;