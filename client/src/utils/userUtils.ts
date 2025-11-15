// Utilitário para mapear tipo numérico para nome
export const getTipoNome = (tipo: number): string => {
  switch (tipo) {
    case 1: return 'Paciente';
    case 2: return 'Médico(a)';
    case 3: return 'Administrador(a)';
    default: return 'Usuário';
  }
};

// Utilitário para validar se um objeto User está completo
export const isValidUser = (user: any): boolean => {
  return (
    user &&
    typeof user.id === 'number' &&
    typeof user.nome === 'string' &&
    typeof user.tipo === 'number' &&
    typeof user.nomeTipo === 'string' &&
    user.tipo >= 1 &&
    user.tipo <= 3
  );
};