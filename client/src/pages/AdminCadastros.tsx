import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { DataTable } from '../components/ui/DataTable';
import ModalCadastroEspecialidade from '../components/ModalCadastroEspecialidade';
import ModalCadastroConvenio from '../components/ModalCadastroConvenio';
import ModalCadastroMedico from '../components/ModalCadastroMedico';
import { useDebounce } from '../hooks/useDebounce';
import {
  useGetEspecialidadesQuery,
  useGetConveniosQuery,
  useGetMedicosQuery,
  useDeleteEspecialidadeMutation,
  useDeleteConvenioMutation,
  useDeleteMedicoMutation,
  type Especialidade,
  type Convenio,
  type Medico
} from '../services/endpoints/admin';
import './AdminCadastros.css';

type CategoriaAtiva = 'medicos' | 'especialidades' | 'convenios';

function AdminCadastros() {
  // ========== ESTADOS ==========
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaAtiva>('medicos');
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('');
  const [filtroConvenio, setFiltroConvenio] = useState('');
  const [filtroMedicoNome, setFiltroMedicoNome] = useState('');
  const [filtroMedicoCrm, setFiltroMedicoCrm] = useState('');
  const [filtroMedicoEspecialidade, setFiltroMedicoEspecialidade] = useState('');

  // Modais
  const [modalEspecialidade, setModalEspecialidade] = useState<{
    isOpen: boolean;
    especialidade?: Especialidade;
  }>({ isOpen: false });
  
  const [modalConvenio, setModalConvenio] = useState<{
    isOpen: boolean;
    convenio?: Convenio;
  }>({ isOpen: false });

  const [modalMedico, setModalMedico] = useState<{
    isOpen: boolean;
    medico?: Medico;
  }>({ isOpen: false });

  // Modal de confirmação de exclusão
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    type: 'medico' | 'especialidade' | 'convenio' | null;
    item: any;
    onConfirm: (() => void) | null;
  }>({ isOpen: false, type: null, item: null, onConfirm: null });

  // ========== UTILITY FUNCTIONS ==========
  /**
   * Filtra especialidades únicas de um médico para evitar duplicação na exibição
   */
  const getEspecialidadesUnicas = (especialidades: Medico['especialidades']) => {
    return especialidades.reduce((acc, esp) => {
      const jaExiste = acc.find(e => e.especialidade.id === esp.especialidade.id);
      if (!jaExiste) {
        acc.push(esp);
      }
      return acc;
    }, [] as typeof especialidades);
  };

  // ========== DEBOUNCED FILTERS ==========
  const debouncedFiltroEspecialidade = useDebounce(filtroEspecialidade, 500);
  const debouncedFiltroConvenio = useDebounce(filtroConvenio, 500);
  const debouncedFiltroMedicoNome = useDebounce(filtroMedicoNome, 500);
  const debouncedFiltroMedicoCrm = useDebounce(filtroMedicoCrm, 500);

  // ========== QUERIES ==========
  const { data: especialidades = [], isLoading: loadingEspecialidades } = useGetEspecialidadesQuery();
  const { data: convenios = [], isLoading: loadingConvenios } = useGetConveniosQuery();
  const { data: medicos = [], isLoading: loadingMedicos } = useGetMedicosQuery();

  // ========== MUTATIONS ==========
  const [deleteEspecialidade] = useDeleteEspecialidadeMutation();
  const [deleteConvenio] = useDeleteConvenioMutation();
  const [deleteMedico] = useDeleteMedicoMutation();

  // ========== DADOS FILTRADOS ==========
  const especialidadesFiltradas = useMemo(() => {
    if (!debouncedFiltroEspecialidade) return especialidades;
    return especialidades.filter(esp => 
      esp.descricao.toLowerCase().includes(debouncedFiltroEspecialidade.toLowerCase())
    );
  }, [especialidades, debouncedFiltroEspecialidade]);

  const conveniosFiltrados = useMemo(() => {
    if (!debouncedFiltroConvenio) return convenios;
    return convenios.filter(conv => 
      conv.nome.toLowerCase().includes(debouncedFiltroConvenio.toLowerCase())
    );
  }, [convenios, debouncedFiltroConvenio]);

  const medicosFiltrados = useMemo(() => {
    let resultado = medicos;

    if (debouncedFiltroMedicoNome) {
      resultado = resultado.filter(medico => 
        medico.nome.toLowerCase().includes(debouncedFiltroMedicoNome.toLowerCase())
      );
    }

    if (debouncedFiltroMedicoCrm) {
      resultado = resultado.filter(medico => 
        medico.crm.toLowerCase().includes(debouncedFiltroMedicoCrm.toLowerCase())
      );
    }

    if (filtroMedicoEspecialidade) {
      resultado = resultado.filter(medico => 
        medico.especialidades.some(esp => 
          esp.especialidade.id.toString() === filtroMedicoEspecialidade
        )
      );
    }

    return resultado;
  }, [medicos, debouncedFiltroMedicoNome, debouncedFiltroMedicoCrm, filtroMedicoEspecialidade]);

  // ========== HANDLERS ==========
  const limparFiltrosMedicos = () => {
    setFiltroMedicoNome('');
    setFiltroMedicoCrm('');
    setFiltroMedicoEspecialidade('');
  };

  const limparFiltroEspecialidade = () => {
    setFiltroEspecialidade('');
  };

  const limparFiltroConvenio = () => {
    setFiltroConvenio('');
  };

  const temFiltrosMedicos = filtroMedicoNome || filtroMedicoCrm || filtroMedicoEspecialidade;
  const temFiltroEspecialidade = filtroEspecialidade;
  const temFiltroConvenio = filtroConvenio;

  const handleDeleteEspecialidade = (especialidade: Especialidade) => {
    setConfirmDelete({
      isOpen: true,
      type: 'especialidade',
      item: especialidade,
      onConfirm: async () => {
        try {
          await deleteEspecialidade(especialidade.id).unwrap();
          toast.success('Especialidade excluída com sucesso!');
          setConfirmDelete({ isOpen: false, type: null, item: null, onConfirm: null });
        } catch (error: any) {
          console.error('Erro ao excluir especialidade:', error);
          let errorMessage = 'Erro ao excluir especialidade.';
          
          if (error?.data?.message) {
            errorMessage = error.data.message;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (error?.status === 400) {
            errorMessage = 'Não é possível excluir esta especialidade pois há médicos ou movimentos associados.';
          }
          
          toast.error(errorMessage);
        }
      }
    });
  };

  const handleDeleteConvenio = (convenio: Convenio) => {
    setConfirmDelete({
      isOpen: true,
      type: 'convenio',
      item: convenio,
      onConfirm: async () => {
        try {
          await deleteConvenio(convenio.id).unwrap();
          toast.success('Convênio excluído com sucesso!');
          setConfirmDelete({ isOpen: false, type: null, item: null, onConfirm: null });
        } catch (error: any) {
          console.error('Erro ao excluir convênio:', error);
          let errorMessage = 'Erro ao excluir convênio.';
          
          if (error?.data?.message) {
            errorMessage = error.data.message;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (error?.status === 400) {
            errorMessage = 'Não é possível excluir este convênio pois há médicos ou consultas associadas.';
          }
          
          toast.error(errorMessage);
        }
      }
    });
  };

  const handleDeleteMedico = (medico: Medico) => {
    setConfirmDelete({
      isOpen: true,
      type: 'medico',
      item: medico,
      onConfirm: async () => {
        try {
          await deleteMedico(medico.id).unwrap();
          toast.success('Médico excluído com sucesso!');
          setConfirmDelete({ isOpen: false, type: null, item: null, onConfirm: null });
        } catch (error: any) {
          console.error('Erro ao excluir médico:', error);
          let errorMessage = 'Erro ao excluir médico.';
          
          if (error?.data?.message) {
            errorMessage = error.data.message;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (error?.status === 400) {
            errorMessage = 'Não é possível excluir este médico pois há consultas agendadas ou histórico de atendimentos.';
          }
          
          toast.error(errorMessage);
        }
      }
    });
  };

  // ========== COLUNAS DAS TABELAS ==========
  const colunasEspecialidades = [
    { header: 'ID', accessor: 'id' },
    { header: 'Descrição', accessor: 'descricao' },
    {
      header: 'Ações',
      accessor: 'acoes',
      render: (_: unknown, rowData: Especialidade) => (
        <div className="admin-actions flex gap-2">
          <button
            className="admin-action-btn btn btn-sm btn-primary"
            onClick={() => setModalEspecialidade({ isOpen: true, especialidade: rowData })}
          >
            Editar
          </button>
          <button
            className="admin-action-btn btn btn-sm btn-error"
            onClick={() => handleDeleteEspecialidade(rowData)}
          >
            Excluir
          </button>
        </div>
      ),
    },
  ];

  const colunasConvenios = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nome', accessor: 'nome' },
    {
      header: 'Ações',
      accessor: 'acoes',
      render: (_: unknown, rowData: Convenio) => (
        <div className="admin-actions flex gap-2">
          <button
            className="admin-action-btn btn btn-sm btn-primary"
            onClick={() => setModalConvenio({ isOpen: true, convenio: rowData })}
          >
            Editar
          </button>
          <button
            className="admin-action-btn btn btn-sm btn-error"
            onClick={() => handleDeleteConvenio(rowData)}
          >
            Excluir
          </button>
        </div>
      ),
    },
  ];

  const colunasMedicos = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nome', accessor: 'nome' },
    { header: 'CRM', accessor: 'crm' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Especialidades',
      accessor: 'especialidades',
      render: (_: unknown, rowData: Medico) => {
        const especialidadesUnicas = getEspecialidadesUnicas(rowData.especialidades);

        return (
          <div className="flex flex-wrap gap-1">
            {especialidadesUnicas.map((esp, index) => (
              <span key={index} className="admin-badge badge badge-primary badge-sm">
                {esp.especialidade.descricao}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      header: 'Ações',
      accessor: 'acoes',
      render: (_: unknown, rowData: Medico) => (
        <div className="admin-actions flex gap-2">
          <button
            className="admin-action-btn btn btn-sm btn-primary"
            onClick={() => setModalMedico({ isOpen: true, medico: rowData })}
          >
            Editar
          </button>
          <button
            className="admin-action-btn btn btn-sm btn-error"
            onClick={() => handleDeleteMedico(rowData)}
          >
            Excluir
          </button>
        </div>
      ),
    },
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
      {/* Header responsivo */}
      <div className="admin-header mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Cadastros Administrativos
        </h1>
        <p className="text-sm text-gray-600 mt-1 mb-4">
          Gerencie especialidades, convênios e médicos do sistema
        </p>
        
        {/* Seletor de categorias */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            className={`btn btn-sm transition-all duration-200 ${
              categoriaAtiva === 'medicos'
                ? 'btn-primary shadow-md'
                : 'btn-outline btn-primary hover:btn-primary'
            }`}
            onClick={() => setCategoriaAtiva('medicos')}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Médicos
            <span className="badge badge-sm ml-1">{medicosFiltrados.length}</span>
          </button>
          <button
            className={`btn btn-sm transition-all duration-200 ${
              categoriaAtiva === 'especialidades'
                ? 'btn-secondary shadow-md'
                : 'btn-outline btn-secondary hover:btn-secondary'
            }`}
            onClick={() => setCategoriaAtiva('especialidades')}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Especialidades
            <span className="badge badge-sm ml-1">{especialidadesFiltradas.length}</span>
          </button>
          <button
            className={`btn btn-sm transition-all duration-200 ${
              categoriaAtiva === 'convenios'
                ? 'btn-accent shadow-md'
                : 'btn-outline btn-accent hover:btn-accent'
            }`}
            onClick={() => setCategoriaAtiva('convenios')}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Convênios
            <span className="badge badge-sm ml-1">{conveniosFiltrados.length}</span>
          </button>
        </div>
      </div> 
      
      {/* Renderização condicional baseada na categoria ativa */}
      <div className="w-full max-w-6xl">
        {/* ========== MÉDICOS ========== */}
        {categoriaAtiva === 'medicos' && (
          <div className="admin-card card bg-base-100 shadow-lg border border-gray-200">
            <div className="card-body p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <div>
                  <h2 className="card-title text-lg sm:text-xl flex items-center">
                    <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Médicos
                  </h2>
                  <p className="admin-counter text-xs text-gray-500 mt-1">
                    {medicosFiltrados.length} médico{medicosFiltrados.length !== 1 ? 's' : ''} encontrado{medicosFiltrados.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  className="admin-button btn btn-primary btn-sm sm:btn-md flex-shrink-0"
                  onClick={() => setModalMedico({ isOpen: true })}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Adicionar Médico
                </button>
              </div>

              {/* Filtros responsivos com badge limpar */}
              <div className="relative mb-4">
                {temFiltrosMedicos && (
                  <button
                    onClick={limparFiltrosMedicos}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="admin-label label-text text-xs font-medium">Nome</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Buscar por nome..."
                      className="admin-filter-input admin-input input input-bordered input-sm w-full"
                      value={filtroMedicoNome}
                      onChange={(e) => setFiltroMedicoNome(e.target.value)}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="admin-label label-text text-xs font-medium">CRM</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Buscar por CRM..."
                      className="admin-filter-input admin-input input input-bordered input-sm w-full"
                      value={filtroMedicoCrm}
                      onChange={(e) => setFiltroMedicoCrm(e.target.value)}
                    />
                  </div>
                  <div className="form-control sm:col-span-2 lg:col-span-1">
                    <label className="label py-1">
                      <span className="admin-label label-text text-xs font-medium">Especialidade</span>
                    </label>
                    <select
                      className="admin-filter-input admin-input select select-bordered select-sm w-full"
                      value={filtroMedicoEspecialidade}
                      onChange={(e) => setFiltroMedicoEspecialidade(e.target.value)}
                    >
                      <option value="">Todas especialidades</option>
                      {especialidades.map((esp) => (
                        <option key={esp.id} value={esp.id.toString()}>
                          {esp.descricao}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              </div>

              <div className="admin-table-container">
                {loadingMedicos ? (
                  <div className="admin-skeleton">
                    <SkeletonTable />
                  </div>
                ) : (
                  <DataTable
                    data={medicosFiltrados}
                    columns={colunasMedicos}
                    isLoading={loadingMedicos}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========== ESPECIALIDADES ========== */}
        {categoriaAtiva === 'especialidades' && (
          <div className="admin-card card bg-base-100 shadow-lg border border-gray-200">
            <div className="card-body p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <div>
                  <h2 className="card-title text-lg sm:text-xl flex items-center">
                    <svg className="w-5 h-5 mr-2 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Especialidades
                  </h2>
                  <p className="admin-counter text-xs text-gray-500 mt-1">
                    {especialidadesFiltradas.length} especialidade{especialidadesFiltradas.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  className="admin-button btn btn-secondary btn-sm sm:btn-md flex-shrink-0"
                  onClick={() => setModalEspecialidade({ isOpen: true })}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Adicionar Especialidade
                </button>
              </div>

              {/* Filtro com badge limpar */}
              <div className="relative mb-4">
                {temFiltroEspecialidade && (
                  <button
                    onClick={limparFiltroEspecialidade}
                    className="absolute -top-1 right-0 badge badge-error badge-xs cursor-pointer hover:badge-error z-10 transition-transform hover:scale-110 p-2"
                    title="Limpar filtro"
                  >
                    <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Limpar filtro
                  </button>
                )}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="admin-label label-text text-xs font-medium">Buscar Especialidade</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Filtrar por descrição..."
                    className="admin-filter-input admin-input input input-bordered input-sm"
                    value={filtroEspecialidade}
                    onChange={(e) => setFiltroEspecialidade(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-table-container">
                {loadingEspecialidades ? (
                  <div className="admin-skeleton">
                    <SkeletonTable />
                  </div>
                ) : (
                  <DataTable
                    data={especialidadesFiltradas}
                    columns={colunasEspecialidades}
                    isLoading={loadingEspecialidades}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========== CONVÊNIOS ========== */}
        {categoriaAtiva === 'convenios' && (
          <div className="admin-card card bg-base-100 shadow-lg border border-gray-200">
            <div className="card-body p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <div>
                  <h2 className="card-title text-lg sm:text-xl flex items-center">
                    <svg className="w-5 h-5 mr-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Convênios
                  </h2>
                  <p className="admin-counter text-xs text-gray-500 mt-1">
                    {conveniosFiltrados.length} convênio{conveniosFiltrados.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  className="admin-button btn btn-accent btn-sm sm:btn-md flex-shrink-0"
                  onClick={() => setModalConvenio({ isOpen: true })}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Adicionar Convênio
                </button>
              </div>

              {/* Filtro com badge limpar */}
              <div className="relative mb-4">
                {temFiltroConvenio && (
                  <button
                    onClick={limparFiltroConvenio}
                    className="absolute -top-1 right-0 badge badge-error badge-xs cursor-pointer hover:badge-error z-10 transition-transform hover:scale-110 p-2"
                    title="Limpar filtro"
                  >
                    <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Limpar filtro
                  </button>
                )}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="admin-label label-text text-xs font-medium">Buscar Convênio</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Filtrar por nome..."
                    className="admin-filter-input admin-input input input-bordered input-sm"
                    value={filtroConvenio}
                    onChange={(e) => setFiltroConvenio(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-table-container">
                {loadingConvenios ? (
                  <div className="admin-skeleton">
                    <SkeletonTable />
                  </div>
                ) : (
                  <DataTable
                    data={conveniosFiltrados}
                    columns={colunasConvenios}
                    isLoading={loadingConvenios}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== MODAIS ========== */}
      <ModalCadastroEspecialidade
        isOpen={modalEspecialidade.isOpen}
        onClose={() => setModalEspecialidade({ isOpen: false })}
        especialidade={modalEspecialidade.especialidade}
      />

      <ModalCadastroConvenio
        isOpen={modalConvenio.isOpen}
        onClose={() => setModalConvenio({ isOpen: false })}
        convenio={modalConvenio.convenio}
      />

      <ModalCadastroMedico
        isOpen={modalMedico.isOpen}
        onClose={() => setModalMedico({ isOpen: false })}
        medico={modalMedico.medico}
      />

      {/* Modal de Confirmação de Exclusão */}
      {confirmDelete.isOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            {/* Header com ícone de alerta */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <svg 
                  className="w-8 h-8 text-error" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Confirmar Exclusão
                </h3>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Você tem certeza que deseja excluir:
              </p>
              
              <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-primary">
                <p className="font-medium text-gray-900">
                  {confirmDelete.type === 'especialidade' && confirmDelete.item?.descricao}
                  {confirmDelete.type === 'convenio' && confirmDelete.item?.nome}
                  {confirmDelete.type === 'medico' && confirmDelete.item?.nome}
                </p>
                {confirmDelete.type === 'medico' && (
                  <p className="text-sm text-gray-600 mt-1">
                    CRM: {confirmDelete.item?.crm}
                  </p>
                )}
              </div>

              {/* Aviso sobre movimentos */}
              <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400">
                <div className="flex items-start gap-2">
                  <svg 
                    className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-800 mb-1">
                      Atenção
                    </p>
                    <p className="text-sm text-amber-700">
                      {confirmDelete.type === 'medico' && 'Este médico só poderá ser excluído se não houver consultas agendadas ou histórico de atendimentos associados.'}
                      {confirmDelete.type === 'especialidade' && 'Esta especialidade só poderá ser excluída se não houver médicos cadastrados ou consultas associadas.'}
                      {confirmDelete.type === 'convenio' && 'Este convênio só poderá ser excluído se não houver médicos cadastrados ou consultas associadas.'}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-red-600 font-medium">
                Esta ação não pode ser desfeita.
              </p>
            </div>

            {/* Ações */}
            <div className="modal-action">
              <button 
                className="btn btn-ghost" 
                onClick={() => setConfirmDelete({ isOpen: false, type: null, item: null, onConfirm: null })}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-error" 
                onClick={() => {
                  if (confirmDelete.onConfirm) {
                    confirmDelete.onConfirm();
                  }
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCadastros;