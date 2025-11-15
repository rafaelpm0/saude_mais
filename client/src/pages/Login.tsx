import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useLoginMutation } from '../services/endpoints/auth';
import { loginSuccess } from '../app/authSlice';

interface LoginFormData {
  login: string;
  senha: string;
}

function Login() {
  const dispatch = useDispatch();
  const [loginMutation, { isLoading }] = useLoginMutation();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginMutation(data).unwrap();
      
      // Debug: verificar se os dados estão corretos
      console.log('Dados do login:', result.user);
      
      dispatch(loginSuccess({
        user: result.user,
        token: result.access_token,
      }));
      
      toast.success(`Bem-vindo(a), ${result.user.nome}! Você está logado como ${result.user.nomeTipo}.`, {
        position: "top-right",
        autoClose: 4000,
      });
      
    } catch (error) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Erro ao fazer login';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-center text-2xl font-bold mb-6">Login</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">CPF ou Email</span>
              </label>
              <input
                type="text"
                placeholder="Digite seu CPF ou email"
                className={`input input-bordered w-full ${
                  errors.login ? 'input-error' : ''
                }`}
                {...register('login', {
                  required: 'CPF ou email é obrigatório',
                })}
              />
              {errors.login && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.login.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Senha</span>
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

            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;