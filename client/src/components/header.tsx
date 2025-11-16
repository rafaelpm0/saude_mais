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
        <div className="icon-container">
          <img src="../assets/logo.svg" alt="Logo" style={{width: '24px', height: '24px'}} />
        </div>
        <span className="drawer-toggle-text-custom">Clínica Saúde+</span>
      </label>

      {/* Overlay para mobile */}
      <label 
        htmlFor="drawer-toggle-custom" 
        className="navbar-overlay"
        aria-label="Fechar menu"
      ></label>

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

                {/* Itens específicos para Pacientes (tipo 1) */}
                {user.tipo === 1 && (
                  <>
                    <li>
                      <button onClick={() => navigate('/agendamento')} className="drawer-button">
                        <div className="icon-container">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
                          </svg>
                        </div>
                        <span className="drawer-toggle-text-custom">Agendamentos</span>
                      </button>
                    </li>
                  </>
                )}

                {/* Itens específicos para Médicos (tipo 2) */}
                {user.tipo === 2 && (
                  <>
                    <li>
                      <button onClick={() => navigate('/consultas')} className="drawer-button">
                        <div className="icon-container">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span className="drawer-toggle-text-custom">Consultas</span>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => navigate('/agenda')} className="drawer-button">
                        <div className="icon-container">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
                          </svg>
                        </div>
                        <span className="drawer-toggle-text-custom">Minha Agenda</span>
                      </button>
                    </li>
                  </>
                )}

                {/* Itens específicos para Administradores (tipo 3) */}
                {user.tipo === 3 && (
                  <>
                    <li>
                      <button onClick={() => navigate('/cadastros')} className="drawer-button">
                        <div className="icon-container">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <span className="drawer-toggle-text-custom">Cadastros</span>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => navigate('/bloqueio-usuarios')} className="drawer-button">
                        <div className="icon-container">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <span className="drawer-toggle-text-custom">Bloqueio de Usuários</span>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => navigate('/relatorios')} className="drawer-button">
                        <div className="icon-container">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
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