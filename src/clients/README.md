# Clients

Un client = una API. Solo se ocupa del transporte: baseUrl, headers, auth,
timeouts y traducir respuestas HTTP a `HttpError`. No sabe nada del negocio —
de eso se encargan los services en `src/services/`.

Todavía no hay ningún client creado.

## Agregar el primero

1. Declarar la URL. Como no hay ninguna env var propia todavía, hay que crear
   `src/config/env.ts` y `src/vite-env.d.ts`:

   ```ts
   // src/vite-env.d.ts
   /// <reference types="vite/client" />

   interface ImportMetaEnv {
     readonly VITE_PRICING_API_URL?: string
   }

   interface ImportMeta {
     readonly env: ImportMetaEnv
   }
   ```

   ```ts
   // src/config/env.ts
   function url(key: keyof ImportMetaEnv, fallback: string): string {
     return import.meta.env[key] || fallback
   }

   export const env = {
     pricingApiUrl: url('VITE_PRICING_API_URL', 'https://api.ejemplo.com'),
   } as const
   ```

2. Crear `src/clients/pricingClient.ts`:

   ```ts
   import { env } from '../config/env'
   import { createHttpClient } from './http/createHttpClient'

   export const pricingClient = createHttpClient({
     name: 'pricing',
     baseUrl: env.pricingApiUrl,
   })
   ```

3. Sumar la variable a `.env.example` y a tu `.env` local.

Los services importan el archivo directo (`../clients/pricingClient`). En este
proyecto no usamos barrels (`index.ts` que re-exporta la carpeta).

## Auth por request

Para tokens que cambian (refresh, login), usar `getHeaders` en vez de `headers`
— se resuelve en cada llamada y acepta async:

```ts
export const pricingClient = createHttpClient({
  name: 'pricing',
  baseUrl: env.pricingApiUrl,
  getHeaders: async () => ({ Authorization: `Bearer ${await getToken()}` }),
})
```

## Errores

Todo status fuera de 2xx tira `HttpError` con `client`, `status` y `body`.
El campo `client` dice qué API falló — útil cuando una screen consume varias.

```ts
if (error instanceof HttpError && error.isNotFound) { /* ... */ }
```
