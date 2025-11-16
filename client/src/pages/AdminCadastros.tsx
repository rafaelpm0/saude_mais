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

function AdminCadastros() {
  // ========== ESTADOS ==========
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
  const handleDeleteEspecialidade = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta especialidade?')) {
      try {
        await deleteEspecialidade(id).unwrap();
        toast.success('Especialidade excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir especialidade:', error);
        toast.error('Erro ao excluir especialidade');
      }
    }
  };

  const handleDeleteConvenio = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este convênio?')) {
      try {
        await deleteConvenio(id).unwrap();
        toast.success('Convênio excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir convênio:', error);
        toast.error('Erro ao excluir convênio');
      }
    }
  };

  const handleDeleteMedico = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este médico?')) {
      try {
        await deleteMedico(id).unwrap();
        toast.success('Médico excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir médico:', error);
        toast.error('Erro ao excluir médico');
      }
    }
  };

  // ========== COLUNAS DAS TABELAS ==========
  const colunasEspecialidades = [
    { header: 'ID', accessor: 'id' },
    { header: 'Descrição', accessor: 'descricao' },
    {
      header: 'Ações',
      accessor: 'acoes',
      render: (value: unknown, rowData: Especialidade) => (
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setModalEspecialidade({ isOpen: true, especialidade: rowData })}
          >
            Editar
          </button>
          <button
            className="btn btn-sm btn-error"
            onClick={() => handleDeleteEspecialidade(rowData.id)}
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
      render: (value: unknown, rowData: Convenio) => (
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setModalConvenio({ isOpen: true, convenio: rowData })}
          >
            Editar
          </button>
          <button
            className="btn btn-sm btn-error"
            onClick={() => handleDeleteConvenio(rowData.id)}
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
      render: (value: unknown, rowData: Medico) => (
        <div className="flex flex-wrap gap-1">
          {rowData.especialidades.map((esp, index) => (
            <span key={index} className="badge badge-primary badge-sm">
              {esp.especialidade.descricao}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Ações',
      accessor: 'acoes',
      render: (value: unknown, rowData: Medico) => (
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setModalMedico({ isOpen: true, medico: rowData })}
          >
            Editar
          </button>
          <button
            className="btn btn-sm btn-error"
            onClick={() => handleDeleteMedico(rowData.id)}
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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Cadastros Administrativos</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* ========== COLUNA MÉDICOS ========== */}
        <div className="flex-1">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title">Médicos</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => setModalMedico({ isOpen: true })}
                >
                  + Adicionar
                </button>
              </div>

              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Filtrar por nome..."
                  className="input input-bordered input-sm"
                  value={filtroMedicoNome}
                  onChange={(e) => setFiltroMedicoNome(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Filtrar por CRM..."
                  className="input input-bordered input-sm"
                  value={filtroMedicoCrm}
                  onChange={(e) => setFiltroMedicoCrm(e.target.value)}
                />
                <select
                  className="select select-bordered select-sm"
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

              {loadingMedicos ? (
                <SkeletonTable />
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

        {/* ========== COLUNA ESPECIALIDADES ========== */}
        <div className="flex-1">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title">Especialidades</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => setModalEspecialidade({ isOpen: true })}
                >
                  + Adicionar
                </button>
              </div>

              {/* Filtro */}
              <input
                type="text"
                placeholder="Filtrar por descrição..."
                className="input input-bordered input-sm mb-4"
                value={filtroEspecialidade}
                onChange={(e) => setFiltroEspecialidade(e.target.value)}
              />

              {loadingEspecialidades ? (
                <SkeletonTable />
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

        {/* ========== COLUNA CONVÊNIOS ========== */}
        <div className="flex-1">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title">Convênios</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => setModalConvenio({ isOpen: true })}
                >
                  + Adicionar
                </button>
              </div>

              {/* Filtro */}
              <input
                type="text"
                placeholder="Filtrar por nome..."
                className="input input-bordered input-sm mb-4"
                value={filtroConvenio}
                onChange={(e) => setFiltroConvenio(e.target.value)}
              />

              {loadingConvenios ? (
                <SkeletonTable />
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
    </div>
  );
}

export default AdminCadastros;