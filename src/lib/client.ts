// src/lib/encoreClient.ts
// Shared singleton instance (and accessor) for Encore API Client
// Avoids recreating the client in every file.

import Client, { Local } from './api'
import { env } from './env'

// Choose target base URL from env or fallback to local
const target = env.NEXT_PUBLIC_API_BASE_URL ?? Local

let cachedClient: Client | null = null

export function getEncoreClient (): Client {
  if (!cachedClient) {
    cachedClient = new Client(target)
  }
  return cachedClient
}

// Default export: ready-to-use singleton instance
const client = getEncoreClient()
export default client
