"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { KredoLogo } from "@/components/kredo-logo"
import "../../landing.css"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password")
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="kredo-landing flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="glow-container">
        <div className="glow-red opacity-40"></div>
        <div className="glow-orange opacity-50" style={{ transform: "translateY(-100px)" }}></div>
      </div>

      <div className="w-full max-w-sm relative z-10 p-8 rounded-2xl bg-[#09090B]/60 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="mb-8 text-center">
          <KredoLogo href="/" tagline={false} className="mb-6 justify-center" />
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-[#FAFAFA]">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-[#A1A1AA]">
            Sign in to your Kredo account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-[#FAFAFA]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-sm transition-colors placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-[#FAFAFA]">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-sm transition-colors placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-gradient-to-b from-white to-white/80 px-5 text-sm font-medium text-black transition-all hover:bg-white disabled:opacity-50 mt-4 shadow-md"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#09090B] px-2 text-[#A1A1AA]">
              Or continue with
            </span>
          </div>
        </div>

        <button
          onClick={() => signIn("google", { redirectTo: "/dashboard" })}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 text-sm font-medium text-[#FAFAFA] transition-all hover:bg-white/10"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-[#A1A1AA]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-orange-400 underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
