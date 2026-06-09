"use client"

import { useRef, useEffect, useState } from "react"

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  duration?: number
  threshold?: number
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.6,
  threshold = 0.1,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay, threshold])

  const transforms: Record<string, string> = {
    up: "translateY(24px)",
    down: "translateY(-24px)",
    left: "translateX(-24px)",
    right: "translateX(24px)",
    none: "none",
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transforms[direction],
        transition: `opacity ${duration}s cubic-bezier(0.22, 1, 0.36, 1)${delay ? ` ${delay}ms` : ""}, transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1)${delay ? ` ${delay}ms` : ""}`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  )
}
