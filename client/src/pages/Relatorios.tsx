import { useState } from 'react';
import { toast } from 'react-toastify';
import { DataTable } from '../components/ui/DataTable';
import {
  useGetRelatorioConsultasMedicoEspecialidadeQuery,
  useGetRelatorioCancelamentosRemarcacoesQuery,
  useGetRelatorioPacientesFrequentesQuery,
} from '../services/endpoints/relatorios';
import jsPDF from 'jspdf';


type TipoRelatorio = 'consultas' | 'cancelamentos' | 'pacientes';

function Relatorios() {
  const [tipoRelatorioAtivo, setTipoRelatorioAtivo] = useState<TipoRelatorio>('consultas');
  
  // Estados para filtros de data
  const [dataInicioConsultas, setDataInicioConsultas] = useState('');
  const [dataFimConsultas, setDataFimConsultas] = useState('');
  const [mostrarConsultas, setMostrarConsultas] = useState(false);
  
  const [dataInicioCancelamentos, setDataInicioCancelamentos] = useState('');
  const [dataFimCancelamentos, setDataFimCancelamentos] = useState('');
  const [mostrarCancelamentos, setMostrarCancelamentos] = useState(false);
  
  const [dataInicioPacientes, setDataInicioPacientes] = useState('');
  const [dataFimPacientes, setDataFimPacientes] = useState('');
  const [mostrarPacientes, setMostrarPacientes] = useState(false);

  // Queries dos relatórios
  const { data: dadosConsultas, isLoading: loadingConsultas } = 
    useGetRelatorioConsultasMedicoEspecialidadeQuery(
      { dataInicio: dataInicioConsultas, dataFim: dataFimConsultas },
      { skip: !mostrarConsultas || !dataInicioConsultas || !dataFimConsultas }
    );

  const { data: dadosCancelamentos, isLoading: loadingCancelamentos } = 
    useGetRelatorioCancelamentosRemarcacoesQuery(
      { dataInicio: dataInicioCancelamentos, dataFim: dataFimCancelamentos },
      { skip: !mostrarCancelamentos || !dataInicioCancelamentos || !dataFimCancelamentos }
    );

  const { data: dadosPacientes, isLoading: loadingPacientes } = 
    useGetRelatorioPacientesFrequentesQuery(
      { dataInicio: dataInicioPacientes, dataFim: dataFimPacientes },
      { skip: !mostrarPacientes || !dataInicioPacientes || !dataFimPacientes }
    );

  // Handlers para buscar relatórios
  const handleBuscarConsultas = () => {
    if (!dataInicioConsultas || !dataFimConsultas) {
      toast.error('Preencha as datas de início e fim');
      return;
    }
    if (new Date(dataInicioConsultas) > new Date(dataFimConsultas)) {
      toast.error('Data inicial não pode ser maior que data final');
      return;
    }
    setMostrarConsultas(true);
  };

  const handleBuscarCancelamentos = () => {
    if (!dataInicioCancelamentos || !dataFimCancelamentos) {
      toast.error('Preencha as datas de início e fim');
      return;
    }
    if (new Date(dataInicioCancelamentos) > new Date(dataFimCancelamentos)) {
      toast.error('Data inicial não pode ser maior que data final');
      return;
    }
    setMostrarCancelamentos(true);
  };

  const handleBuscarPacientes = () => {
    if (!dataInicioPacientes || !dataFimPacientes) {
      toast.error('Preencha as datas de início e fim');
      return;
    }
    if (new Date(dataInicioPacientes) > new Date(dataFimPacientes)) {
      toast.error('Data inicial não pode ser maior que data final');
      return;
    }
    setMostrarPacientes(true);
  };

  // Handlers para exportar PDF - Simplificado com jsPDF
  const handleExportarPDF = (tipo: TipoRelatorio) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Cabeçalho
      doc.setFontSize(16);
      
      if (tipo === 'consultas') {
        if (!dadosConsultas) {
          toast.error('Busque os dados primeiro');
          return;
        }
        
        doc.text('Relatorio de Consultas por Medico/Especialidade', pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;
        doc.setFontSize(10);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // Estatísticas
        doc.setFontSize(12);
        doc.text('Estatisticas Gerais:', 20, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.text(`Total Geral: ${dadosConsultas.estatisticas.totalGeral}`, 20, yPos);
        yPos += 6;
        doc.text(`Ativas: ${dadosConsultas.estatisticas.porStatus.ativas}`, 20, yPos);
        yPos += 6;
        doc.text(`Finalizadas: ${dadosConsultas.estatisticas.porStatus.finalizadas}`, 20, yPos);
        yPos += 6;
        doc.text(`Canceladas: ${dadosConsultas.estatisticas.porStatus.canceladas}`, 20, yPos);
        yPos += 6;
        doc.text(`Faltas: ${dadosConsultas.estatisticas.porStatus.faltas}`, 20, yPos);
        yPos += 6;
        doc.text(`Transferidas: ${dadosConsultas.estatisticas.porStatus.transferidas}`, 20, yPos);
        yPos += 12;

        // Dados
        doc.setFontSize(12);
        doc.text('Listagem de Consultas:', 20, yPos);
        yPos += 8;
        doc.setFontSize(8);

        dadosConsultas.consultas.forEach((consulta, index) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`${index + 1}. ${consulta.paciente?.nome || '-'} - ${consulta.medico?.nome || '-'}`, 20, yPos);
          yPos += 5;
          doc.text(`   Especialidade: ${consulta.especialidade?.descricao || '-'} | Status: ${consulta.statusDescricao || '-'}`, 20, yPos);
          yPos += 5;
          doc.text(`   Data: ${new Date(consulta.dataConsulta).toLocaleString('pt-BR')}`, 20, yPos);
          yPos += 7;
        });

      } else if (tipo === 'cancelamentos') {
        if (!dadosCancelamentos) {
          toast.error('Busque os dados primeiro');
          return;
        }

        doc.text('Relatorio de Cancelamentos e Remarcacoes', pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;
        doc.setFontSize(10);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // Estatísticas
        doc.setFontSize(12);
        doc.text('Estatisticas Gerais:', 20, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.text(`Total de Consultas: ${dadosCancelamentos.totalConsultas}`, 20, yPos);
        yPos += 6;
        doc.text(`Canceladas: ${dadosCancelamentos.canceladas} (${dadosCancelamentos.percentualCanceladas}%)`, 20, yPos);
        yPos += 6;
        doc.text(`Transferidas: ${dadosCancelamentos.transferidas} (${dadosCancelamentos.percentualTransferidas}%)`, 20, yPos);
        yPos += 6;
        doc.text(`Faltas: ${dadosCancelamentos.faltas} (${dadosCancelamentos.percentualFaltas}%)`, 20, yPos);
        yPos += 12;

        // Por médico
        doc.setFontSize(12);
        doc.text('Detalhamento por Medico:', 20, yPos);
        yPos += 8;
        doc.setFontSize(9);

        dadosCancelamentos.porMedico.forEach((medico, index) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`${index + 1}. ${medico.medicoNome} - ${medico.especialidade}`, 20, yPos);
          yPos += 5;
          doc.text(`   Total: ${medico.total} | Canceladas: ${medico.canceladas} | Transferidas: ${medico.transferidas} | Faltas: ${medico.faltas}`, 20, yPos);
          yPos += 7;
        });

      } else {
        if (!dadosPacientes) {
          toast.error('Busque os dados primeiro');
          return;
        }

        doc.text('Relatorio de Pacientes Frequentes', pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;
        doc.setFontSize(10);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // Estatísticas
        doc.setFontSize(12);
        doc.text('Estatisticas Gerais:', 20, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.text(`Total de Pacientes: ${dadosPacientes.estatisticas.totalPacientes}`, 20, yPos);
        yPos += 6;
        doc.text(`Total de Consultas: ${dadosPacientes.estatisticas.totalConsultas}`, 20, yPos);
        yPos += 6;
        doc.text(`Media por Paciente: ${dadosPacientes.estatisticas.mediaConsultasPorPaciente}`, 20, yPos);
        yPos += 12;

        // Pacientes
        doc.setFontSize(12);
        doc.text('Pacientes Mais Frequentes:', 20, yPos);
        yPos += 8;
        doc.setFontSize(9);

        dadosPacientes.pacientes.forEach((paciente, index) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`${index + 1}. ${paciente.paciente?.nome || '-'} (CPF: ${paciente.paciente?.cpf || '-'})`, 20, yPos);
          yPos += 5;
          doc.text(`   Total de Consultas: ${paciente.totalConsultas}`, 20, yPos);
          yPos += 5;
          doc.text(`   Especialidades: ${Array.isArray(paciente.especialidades) ? paciente.especialidades.join(', ') : '-'}`, 20, yPos);
          yPos += 7;
        });
      }

      doc.save(`relatorio-${tipo}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Relatórios Administrativos</h1>

      {/* Barra de navegação entre relatórios */}
      <div className="tabs tabs-boxed mb-6 bg-base-200">
        <button
          className={`tab ${tipoRelatorioAtivo === 'consultas' ? 'tab-active' : ''}`}
          onClick={() => setTipoRelatorioAtivo('consultas')}
        >
          Consultas por Médico
        </button>
        <button
          className={`tab ${tipoRelatorioAtivo === 'cancelamentos' ? 'tab-active' : ''}`}
          onClick={() => setTipoRelatorioAtivo('cancelamentos')}
        >
          Cancelamentos/Remarcações
        </button>
        <button
          className={`tab ${tipoRelatorioAtivo === 'pacientes' ? 'tab-active' : ''}`}
          onClick={() => setTipoRelatorioAtivo('pacientes')}
        >
          Pacientes Frequentes
        </button>
      </div>

      {/* Relatório 1: Consultas por Médico/Especialidade */}
      {tipoRelatorioAtivo === 'consultas' && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Consultas por Médico/Especialidade</h2>
            
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Data Início</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={dataInicioConsultas}
                  onChange={(e) => setDataInicioConsultas(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Data Fim</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={dataFimConsultas}
                  onChange={(e) => setDataFimConsultas(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">&nbsp;</span>
                </label>
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary flex-1"
                    onClick={handleBuscarConsultas}
                    disabled={loadingConsultas}
                  >
                    {loadingConsultas ? 'Buscando...' : 'Buscar'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleExportarPDF('consultas')}
                    disabled={!mostrarConsultas || loadingConsultas}
                  >
                    📄 PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            {mostrarConsultas && dadosConsultas && (
              <>
                <div className="stats shadow mb-4">
                  <div className="stat">
                    <div className="stat-title">Total Geral</div>
                    <div className="stat-value text-primary">{dadosConsultas.estatisticas.totalGeral}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Ativas</div>
                    <div className="stat-value text-info">{dadosConsultas.estatisticas.porStatus.ativas}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Finalizadas</div>
                    <div className="stat-value text-success">{dadosConsultas.estatisticas.porStatus.finalizadas}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Canceladas</div>
                    <div className="stat-value text-warning">{dadosConsultas.estatisticas.porStatus.canceladas}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Faltas</div>
                    <div className="stat-value text-error">{dadosConsultas.estatisticas.porStatus.faltas}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Transferidas</div>
                    <div className="stat-value">{dadosConsultas.estatisticas.porStatus.transferidas}</div>
                  </div>
                </div>

                {/* Tabela de dados */}
                <DataTable
                  data={dadosConsultas.consultas}
                  columns={[
                    { header: 'Paciente', accessor: 'paciente.nome', render: (val, row) => row.paciente?.nome || '-' },
                    { header: 'Médico', accessor: 'medico.nome', render: (val, row) => row.medico?.nome || '-' },
                    { header: 'Especialidade', accessor: 'especialidade.descricao', render: (val, row) => row.especialidade?.descricao || '-' },
                    { header: 'Convênio', accessor: 'convenio.nome', render: (val, row) => row.convenio?.nome || '-' },
                    { 
                      header: 'Data',
                      accessor: 'dataConsulta',
                      render: (value) => value ? new Date(value).toLocaleString('pt-BR') : '-'
                    },
                    { header: 'Status', accessor: 'statusDescricao', render: (val) => val || '-' },
                  ]}
                  isLoading={loadingConsultas}
                  itemsPerPage={20}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Relatório 2: Cancelamentos e Remarcações */}
      {tipoRelatorioAtivo === 'cancelamentos' && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Taxa de Cancelamentos e Remarcações</h2>
            
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Data Início</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={dataInicioCancelamentos}
                  onChange={(e) => setDataInicioCancelamentos(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Data Fim</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={dataFimCancelamentos}
                  onChange={(e) => setDataFimCancelamentos(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">&nbsp;</span>
                </label>
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary flex-1"
                    onClick={handleBuscarCancelamentos}
                    disabled={loadingCancelamentos}
                  >
                    {loadingCancelamentos ? 'Buscando...' : 'Buscar'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleExportarPDF('cancelamentos')}
                    disabled={!mostrarCancelamentos || loadingCancelamentos}
                  >
                    📄 PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            {mostrarCancelamentos && dadosCancelamentos && (
              <>
                <div className="stats shadow mb-4">
                  <div className="stat">
                    <div className="stat-title">Total Consultas</div>
                    <div className="stat-value">{dadosCancelamentos.totalConsultas}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Canceladas</div>
                    <div className="stat-value text-warning">{dadosCancelamentos.canceladas}</div>
                    <div className="stat-desc">{dadosCancelamentos.percentualCanceladas}%</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Transferidas</div>
                    <div className="stat-value text-info">{dadosCancelamentos.transferidas}</div>
                    <div className="stat-desc">{dadosCancelamentos.percentualTransferidas}%</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Faltas</div>
                    <div className="stat-value text-error">{dadosCancelamentos.faltas}</div>
                    <div className="stat-desc">{dadosCancelamentos.percentualFaltas}%</div>
                  </div>
                </div>

                {/* Tabela por médico */}
                <DataTable
                  data={dadosCancelamentos.porMedico}
                  columns={[
                    { header: 'Médico', accessor: 'medicoNome' },
                    { header: 'Especialidade', accessor: 'especialidade' },
                    { header: 'Total', accessor: 'total' },
                    { header: 'Canceladas', accessor: 'canceladas' },
                    { header: 'Transferidas', accessor: 'transferidas' },
                    { header: 'Faltas', accessor: 'faltas' },
                  ]}
                  isLoading={loadingCancelamentos}
                  itemsPerPage={20}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Relatório 3: Pacientes Frequentes */}
      {tipoRelatorioAtivo === 'pacientes' && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Pacientes que Mais Consultaram</h2>
            
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Data Início</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={dataInicioPacientes}
                  onChange={(e) => setDataInicioPacientes(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Data Fim</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={dataFimPacientes}
                  onChange={(e) => setDataFimPacientes(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">&nbsp;</span>
                </label>
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary flex-1"
                    onClick={handleBuscarPacientes}
                    disabled={loadingPacientes}
                  >
                    {loadingPacientes ? 'Buscando...' : 'Buscar'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleExportarPDF('pacientes')}
                    disabled={!mostrarPacientes || loadingPacientes}
                  >
                    📄 PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            {mostrarPacientes && dadosPacientes && (
              <>
                <div className="stats shadow mb-4">
                  <div className="stat">
                    <div className="stat-title">Total Pacientes</div>
                    <div className="stat-value text-primary">{dadosPacientes.estatisticas.totalPacientes}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Total Consultas</div>
                    <div className="stat-value">{dadosPacientes.estatisticas.totalConsultas}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Média por Paciente</div>
                    <div className="stat-value text-success">{dadosPacientes.estatisticas.mediaConsultasPorPaciente}</div>
                  </div>
                </div>

                {/* Tabela de pacientes */}
                <DataTable
                  data={dadosPacientes.pacientes}
                  columns={[
                    { header: 'Paciente', accessor: 'paciente.nome', render: (val, row) => row.paciente?.nome || '-' },
                    { header: 'CPF', accessor: 'paciente.cpf', render: (val, row) => row.paciente?.cpf || '-' },
                    { header: 'Consultas', accessor: 'totalConsultas' },
                    { 
                      header: 'Especialidades',
                      accessor: 'especialidades',
                      render: (value) => Array.isArray(value) && value.length > 0 ? value.join(', ') : '-'
                    },
                    { 
                      header: 'Primeira',
                      accessor: 'primeiraConsulta',
                      render: (value) => value ? new Date(value).toLocaleDateString('pt-BR') : '-'
                    },
                    { 
                      header: 'Última',
                      accessor: 'ultimaConsulta',
                      render: (value) => value ? new Date(value).toLocaleDateString('pt-BR') : '-'
                    },
                  ]}
                  isLoading={loadingPacientes}
                  itemsPerPage={20}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Relatorios;
