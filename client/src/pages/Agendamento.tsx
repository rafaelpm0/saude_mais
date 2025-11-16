import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';

function Agendamento() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Agendamentos</h1>
        <p className="text-gray-600">
          Bem-vindo(a), {user?.nome}! Gerencie seus agendamentos médicos aqui.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de Novo Agendamento */}
        <div className="card bg-white shadow-lg">
          <div className="card-body">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Novo Agendamento</h3>
                <p className="text-sm text-gray-600">Agende uma nova consulta</p>
              </div>
            </div>
            <button className="btn btn-primary w-full">
              Agendar Consulta
            </button>
          </div>
        </div>

        {/* Card de Próximas Consultas */}
        <div className="card bg-white shadow-lg">
          <div className="card-body">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Próximas Consultas</h3>
                <p className="text-sm text-gray-600">Consultas agendadas</p>
              </div>
            </div>
            <div className="text-center py-4">
              <p className="text-gray-500">Nenhuma consulta agendada</p>
            </div>
          </div>
        </div>

        {/* Card de Histórico */}
        <div className="card bg-white shadow-lg">
          <div className="card-body">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Histórico</h3>
                <p className="text-sm text-gray-600">Consultas anteriores</p>
              </div>
            </div>
            <button className="btn btn-outline w-full">
              Ver Histórico
            </button>
          </div>
        </div>
      </div>

      {/* Seção de Informações Importantes */}
      <div className="mt-8">
        <div className="card bg-blue-50 border border-blue-200">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Informações Importantes</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Chegue com 15 minutos de antecedência para seu atendimento
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Traga todos os exames e documentos necessários
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cancelamentos devem ser feitos com pelo menos 24h de antecedência
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Agendamento;