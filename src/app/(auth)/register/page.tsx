"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { KredoLogo } from "@/components/kredo-logo"
import "../../landing.css"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Something went wrong")
      setLoading(false)
      return
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Account created. Please sign in.")
      setLoading(false)
      return
    }

    router.push("/onboarding")
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
            Create your account
          </h1>
          <p className="mt-2 text-sm text-[#A1A1AA]">
            Start managing your freelance business
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-[#FAFAFA]">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-sm transition-colors placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500"
              placeholder="Jane Doe"
            />
          </div>

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
              placeholder="Create a password"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-[#FAFAFA]">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-sm transition-colors placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500"
              placeholder="Confirm your password"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-gradient-to-b from-white to-white/80 px-5 text-sm font-medium text-black transition-all hover:bg-white disabled:opacity-50 mt-4 shadow-md"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#A1A1AA]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-orange-400 underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
