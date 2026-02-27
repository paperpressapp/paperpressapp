"use client";

import { useState, useEffect, useCallback } from "react";
import { noInternet } from "@/lib/errors";

interface UseNetworkReturn {
  isOnline: boolean;
  isChecking: boolean;
  checkConnection: () => Promise<boolean>;
}

export function useNetwork(): UseNetworkReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const online = navigator.onLine;
      if (online) {
        try {
          const response = await fetch("/api/health", {
            method: "HEAD",
            cache: "no-cache",
          });
          setIsOnline(response.ok);
          return response.ok;
        } catch {
          setIsOnline(false);
          return false;
        }
      }
      setIsOnline(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkConnection();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    checkConnection();

    const interval = setInterval(checkConnection, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [checkConnection]);

  return { isOnline, isChecking, checkConnection };
}

export async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  if (!navigator.onLine) {
    throw new Error(noInternet);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 0 || response.status >= 500) {
        throw new Error(noInternet);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      if (error.message === noInternet) {
        throw error;
      }
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        throw new Error(noInternet);
      }
      throw error;
    }
    throw new Error("An unexpected error occurred");
  } finally {
    clearTimeout(timeoutId);
  }
}
