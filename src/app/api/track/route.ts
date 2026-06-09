import { NextRequest, NextResponse } from "next/server"

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets"
const REGISTRY_ID = "1chQju0OlFRC79ogzpfRsb-jqLevSe4NzC5I-byh7Zr4"

interface TrackBody {
  project: string
  visitorId: string
  page: string
  pageTitle?: string
  action: string
  actionLabel?: string
  duration?: number
  referrer?: string
  device?: string
  browser?: string
  location?: string
  urlParams?: string
  metadata?: Record<string, unknown>
}

async function fetchWithTimeout(url: string, opts: RequestInit & { timeout?: number } = {}) {
  const { timeout = 8000, ...rest } = opts
  const ctrl = new AbortController()
  const id = setTimeout(() => ctrl.abort(), timeout)
  try {
    const r = await fetch(url, { ...rest, signal: ctrl.signal })
    clearTimeout(id)
    return r
  } catch (e) {
    clearTimeout(id)
    throw e
  }
}

async function getAccessToken(): Promise<string | null> {
  const refreshToken = process.env.GOOGLE_TRACK_REFRESH_TOKEN
  if (!refreshToken) return null

  // Try cloud function first (fast path)
  try {
    const r = await fetchWithTimeout("https://google-workspace-extension.geminicli.com/refreshToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    const d = await r.json()
    if (d.access_token) return d.access_token
  } catch {}

  // Fallback: direct Google OAuth
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (clientId && clientSecret) {
    try {
      const r = await fetchWithTimeout("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      })
      const d = await r.json()
      return d.access_token || null
    } catch {}
  }

  return null
}

async function googleFetch(url: string, opts?: RequestInit) {
  const token = await getAccessToken()
  if (!token) return { error: "No access token" }
  try {
    const r = await fetchWithTimeout(url, {
      ...opts,
      headers: {
        ...opts?.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return r.json()
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Fetch failed"
    return { error: msg }
  }
}

async function getSheetId(project: string): Promise<string | null> {
  const data = await googleFetch(
    `${SHEETS_API}/${REGISTRY_ID}/values/A:E?majorDimension=ROWS`
  )
  const rows: string[][] = data.values ?? []
  for (const row of rows) {
    if (row.length >= 4 && row[1]?.toLowerCase() === project.toLowerCase()) {
      return row[3]
    }
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const body: TrackBody = await req.json()
    if (!body.project) {
      return NextResponse.json({ error: "Missing project" }, { status: 400 })
    }

    const sheetId = await getSheetId(body.project)
    if (!sheetId) {
      return NextResponse.json({ error: "Unknown project" }, { status: 404 })
    }

    const now = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC"
    const row = [
      now,
      body.visitorId || "",
      body.page || "",
      body.pageTitle || "",
      body.action || "pageview",
      body.actionLabel || "",
      String(body.duration ?? ""),
      body.referrer || "",
      body.device || "",
      body.browser || "",
      body.location || "",
      body.urlParams || "",
      body.metadata ? JSON.stringify(body.metadata) : "",
    ]

    const result = await googleFetch(
      `${SHEETS_API}/${sheetId}/values/Analytics!A:M:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        body: JSON.stringify({
          range: "Analytics!A:M",
          majorDimension: "ROWS",
          values: [row],
        }),
      }
    )

    if (result.error) {
      console.error("[track] Google Sheets error:", result.error)
      return NextResponse.json({ error: "Write failed", details: result.error }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[track] Unhandled error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
