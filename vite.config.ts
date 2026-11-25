import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { credentialLiteralGuard } from './scripts/credential-literal-guard.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), credentialLiteralGuard()],
})
