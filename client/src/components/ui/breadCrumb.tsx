import { Link, useLocation } from "react-router-dom";

function BreadCrumb() {
  const location = useLocation();

  // Função para obter nomes mais amigáveis das rotas
  const getRouteName = (routePath: string) => {
    const routeNames: { [key: string]: string } = {
      'cadastros': 'Cadastros Administrativos',
      'agendamento': 'Agendamentos',
      'consultas': 'Consultas',
      'agenda': 'Minha Agenda',
      'usuarios': 'Usuários',
      'bloqueio-usuarios': 'Bloqueio de Usuários',
      'relatorios': 'Relatórios',
      'login': 'Login',
      'register': 'Cadastro'
    };
    
    return routeNames[routePath] || routePath.charAt(0).toUpperCase() + routePath.slice(1);
  };

  // Função para truncar texto em dispositivos móveis
  const truncateText = (text: string, maxLength: number = 12) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Divide a rota atual em partes
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Se não há pathnames, não mostrar breadcrumb
  if (pathnames.length === 0) {
    return null;
  }

  return (
    <div className="breadcrumbs text-sm bg-base-200 px-2 sm:px-4 py-2 overflow-hidden">
      <ul className="flex-wrap gap-1">
        {/* Home/Início - Responsivo */}
        <li className="shrink-0">
          <Link to="/" className="hover:text-primary transition-colors duration-200 flex items-center">
            <span className="hidden sm:inline">Início</span>
            <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
        </li>

        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const displayName = getRouteName(value);

          return (
            <li key={to} className="max-w-[120px] sm:max-w-none shrink-0">
              {isLast ? (
                <span 
                  className="text-primary font-medium block truncate cursor-default" 
                  title={displayName}
                >
                  <span className="hidden sm:inline">{displayName}</span>
                  <span className="inline sm:hidden">{truncateText(displayName, 10)}</span>
                </span>
              ) : (
                <Link 
                  to={to} 
                  className="hover:text-primary transition-colors duration-200 block truncate" 
                  title={displayName}
                >
                  <span className="hidden sm:inline">{displayName}</span>
                  <span className="inline sm:hidden">{truncateText(displayName, 8)}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default BreadCrumb;