/**
 * Loading States Utility
 * Professional loading overlays and error messages with smart UX
 */

import { FileText, PenTool, Layout, Type, Printer, CheckCircle, XCircle, Info, X } from 'lucide-react';

let loadingOverlay: HTMLDivElement | null = null;
let loadingToast: HTMLDivElement | null = null;

export function showLoading(message: string = 'Loading...'): void {
  hideLoading();
  
  loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'paperpress-loading';
  loadingOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    backdrop-filter: blur(10px);
  `;

  const container = document.createElement('div');
  container.style.cssText = `
    background: #1A1A1A;
    border-radius: 20px;
    padding: 40px 50px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    text-align: center;
    max-width: 360px;
    border: 1px solid #2A2A2A;
  `;

  const spinnerContainer = document.createElement('div');
  spinnerContainer.style.cssText = `
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto 24px;
  `;

  const spinner = document.createElement('div');
  spinner.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 4px solid #2A2A2A;
    border-top-color: #B9FF66;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;

  const innerSpinner = document.createElement('div');
  innerSpinner.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    border: 3px solid #2A2A2A;
    border-top-color: #B9FF66;
    border-radius: 50%;
    animation: spin 0.8s linear infinite reverse;
  `;

  const icon = document.createElement('div');
  icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B9FF66" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
  icon.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  `;

  spinnerContainer.appendChild(spinner);
  spinnerContainer.appendChild(innerSpinner);
  spinnerContainer.appendChild(icon);

  const title = document.createElement('h3');
  title.textContent = 'Generating Your Paper';
  title.style.cssText = `
    font-size: 20px;
    font-weight: 600;
    color: #FFFFFF;
    margin: 0 0 8px 0;
  `;

  const messageEl = document.createElement('p');
  messageEl.textContent = message;
  messageEl.id = 'loading-message';
  messageEl.style.cssText = `
    font-size: 14px;
    color: #A0A0A0;
    margin: 0 0 24px 0;
    line-height: 1.5;
  `;

  const progressBar = document.createElement('div');
  progressBar.id = 'loading-progress';
  progressBar.style.cssText = `
    width: 100%;
    height: 6px;
    background: #2A2A2A;
    border-radius: 3px;
    overflow: hidden;
  `;

  const progressFill = document.createElement('div');
  progressFill.id = 'loading-progress-fill';
  progressFill.style.cssText = `
    height: 100%;
    width: 0%;
    background: #B9FF66;
    border-radius: 3px;
    transition: width 0.3s ease;
  `;

  progressBar.appendChild(progressFill);

  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `;

  container.appendChild(style);
  container.appendChild(spinnerContainer);
  container.appendChild(title);
  container.appendChild(messageEl);
  container.appendChild(progressBar);
  loadingOverlay.appendChild(container);
  document.body.appendChild(loadingOverlay);

  animateProgress();
}

function animateProgress(): void {
  const progressFill = document.getElementById('loading-progress-fill');
  if (!progressFill) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 90) {
      progress = 90;
      clearInterval(interval);
    }
    progressFill.style.width = `${progress}%`;
  }, 200);
}

export function updateLoadingMessage(message: string): void {
  const messageEl = document.getElementById('loading-message');
  if (messageEl) {
    messageEl.textContent = message;
  }
}

export function hideLoading(): void {
  if (loadingOverlay) {
    loadingOverlay.style.transition = 'opacity 0.3s ease';
    loadingOverlay.style.opacity = '0';
    setTimeout(() => {
      if (loadingOverlay) {
        loadingOverlay.remove();
        loadingOverlay = null;
      }
    }, 300);
  }
}

