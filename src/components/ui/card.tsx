import * as React from "react"

import { cn } from "@/lib/utils"

interface CardProps extends React.ComponentProps<"div"> {
  variant?: "default" | "elevated" | "flat";
  padding?: "none" | "sm" | "md" | "lg";
}

function Card({ className, variant = "default", padding = "md", ...props }: CardProps) {
  const variantStyles = {
    default: "bg-card text-card-foreground border shadow-sm",
    elevated: "bg-card text-card-foreground shadow-md",
    flat: "bg-neutral-50 text-card-foreground border-0",
  };
  
  const paddingStyles = {
    none: "",
    sm: "p-2",
    md: "p-3",
    lg: "p-4",
  };

  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-xl",
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1.5",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-semibold text-sm text-neutral-900 leading-tight",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-xs text-neutral-500", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-2 mt-3 pt-3 border-t border-border", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
