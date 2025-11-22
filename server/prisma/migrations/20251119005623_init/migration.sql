-- CreateTable
CREATE TABLE "Especialidade" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descricao" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Convenio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "login" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "tipo" INTEGER NOT NULL,
    "crm" TEXT,
    "faltasConsecutivas" INTEGER NOT NULL,
    "cpf" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UsuarioMedico" (
    "idUsuario" INTEGER NOT NULL,
    "idEspecialidade" INTEGER NOT NULL,
    "idConvenio" INTEGER NOT NULL,
    "tempoConsulta" INTEGER NOT NULL,

    PRIMARY KEY ("idUsuario", "idEspecialidade", "idConvenio"),
    CONSTRAINT "UsuarioMedico_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsuarioMedico_idEspecialidade_fkey" FOREIGN KEY ("idEspecialidade") REFERENCES "Especialidade" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsuarioMedico_idConvenio_fkey" FOREIGN KEY ("idConvenio") REFERENCES "Convenio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DispMedico" (
    "idUsuario" INTEGER NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,

    PRIMARY KEY ("idUsuario", "diaSemana"),
    CONSTRAINT "DispMedico_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Agenda" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idMedico" INTEGER NOT NULL,
    "idCliente" INTEGER NOT NULL,
    "dtaInicial" DATETIME NOT NULL,
    "dtaFinal" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Agenda_idMedico_fkey" FOREIGN KEY ("idMedico") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Agenda_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Consulta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idAgenda" INTEGER NOT NULL,
    "idConvenio" INTEGER NOT NULL,
    "observacao" TEXT,
    "status" TEXT NOT NULL,
    CONSTRAINT "Consulta_idAgenda_fkey" FOREIGN KEY ("idAgenda") REFERENCES "Agenda" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Consulta_idConvenio_fkey" FOREIGN KEY ("idConvenio") REFERENCES "Convenio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
