import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 group", className)}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple to-green shadow-[0_0_20px_rgba(168,85,247,0.4)]">
        <span className="text-sm font-black text-black">V</span>
      </span>
      <span className={cn("font-bold tracking-tight", sizes[size])}>
        <span className="text-foreground">VEX</span>
        <span className="text-purple-bright">A</span>
      </span>
    </Link>
  );
}
