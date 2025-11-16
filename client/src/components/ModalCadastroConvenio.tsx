import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  useCreateConvenioMutation, 
  useUpdateConvenioMutation,
  type Convenio 
} from '../services/endpoints/admin';

interface ConvenioFormData {
  nome: string;
}

interface ModalCadastroConvenioProps {
  isOpen: boolean;
  onClose: () => void;
  convenio?: Convenio; // Para edição
}

function ModalCadastroConvenio({ isOpen, onClose, convenio }: ModalCadastroConvenioProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [createConvenio] = useCreateConvenioMutation();
  const [updateConvenio] = useUpdateConvenioMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConvenioFormData>({
    defaultValues: {
      nome: convenio?.nome || '',
    },
  });

  const isEditing = !!convenio;

  const onSubmit = async (data: ConvenioFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateConvenio({
          id: convenio.id,
          data: { nome: data.nome }
        }).unwrap();
        toast.success('Convênio atualizado com sucesso!');
      } else {
        await createConvenio({ nome: data.nome }).unwrap();
        toast.success('Convênio criado com sucesso!');
      }
      
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar convênio:', error);
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Erro ao salvar convênio';
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
          {isEditing ? 'Editar Convênio' : 'Novo Convênio'}
        </h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Nome *</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Unimed"
              className={`input input-bordered w-full ${errors.nome ? 'input-error' : ''}`}
              {...register('nome', {
                required: 'Nome é obrigatório',
                minLength: {
                  value: 2,
                  message: 'Nome deve ter pelo menos 2 caracteres'
                }
              })}
            />
            {errors.nome && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.nome.message}</span>
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

export default ModalCadastroConvenio;