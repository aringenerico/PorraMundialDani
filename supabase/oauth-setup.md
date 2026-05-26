# Google OAuth en Supabase — Pasos

## 1. Google Cloud Console
1. Ir a https://console.cloud.google.com
2. Crear proyecto o usar uno existente
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
4. Application type: **Web application**
5. Authorized redirect URIs añadir:
   ```
   https://<TU_REF>.supabase.co/auth/v1/callback
   https://porra-marcadores.vercel.app  (o tu dominio)
   http://localhost:5173               (para desarrollo)
   ```
6. Guardar **Client ID** y **Client Secret**

## 2. Supabase Dashboard
1. Project → Authentication → Providers → **Google**
2. Pegar Client ID y Client Secret
3. Enable Google provider → Save

## 3. Vercel
En Project → Settings → Environment Variables añadir:
```
VITE_SUPABASE_URL      = https://XXXX.supabase.co
VITE_SUPABASE_ANON_KEY = eyJ...
```
Para la API serverless (sync-results.js) añadir también:
```
SUPABASE_URL              = https://XXXX.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJ...   (en Supabase: Settings → API → service_role)
FD_KEY                    = tu_key_football_data   (Phase 2)
ADMIN_SECRET              = una_clave_aleatoria_fuerte
```

## 4. Supabase Site URL
Authentication → URL Configuration:
- **Site URL**: https://porra-marcadores.vercel.app
- **Redirect URLs**: añadir también http://localhost:5173

## 5. Ejecutar SQL
En Supabase → SQL Editor, ejecutar en orden:
1. `supabase/schema.sql`
2. `supabase/rls.sql`
3. `supabase/seed-matches.sql` (después de completar equipos y fechas del Excel)
