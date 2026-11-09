import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Supabase·Google·네이버에 등록한 주소(http://127.0.0.1:5173)와 맞춥니다.
export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
})
