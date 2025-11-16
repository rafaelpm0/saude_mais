import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { DataTable } from '../components/ui/DataTable';
import { useDebounce } from '../hooks/useDebounce';
import {
  useGetUsuariosQuery,
  useResetarFaltasUsuarioMutation,
  type Usuario
} from '../services/endpoints/admin';

function BloqueioUsuarios() {
  // ========== STATES ==========
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCpf, setFiltroCpf] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  // Modal de confirmação
  const [confirmReset, setConfirmReset] = useState<{
    isOpen: boolean;
    usuario: Usuario | null;
  }>({ isOpen: false, usuario: null });

  // ========== DEBOUNCED FILTERS ==========
  const debouncedFiltroNome = useDebounce(filtroNome, 500);
  const debouncedFiltroCpf = useDebounce(filtroCpf, 500);

  // ========== QUERIES ==========
  const { data: usuarios = [], isLoading } = useGetUsuariosQuery();
  const [resetarFaltas] = useResetarFaltasUsuarioMutation();

  // ========== FILTERED DATA ==========
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(usuario => {
      const matchNome = !debouncedFiltroNome || 
        usuario.nome.toLowerCase().includes(debouncedFiltroNome.toLowerCase());
      const matchCpf = !debouncedFiltroCpf || 
        usuario.cpf.includes(debouncedFiltroCpf);
      const matchStatus = !filtroStatus || 
        (filtroStatus === 'Bloqueado' && usuario.status === 'Bloqueado') ||
        (filtroStatus === 'Normal' && usuario.status === 'Normal');
      
      return matchNome && matchCpf && matchStatus;
    });
  }, [usuarios, debouncedFiltroNome, debouncedFiltroCpf, filtroStatus]);

  // ========== HANDLERS ==========
  const handleResetarFaltas = async (usuario: Usuario) => {
    setConfirmReset({ isOpen: true, usuario });
  };

  const confirmarReset = async () => {
    if (!confirmReset.usuario) return;

    try {
      await resetarFaltas(confirmReset.usuario.id).unwrap();
      toast.success(`Faltas de ${confirmReset.usuario.nome} foram resetadas com sucesso!`);
      setConfirmReset({ isOpen: false, usuario: null });
    } catch (error) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Erro ao resetar faltas';
      toast.error(errorMessage);
    }
  };

  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroCpf('');
    setFiltroStatus('');
  };

  const temFiltros = filtroNome || filtroCpf || filtroStatus;

  // ========== TABLE COLUMNS ==========
  const colunas = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nome', accessor: 'nome' },
    { header: 'CPF', accessor: 'cpf' },
    { header: 'Email', accessor: 'email' },
    { header: 'Tipo', accessor: 'tipoDescricao' },
    { 
      header: 'Faltas', 
      accessor: 'faltasConsecutivas',
      render: (_: unknown, rowData: Usuario) => (
        <span className={`badge ${rowData.faltasConsecutivas >= 3 ? 'badge-error' : 'badge-success'} badge-sm`}>
          {rowData.faltasConsecutivas}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (_: unknown, rowData: Usuario) => (
        <span className={`badge ${rowData.status === 'Bloqueado' ? 'badge-error' : 'badge-success'} badge-sm`}>
          {rowData.status}
        </span>
      )
    },
    {
      header: 'Ações',
      accessor: 'acoes',
      render: (_: unknown, rowData: Usuario) => (
        <div className="flex gap-2">
          {rowData.faltasConsecutivas >= 3 && (
            <button
              className="btn btn-sm btn-warning"
              onClick={() => handleResetarFaltas(rowData)}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              Desbloquear
            </button>
          )}
        </div>
      )
    }
  ];

  // ========== SKELETON LOADING ==========
  const SkeletonTable = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="admin-container container mx-auto p-3 sm:p-4 lg:p-6 max-w-full">
      {/* Header */}
      <div className="admin-header mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Bloqueio de Usuários
        </h1>
        <p className="text-sm text-gray-600 mt-1 mb-4">
          Gerencie usuários bloqueados por faltas consecutivas
        </p>
      </div>

      {/* Card Principal */}
      <div className="admin-card card bg-base-100 shadow-lg border border-gray-200">
        <div className="card-body p-4 sm:p-6">
          {/* Header da seção */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <div>
              <h2 className="card-title text-lg sm:text-xl flex items-center">
                <svg className="w-5 h-5 mr-2 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Usuários do Sistema
              </h2>
              <p className="admin-counter text-xs text-gray-500 mt-1">
                {usuariosFiltrados.length} usuário{usuariosFiltrados.length !== 1 ? 's' : ''} encontrado{usuariosFiltrados.length !== 1 ? 's' : ''}
                {filtroStatus === 'Bloqueado' && ` (${usuariosFiltrados.filter(u => u.status === 'Bloqueado').length} bloqueado${usuariosFiltrados.filter(u => u.status === 'Bloqueado').length !== 1 ? 's' : ''})`}
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="relative mb-4">
            {temFiltros && (
              <button
                onClick={limparFiltros}
                className="absolute -top-1 right-0 badge badge-error badge-xs cursor-pointer hover:badge-error z-10 transition-transform hover:scale-110 p-2"
                title="Limpar filtros"
              >
                <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpar filtros
              </button>
            )}
            <div className="admin-filters bg-gray-50 p-3 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="admin-label label-text text-xs font-medium">Nome</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Filtrar por nome..."
                    className="admin-filter-input admin-input input input-bordered input-sm"
                    value={filtroNome}
                    onChange={(e) => setFiltroNome(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label py-1">
                    <span className="admin-label label-text text-xs font-medium">CPF</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Filtrar por CPF..."
                    className="admin-filter-input admin-input input input-bordered input-sm"
                    value={filtroCpf}
                    onChange={(e) => setFiltroCpf(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label py-1">
                    <span className="admin-label label-text text-xs font-medium">Status</span>
                  </label>
                  <select
                    className="admin-filter-input admin-input select select-bordered select-sm w-full"
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                  >
                    <option value="">Todos os status</option>
                    <option value="Normal">Normal</option>
                    <option value="Bloqueado">Bloqueado</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="admin-table-container">
            {isLoading ? (
              <div className="admin-skeleton">
                <SkeletonTable />
              </div>
            ) : (
              <DataTable
                data={usuariosFiltrados}
                columns={colunas}
                isLoading={isLoading}
                lineColor={(rowData: Usuario) => 
                  rowData.status === 'Bloqueado' ? '#fef2f2' : 'transparent'
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {confirmReset.isOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <svg className="w-6 h-6 text-warning mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Confirmar Desbloqueio
            </h3>
            <p className="mb-6">
              Deseja realmente resetar as faltas consecutivas de{' '}
              <strong>{confirmReset.usuario?.nome}</strong>?
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Esta ação irá zerar o contador de faltas consecutivas de{' '}
              <strong>{confirmReset.usuario?.faltasConsecutivas}</strong> para{' '}
              <strong>0</strong>, desbloqueando o usuário.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setConfirmReset({ isOpen: false, usuario: null })}
              >
                Cancelar
              </button>
              <button
                className="btn btn-warning"
                onClick={confirmarReset}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                Confirmar Desbloqueio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BloqueioUsuarios;