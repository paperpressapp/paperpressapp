"use client";

import { useNetwork } from "@/lib/network";
import { noInternet } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface NetworkErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHome?: boolean;
}

export function NetworkError({
  title = "No Connection",
  message = noInternet,
  onRetry,
  showHome = true,
}: NetworkErrorProps) {
  const { isOnline, checkConnection } = useNetwork();
  const router = useRouter();

  const handleRetry = async () => {
    await checkConnection();
    onRetry?.();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        
        <div className="flex flex-col gap-3">
          {onRetry && (
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          {showHome && (
            <Button variant="outline" onClick={() => router.push("/")}>
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function NetworkOverlay() {
  const { isOnline, isChecking } = useNetwork();

  if (isOnline || isChecking) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4" />
      {noInternet}
    </div>
  );
}
