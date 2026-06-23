import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'log-email-endpoint',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/log-email' && req.method === 'POST') {
            let body = ''
            req.on('data', chunk => {
              body += chunk
            })
            req.on('end', () => {
              try {
                const { email } = JSON.parse(body)
                if (email) {
                  const filePath = path.join(__dirname, 'emails.csv')
                  
                  // Initialize file with header if it doesn't exist
                  if (!fs.existsSync(filePath)) {
                    fs.writeFileSync(filePath, 'Email,Timestamp\n', 'utf8')
                  }
                  
                  // Append email and current timestamp
                  const timestamp = new Date().toISOString()
                  fs.appendFileSync(filePath, `${email},${timestamp}\n`, 'utf8')
                  
                  res.writeHead(200, { 'Content-Type': 'application/json' })
                  res.end(JSON.stringify({ success: true, message: 'Logged successfully' }))
                  return
                }
              } catch (err) {
                console.error('Error logging email:', err)
              }
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: false, error: 'Invalid request' }))
            })
          } else {
            next()
          }
        })
      }
    }
  ],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
})
