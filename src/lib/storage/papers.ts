/**
 * Paper Storage Utilities
 * 
 * Functions for saving and retrieving generated papers from localStorage.
 */

import { getFromLocalStorage, setToLocalStorage } from "@/lib/utils/storage";
import type { GeneratedPaper } from "@/types";

const STORAGE_KEY = "paperpress_papers";
const MAX_PAPERS = 50;
const MAX_STORAGE_SIZE = 4.5 * 1024 * 1024; // 4.5MB limit (leaving buffer for other data)

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
 * @returns Object with success status and optional error message
 */
export function savePaper(paper: GeneratedPaper): { success: boolean; error?: string } {
  try {
    const papers = getPapers();
    
    // Add new paper to beginning of array
    let updatedPapers = [paper, ...papers];
    
    // Limit to MAX_PAPERS
    if (updatedPapers.length > MAX_PAPERS) {
      updatedPapers = updatedPapers.slice(0, MAX_PAPERS);
    }
    
    // Serialize and check size
    const serialized = JSON.stringify(updatedPapers);
    
    // If too large, remove oldest papers until under limit
    if (serialized.length > MAX_STORAGE_SIZE) {
      // Remove oldest 20% of papers
      const trimmed = updatedPapers.slice(0, Math.floor(updatedPapers.length * 0.8));
      const trimmedSerialized = JSON.stringify(trimmed);
      
      if (trimmedSerialized.length > MAX_STORAGE_SIZE) {
        // Still too large - remove more aggressively
        const minimal = updatedPapers.slice(0, Math.floor(updatedPapers.length * 0.5));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
        return { success: true, error: 'Oldest papers removed to free space' };
      }
      
      localStorage.setItem(STORAGE_KEY, trimmedSerialized);
      return { success: true, error: 'Some older papers removed to free storage space' };
    }
    
    localStorage.setItem(STORAGE_KEY, serialized);
    return { success: true };
  } catch (e) {
    // QuotaExceededError
    console.error('[Storage] Failed to save paper:', e);
    return { success: false, error: 'Storage full — please delete old papers in Settings' };
  }
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
