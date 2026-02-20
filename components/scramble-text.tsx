"use client";

import { useEffect, useState, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*<>[]{}~/\\";

interface ScrambleTextProps {
  text: string;
  /** Delay before the animation starts (ms) */
  delay?: number;
  /** How fast each character resolves (ms per char) */
  speed?: number;
  className?: string;
}

export function ScrambleText({
  text,
  delay = 0,
  speed = 40,
  className,
}: ScrambleTextProps) {
  const [display, setDisplay] = useState("");
  const frameRef = useRef<number | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const chars = text.split("");
    const resolved = new Array(chars.length).fill(false);
    let currentIndex = 0;

    // Start with all characters scrambled
    setDisplay(
      chars.map((c) => (c === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)])).join("")
    );

    const timeout = setTimeout(() => {
      // Scramble tick — runs every 30ms
      const scrambleInterval = setInterval(() => {
        setDisplay(
          chars
            .map((c, i) => {
              if (c === " ") return " ";
              if (resolved[i]) return c;
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );
      }, 30);

      // Resolve one character at a time
      const resolveInterval = setInterval(() => {
        if (currentIndex >= chars.length) {
          clearInterval(scrambleInterval);
          clearInterval(resolveInterval);
          setDisplay(text);
          return;
        }
        // Skip spaces
        while (currentIndex < chars.length && chars[currentIndex] === " ") {
          resolved[currentIndex] = true;
          currentIndex++;
        }
        if (currentIndex < chars.length) {
          resolved[currentIndex] = true;
          currentIndex++;
        }
      }, speed);

      return () => {
        clearInterval(scrambleInterval);
        clearInterval(resolveInterval);
      };
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [text, delay, speed]);

  return <span className={className}>{display || text}</span>;
}
