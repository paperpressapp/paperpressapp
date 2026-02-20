/**
 * Database Service for PaperPress
 * 
 * Main entry point for database operations.
 * Exports the unified database service that handles:
 * - SQLite on native Android
 * - JSON fallback on web
 */

export { db, DatabaseService } from './database';
export { sqliteService } from './sqliteService';
export type { Question, Paper, PaperConfig } from './types';
export type { DBQuestion, DBChapter, DBPaper } from './schema';
