import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDb() {
  return open({
    filename: './src/database.db',
    driver: sqlite3.Database,
  });
}

export async function createTable() {
  const db = await openDb();
  
  // Criar tabela de usuários
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT
    );
  `);

  // Criar tabela de filmes com relação ao usuário que inseriu
  await db.exec(`
    CREATE TABLE IF NOT EXISTS filmes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
`);
}
