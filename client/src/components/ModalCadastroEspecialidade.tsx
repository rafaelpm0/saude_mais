import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  useCreateEspecialidadeMutation, 
  useUpdateEspecialidadeMutation,
  type Especialidade 
} from '../services/endpoints/admin';

interface EspecialidadeFormData {
  descricao: string;
}

interface ModalCadastroEspecialidadeProps {
  isOpen: boolean;
  onClose: () => void;
  especialidade?: Especialidade; // Para edição
}

function ModalCadastroEspecialidade({ isOpen, onClose, especialidade }: ModalCadastroEspecialidadeProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [createEspecialidade] = useCreateEspecialidadeMutation();
  const [updateEspecialidade] = useUpdateEspecialidadeMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EspecialidadeFormData>({
    defaultValues: {
      descricao: especialidade?.descricao || '',
    },
  });

  const isEditing = !!especialidade;

  const onSubmit = async (data: EspecialidadeFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateEspecialidade({
          id: especialidade.id,
          data: { descricao: data.descricao }
        }).unwrap();
        toast.success('Especialidade atualizada com sucesso!');
      } else {
        await createEspecialidade({ descricao: data.descricao }).unwrap();
        toast.success('Especialidade criada com sucesso!');
      }
      
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar especialidade:', error);
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Erro ao salvar especialidade';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">
          {isEditing ? 'Editar Especialidade' : 'Nova Especialidade'}
        </h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Descrição *</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Cardiologia"
              className={`input input-bordered w-full ${errors.descricao ? 'input-error' : ''}`}
              {...register('descricao', {
                required: 'Descrição é obrigatória',
                minLength: {
                  value: 2,
                  message: 'Descrição deve ter pelo menos 2 caracteres'
                }
              })}
            />
            {errors.descricao && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.descricao.message}</span>
              </label>
            )}
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

export default ModalCadastroEspecialidade;