import { Link } from 'react-router-dom'

export function NotFoundScreen() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">404</h1>
      <p className="mt-2 text-slate-600">Esta página no existe.</p>
      <Link to="/" className="mt-4 inline-block text-sm underline">
        Volver al inicio
      </Link>
    </section>
  )
}
