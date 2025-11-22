import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLoginMutation } from '../services/endpoints/auth';
import { loginSuccess } from '../app/authSlice';

interface LoginFormData {
  login: string;
  senha: string;
}

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

      // Redirecionamento baseado no tipo de usuário
      const redirectPaths = {
        1: '/agendamento', // Paciente
        2: '/medico/agenda', // Médico
        3: '/cadastros'    // Administrador
      };

      const redirectPath = redirectPaths[result.user.tipo as keyof typeof redirectPaths] || '/agendamento';
      navigate(redirectPath);
      
    } catch (error) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Erro ao fazer login';
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
            <h2 className="text-3xl font-bold text-blue-700 mb-2">Login</h2>
            <p className="text-gray-600">Clínica Saúde+</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">CPF ou Email</span>
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

            <div className="form-control mt-6 space-y-3">
              <button
                type="submit"
                className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Não tem conta?</p>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="btn btn-outline w-full"
                >
                  Cadastrar como Paciente
                </button>
              </div>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  ← Voltar à página inicial
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;