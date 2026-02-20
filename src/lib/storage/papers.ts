/**
 * Paper Storage Utilities
 * 
 * Functions for saving and retrieving generated papers from localStorage.
 */

import { getFromLocalStorage, setToLocalStorage } from "@/lib/utils/storage";
import type { GeneratedPaper } from "@/types";

const STORAGE_KEY = "paperpress_papers";
const MAX_PAPERS = 50;

/**
 * Get all saved papers
 * @returns Array of generated papers
 */
export function getPapers(): GeneratedPaper[] {
  return getFromLocalStorage<GeneratedPaper[]>(STORAGE_KEY, []);
}

/**
 * Get a specific paper by ID
 * @param paperId - The paper ID to find
 * @returns The paper or null if not found
 */
export function getPaperById(paperId: string): GeneratedPaper | null {
  const papers = getPapers();
  return papers.find((p) => p.id === paperId) || null;
}

/**
 * Save a new paper to storage
 * @param paper - The paper to save
 */
export function savePaper(paper: GeneratedPaper): void {
  const papers = getPapers();
  
  // Add new paper to beginning of array
  const updatedPapers = [paper, ...papers];
  
  // Limit to MAX_PAPERS
  if (updatedPapers.length > MAX_PAPERS) {
    updatedPapers.length = MAX_PAPERS;
  }
  
  setToLocalStorage(STORAGE_KEY, updatedPapers);
}

/**
 * Delete a paper by ID
 * @param paperId - The paper ID to delete
 */
export function deletePaper(paperId: string): void {
  const papers = getPapers();
  const updatedPapers = papers.filter((p) => p.id !== paperId);
  setToLocalStorage(STORAGE_KEY, updatedPapers);
}

/**
 * Clear all saved papers
 */
export function clearAllPapers(): void {
  setToLocalStorage(STORAGE_KEY, []);
}

/**
 * Update an existing paper
 * @param paperId - The paper ID to update
 * @param updates - Partial paper data to update
 */
export function updatePaper(
  paperId: string,
  updates: Partial<GeneratedPaper>
): void {
  const papers = getPapers();
  const paperIndex = papers.findIndex((p) => p.id === paperId);
  
  if (paperIndex >= 0) {
    papers[paperIndex] = { ...papers[paperIndex], ...updates };
    setToLocalStorage(STORAGE_KEY, papers);
  }
}

/**
 * Export all papers as JSON
 * @returns Object with papers and metadata
 */
export function exportPapers(): { papers: GeneratedPaper[]; exportedAt: string; version: string } {
  return {
    papers: getPapers(),
    exportedAt: new Date().toISOString(),
    version: "1.0.0"
  };
}

/**
 * Import papers from JSON data
 * @param data - The data to import
 */
export function importPapers(data: { papers: GeneratedPaper[] }): void {
  if (data.papers && Array.isArray(data.papers)) {
    setToLocalStorage(STORAGE_KEY, data.papers);
  }
}
