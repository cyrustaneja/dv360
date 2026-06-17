import { readFileSync, existsSync } from 'node:fs'
import type { Plugin } from 'vite'

/**
 * DEV ONLY: serve the Vercel-style /api functions (and the /sso rewrite) from
 * the Vite dev server, so we can run the full stack locally without `vercel dev`.
 * In production, Vercel runs these same files as real serverless functions.
 */
export function devApi(): Plugin {
  return {
    name: 'dev-api',
    apply: 'serve',
    configResolved() {
      // Load .env.local into process.env so the handlers see SUPABASE_*, etc.
      if (existsSync('.env.local')) {
        for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
          const i = line.indexOf('=')
          if (i > 0 && !line.startsWith('#')) {
            const k = line.slice(0, i).trim()
            if (!process.env[k]) process.env[k] = line.slice(i + 1).trim()
          }
        }
      }
    },
    configureServer(server) {
      server.middlewares.use(async (req: any, res: any, next) => {
        const url = new URL(req.url, 'http://localhost')
        let path = url.pathname
        if (!path.startsWith('/api/') && path !== '/sso') return next()

        // /sso → api/sso (matches the vercel.json rewrite)
        const file = path === '/sso' ? './api/sso.ts' : `.${path}.ts`
        if (!existsSync(file)) { res.statusCode = 404; res.end('Not found'); return }

        // Build a Vercel-ish req.
        req.query = Object.fromEntries(url.searchParams.entries())
        if (req.method === 'POST' || req.method === 'PUT') {
          req.body = await readBody(req)
        }

        // Augment res with Vercel helpers.
        res.status = (code: number) => { res.statusCode = code; return res }
        res.json = (obj: unknown) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)) }
        res.send = (body: string) => { res.end(body) }

        try {
          const mod = await server.ssrLoadModule(file)
          await mod.default(req, res)
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: (err as Error).message }))
        }
      })
    },
  }
}

function readBody(req: any): Promise<string> {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (c: Buffer) => (data += c))
    req.on('end', () => resolve(data))
  })
}
