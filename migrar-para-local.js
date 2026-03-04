/**
 * migrar-para-local.js
 * Copia todos os dados do Turso (nuvem) → SQLite local (public/midia/db.sqlite)
 * Execute UMA vez: node migrar-para-local.js
 */

require("dotenv").config();
const { createClient } = require("@libsql/client");
const path = require("path");

const TURSO_URL   = process.env.TURSO_URL;
const TURSO_TOKEN = process.env.TURSO_TOKEN;
const LOCAL_FILE  = "file:" + path.join(__dirname, "public", "midia", "db.sqlite");

if (!TURSO_URL || TURSO_URL.startsWith("file:")) {
  console.error("TURSO_URL não encontrado no .env — nada a migrar.");
  process.exit(1);
}

const turso = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
const local = createClient({ url: LOCAL_FILE });

async function criarTabelas() {
  await local.execute(`
    CREATE TABLE IF NOT EXISTS pastas (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      nome            TEXT NOT NULL,
      cpf             TEXT NOT NULL DEFAULT '',
      cargo           TEXT NOT NULL DEFAULT '',
      setor           TEXT NOT NULL DEFAULT '',
      captacao        TEXT DEFAULT '',
      parceiro        TEXT DEFAULT '',
      modulo          TEXT DEFAULT 'RH',
      criado_em       TEXT DEFAULT (datetime('now')),
      data_nascimento TEXT DEFAULT '',
      faltas          INTEGER DEFAULT 0
    )`);

  await local.execute(`
    CREATE TABLE IF NOT EXISTS arquivos (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      pasta_id      INTEGER NOT NULL,
      nome_original TEXT    NOT NULL,
      nome_arquivo  TEXT    NOT NULL,
      mimetype      TEXT    NOT NULL DEFAULT '',
      tamanho       INTEGER NOT NULL DEFAULT 0,
      criado_em     TEXT    NOT NULL DEFAULT (datetime('now')),
      subpasta_id   INTEGER DEFAULT NULL,
      url_arquivo   TEXT    DEFAULT '',
      FOREIGN KEY (pasta_id) REFERENCES pastas(id) ON DELETE CASCADE
    )`);

  await local.execute(`
    CREATE TABLE IF NOT EXISTS subpastas (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      pasta_id  INTEGER NOT NULL,
      nome      TEXT    NOT NULL,
      criado_em TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (pasta_id) REFERENCES pastas(id) ON DELETE CASCADE
    )`);

  await local.execute(`
    CREATE TABLE IF NOT EXISTS registros_falta (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      pasta_id        INTEGER NOT NULL,
      data_falta      TEXT    NOT NULL,
      tem_atestado    INTEGER NOT NULL DEFAULT 0,
      atestado_inicio TEXT    NOT NULL DEFAULT '',
      atestado_fim    TEXT    NOT NULL DEFAULT '',
      criado_em       TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (pasta_id) REFERENCES pastas(id) ON DELETE CASCADE
    )`);

  console.log("✓ Tabelas criadas no SQLite local");
}

async function migrarTabela(tabela, colunas) {
  const res = await turso.execute(`SELECT * FROM ${tabela}`);
  const rows = res.rows;

  if (rows.length === 0) {
    console.log(`  ${tabela}: 0 registros`);
    return;
  }

  for (const row of rows) {
    const vals = colunas.map(c => row[c] !== undefined ? row[c] : null);
    const placeholders = colunas.map(() => "?").join(", ");
    const cols = colunas.join(", ");
    await local.execute(
      `INSERT OR IGNORE INTO ${tabela} (${cols}) VALUES (${placeholders})`,
      vals
    );
  }
  console.log(`✓ ${tabela}: ${rows.length} registros copiados`);
}

async function main() {
  console.log("=== Migração Turso → SQLite Local ===\n");
  console.log(`Origem : ${TURSO_URL}`);
  console.log(`Destino: ${LOCAL_FILE}\n`);

  await criarTabelas();

  await migrarTabela("pastas", [
    "id","nome","cpf","cargo","setor","captacao","parceiro",
    "modulo","criado_em","data_nascimento","faltas"
  ]);

  await migrarTabela("subpastas", [
    "id","pasta_id","nome","criado_em"
  ]);

  await migrarTabela("arquivos", [
    "id","pasta_id","nome_original","nome_arquivo","mimetype",
    "tamanho","criado_em","subpasta_id","url_arquivo"
  ]);

  await migrarTabela("registros_falta", [
    "id","pasta_id","data_falta","tem_atestado",
    "atestado_inicio","atestado_fim","criado_em"
  ]);

  console.log("\n✅ Migração concluída! Arquivo: public/midia/db.sqlite");
  process.exit(0);
}

main().catch(err => {
  console.error("Erro na migração:", err.message);
  process.exit(1);
});
