"use client";

import { useTheme } from "next-themes";
import { useRef, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

const emptySubscribe = () => () => { };

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mountedRef = useRef(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => {
      mountedRef.current = true;
      return true;
    },
    () => false,
  );

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