export async function showToast(message: string, duration: number = 4000): Promise<void> {
  if (loadingToast) {
    loadingToast.remove();
  }

  loadingToast = document.createElement('div');
  loadingToast.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%);
    color: white;
    padding: 16px 28px;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 15px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
    max-width: 90%;
    text-align: center;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid #2A2A2A;
    display: flex;
    align-items: center;
    gap: 10px;
  `;

  const icon = document.createElement('div');
  icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B9FF66" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

  const text = document.createElement('span');
  text.textContent = message;

  loadingToast.appendChild(icon);
  loadingToast.appendChild(text);
  document.body.appendChild(loadingToast);

  requestAnimationFrame(() => {
    if (loadingToast) {
      loadingToast.style.transform = 'translateX(-50%) translateY(0)';
      loadingToast.style.opacity = '1';
    }
  });

  setTimeout(() => {
    if (loadingToast) {
      loadingToast.style.transform = 'translateX(-50%) translateY(20px)';
      loadingToast.style.opacity = '0';
      setTimeout(() => {
        if (loadingToast) {
          loadingToast.remove();
          loadingToast = null;
        }
      }, 300);
    }
  }, duration);
}

export async function showSuccessToast(message: string): Promise<void> {
  if (loadingToast) {
    loadingToast.remove();
  }

  loadingToast = document.createElement('div');
  loadingToast.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
    padding: 16px 28px;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 15px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
    max-width: 90%;
    text-align: center;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 10px;
  `;

  const icon = document.createElement('div');
  icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

  const text = document.createElement('span');
  text.textContent = message;

  loadingToast.appendChild(icon);
  loadingToast.appendChild(text);
  document.body.appendChild(loadingToast);

  requestAnimationFrame(() => {
    if (loadingToast) {
      loadingToast.style.transform = 'translateX(-50%) translateY(0)';
      loadingToast.style.opacity = '1';
    }
  });

  setTimeout(() => {
    if (loadingToast) {
      loadingToast.style.transform = 'translateX(-50%) translateY(20px)';
      loadingToast.style.opacity = '0';
      setTimeout(() => {
        if (loadingToast) {
          loadingToast.remove();
          loadingToast = null;
        }
      }, 300);
    }
  }, 4000);
}

export async function showError(message: string): Promise<void> {
  hideLoading();

  const errorOverlay = document.createElement('div');
  errorOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: 40px;
    animation: fadeIn 0.3s ease;
  `;

  const container = document.createElement('div');
  container.style.cssText = `
    background: #1A1A1A;
    border-radius: 20px;
    padding: 40px;
    max-width: 400px;
    width: 100%;
    text-align: center;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    animation: scaleIn 0.3s ease;
    border: 1px solid #2A2A2A;
  `;

  const icon = document.createElement('div');
  icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#FF4D4D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  icon.style.cssText = `
    margin-bottom: 16px;
  `;

  const title = document.createElement('h3');
  title.textContent = 'Oops! Something went wrong';
  title.style.cssText = `
    font-size: 20px;
    font-weight: 600;
    color: #FFFFFF;
    margin: 0 0 12px 0;
  `;

  const messageEl = document.createElement('p');
  messageEl.textContent = message;
  messageEl.style.cssText = `
    font-size: 14px;
    color: #A0A0A0;
    margin: 0 0 24px 0;
    line-height: 1.6;
  `;

  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 12px;
    justify-content: center;
  `;

  const retryBtn = document.createElement('button');
  retryBtn.textContent = 'Try Again';
  retryBtn.style.cssText = `
    padding: 12px 28px;
    background: #B9FF66;
    color: #0A0A0A;
    border: none;
    border-radius: 40px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, filter 0.2s ease;
  `;
  retryBtn.onmouseenter = () => {
    retryBtn.style.filter = 'brightness(1.1)';
  };
  retryBtn.onmouseleave = () => {
    retryBtn.style.filter = 'brightness(1)';
  };

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.cssText = `
    padding: 12px 28px;
    background: transparent;
    color: #A0A0A0;
    border: 1px solid #2A2A2A;
    border-radius: 40px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
  `;
  closeBtn.onmouseenter = () => {
    closeBtn.style.background = '#2A2A2A';
  };
  closeBtn.onmouseleave = () => {
    closeBtn.style.background = 'transparent';
  };

  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `;

  buttonContainer.appendChild(closeBtn);
  buttonContainer.appendChild(retryBtn);

  container.appendChild(style);
  container.appendChild(icon);
  container.appendChild(title);
  container.appendChild(messageEl);
  container.appendChild(buttonContainer);
  errorOverlay.appendChild(container);
  document.body.appendChild(errorOverlay);

  const close = () => errorOverlay.remove();
  closeBtn.addEventListener('click', close);
  retryBtn.addEventListener('click', () => {
    close();
    window.location.reload();
  });
}
