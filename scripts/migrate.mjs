// Reusable DB migration runner. Usage: node scripts/migrate.mjs "<SQL>"
import { readFileSync } from 'node:fs'
import pg from 'pg'
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(Boolean).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1)]}))
const sql = process.argv[2]
if (!sql) { console.error('no SQL provided'); process.exit(1) }
const c = new pg.Client({ host:env.PGHOST, port:+env.PGPORT, user:env.PGUSER, password:env.PGPASSWORD, database:env.PGDATABASE, ssl:{rejectUnauthorized:false} })
await c.connect()
await c.query(sql)
console.log('migration OK')
await c.end()
