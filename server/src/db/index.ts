import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs';
import type { RecordItem, RecordInput, Summary } from '../types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbDir = join(__dirname, '..', '..');
const dbPath = join(dbDir, 'data.db');

// 测试模式下用内存数据库，避免污染真实 data.db
const isTest = process.env.TEST_MODE === '1';
const effectiveDbPath = isTest ? ':memory:' : dbPath;

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// const db = new Database(dbPath);
// db.pragma('journal_mode = WAL');

// db.exec(`
//   CREATE TABLE IF NOT EXISTS records (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
//     amount REAL NOT NULL CHECK (amount > 0),
//     category TEXT NOT NULL,
//     date TEXT NOT NULL,
//     note TEXT NOT NULL DEFAULT '',
//     createdAt TEXT NOT NULL DEFAULT (datetime('now'))
//   );
// `);

function createDb(instance?: any) {
  const database = instance ?? new Database(effectiveDbPath);
  database.pragma('journal_mode = WAL');
  database.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      amount REAL NOT NULL CHECK (amount > 0),
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return database;
}

const db = createDb();

/////////////////////////////////

export function getAllRecords(): RecordItem[] {
  return db
    .prepare('SELECT * FROM records ORDER BY date DESC, id DESC')
    .all() as RecordItem[];
}

export function getRecordById(id: number): RecordItem | undefined {
  return db.prepare('SELECT * FROM records WHERE id = ?').get(id) as
    | RecordItem
    | undefined;
}

export function createRecord(input: RecordInput): RecordItem {
  const stmt = db.prepare(
    `INSERT INTO records (type, amount, category, date, note)
     VALUES (@type, @amount, @category, @date, @note)`
  );
  const info = stmt.run(input);
  return getRecordById(Number(info.lastInsertRowid))!;
}

export function updateRecord(id: number, input: RecordInput): RecordItem | undefined {
  const stmt = db.prepare(
    `UPDATE records
     SET type = @type, amount = @amount, category = @category, date = @date, note = @note
     WHERE id = @id`
  );
  stmt.run({ ...input, id });
  return getRecordById(id);
}

export function deleteRecord(id: number): boolean {
  const stmt = db.prepare('DELETE FROM records WHERE id = ?');
  const info = stmt.run(id);
  return info.changes > 0;
}

export function getSummary(): Summary {
  const row = db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS totalIncome,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpense
       FROM records`
    )
    .get() as { totalIncome: number; totalExpense: number };
  return {
    totalIncome: row.totalIncome,
    totalExpense: row.totalExpense,
    balance: row.totalIncome - row.totalExpense,
  };
}

export { db };
export default db;
