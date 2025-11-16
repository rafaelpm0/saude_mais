import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../app/authSlice";
import type { RootState } from "../app/store";
import "./header.css";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Função de logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="navbar-wrapper">
      <input
        type="checkbox"
        id="drawer-toggle-custom"
        className="drawer-toggle-custom"
      />

      {/* Botão do drawer */}
      <label
        htmlFor="drawer-toggle-custom"
        className="drawer-label-custom"
      >
        <img src="../assets/logo.svg" alt="Logo" className="h-6 w-6" />
        <span className="drawer-toggle-text-custom">Clínica Saúde+</span>
      </label>

      {/* Drawer */}
      <div
        id="navbar-container"
        className="flex flex-col justify-between"
        style={{
          backgroundColor: "var(--color-navbar)",
        }}
      >
        <nav id="navbar">
          <ul className="flex flex-col">
            {/* Itens de navegação baseados no tipo de usuário */}
            {isAuthenticated && user && (
              <>
                {/* Itens comuns para todos os usuários */}
                <li>
                  <button onClick={() => navigate('/home')} className="drawer-button w-full text-left">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="drawer-toggle-text-custom">Início</span>
                  </button>
                </li>

                {/* Itens específicos para Pacientes (tipo 1) */}
                {user.tipo === 1 && (
                  <>
                    <li>
                      <button onClick={() => navigate('/agendamento')} className="drawer-button w-full text-left">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
                        </svg>
                        <span className="drawer-toggle-text-custom">Agendamentos</span>
                      </button>
                    </li>
                  </>
                )}

                {/* Itens específicos para Médicos (tipo 2) */}
                {user.tipo === 2 && (
                  <>
                    <li>
                      <button onClick={() => navigate('/consultas')} className="drawer-button w-full text-left">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="drawer-toggle-text-custom">Consultas</span>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => navigate('/agenda')} className="drawer-button w-full text-left">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
                        </svg>
                        <span className="drawer-toggle-text-custom">Minha Agenda</span>
                      </button>
                    </li>
                  </>
                )}

                {/* Itens específicos para Administradores (tipo 3) */}
                {user.tipo === 3 && (
                  <>
                    <li>
                      <button onClick={() => navigate('/usuarios')} className="drawer-button w-full text-left">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <span className="drawer-toggle-text-custom">Usuários</span>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => navigate('/relatorios')} className="drawer-button w-full text-left">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="drawer-toggle-text-custom">Relatórios</span>
                      </button>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
        </nav>

        {/* Seção de usuário e controles */}
        <div className="user-section">
          {/* Informações do usuário */}
          {isAuthenticated && user ? (
            <div>
              <div className="user-info">
                <span className="drawer-compact-text" title={`Olá, ${user.nome}!`}>
                  {user.nome.split(' ')[0]}
                </span>
                <span className="drawer-expanded-text">Olá, {user.nome}!</span>
              </div>
              <button
                onClick={handleLogout}
                className="logout-btn"
              >
                Sair
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={() => navigate('/login')}
                className="login-btn"
              >
                Entrar
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Header;