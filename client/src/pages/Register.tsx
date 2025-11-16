import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../services/endpoints/auth';

interface RegisterFormData {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
}

function Register() {
  const navigate = useNavigate();
  const [registerMutation, { isLoading }] = useRegisterMutation();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const senha = watch('senha');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmarSenha, ...registerData } = data;
      await registerMutation({
        ...registerData,
        tipo: 1, // Paciente
      }).unwrap();
      
      toast.success('Cadastro realizado com sucesso! Faça login para continuar.', {
        position: "top-right",
        autoClose: 4000,
      });
      
      navigate('/login');
      
    } catch (error) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Erro ao realizar cadastro';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="card w-full max-w-md bg-white shadow-2xl">
        <div className="card-body">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-blue-700 mb-2">Cadastro de Paciente</h2>
            <p className="text-gray-600">Clínica Saúde+</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Nome Completo</span>
              </label>
              <input
                type="text"
                placeholder="Digite seu nome completo"
                className={`input input-bordered w-full ${
                  errors.nome ? 'input-error' : ''
                }`}
                {...register('nome', {
                  required: 'Nome é obrigatório',
                  minLength: {
                    value: 2,
                    message: 'Nome deve ter pelo menos 2 caracteres',
                  },
                })}
              />
              {errors.nome && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.nome.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">CPF</span>
              </label>
              <input
                type="text"
                placeholder="000.000.000-00"
                className={`input input-bordered w-full ${
                  errors.cpf ? 'input-error' : ''
                }`}
                {...register('cpf', {
                  required: 'CPF é obrigatório',
                  pattern: {
                    value: /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
                    message: 'CPF inválido',
                  },
                })}
              />
              {errors.cpf && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.cpf.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                className={`input input-bordered w-full ${
                  errors.email ? 'input-error' : ''
                }`}
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email inválido',
                  },
                })}
              />
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.email.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Telefone</span>
              </label>
              <input
                type="tel"
                placeholder="(00) 00000-0000"
                className={`input input-bordered w-full ${
                  errors.telefone ? 'input-error' : ''
                }`}
                {...register('telefone', {
                  required: 'Telefone é obrigatório',
                  pattern: {
                    value: /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/,
                    message: 'Telefone inválido',
                  },
                })}
              />
              {errors.telefone && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.telefone.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Senha</span>
              </label>
              <input
                type="password"
                placeholder="Digite sua senha"
                className={`input input-bordered w-full ${
                  errors.senha ? 'input-error' : ''
                }`}
                {...register('senha', {
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 8,
                    message: 'Senha deve ter pelo menos 8 caracteres',
                  },
                  maxLength: {
                    value: 20,
                    message: 'Senha deve ter no máximo 20 caracteres',
                  },
                })}
              />
              {errors.senha && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.senha.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Confirmar Senha</span>
              </label>
              <input
                type="password"
                placeholder="Confirme sua senha"
                className={`input input-bordered w-full ${
                  errors.confirmarSenha ? 'input-error' : ''
                }`}
                {...register('confirmarSenha', {
                  required: 'Confirmação de senha é obrigatória',
                  validate: value => value === senha || 'Senhas não coincidem',
                })}
              />
              {errors.confirmarSenha && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.confirmarSenha.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control mt-6 space-y-3">
              <button
                type="submit"
                className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-outline w-full"
              >
                Voltar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;