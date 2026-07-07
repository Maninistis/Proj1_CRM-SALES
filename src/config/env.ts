import { z } from 'zod'

/**
 * Environment variable schema.
 * Validated once on application startup.
 * If any required variable is missing or invalid, the app crashes with a clear error.
 */
const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .describe(
      'MariaDB connection URL (e.g. mysql://user:pass@localhost:3306/crm_sales)'
    ),
  AUTH_SECRET: z
    .string()
    .min(32)
    .describe('Auth.js JWT signing secret (min 32 chars)'),
  NEXTAUTH_URL: z
    .string()
    .url()
    .describe('Application base URL (e.g. http://localhost:3000)'),
})

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')
    throw new Error(
      `Invalid environment variables:\n${missing}\n\nCheck your .env file. See .env.example for the template.`
    )
  }

  return parsed.data
}

export const env = loadEnv()
