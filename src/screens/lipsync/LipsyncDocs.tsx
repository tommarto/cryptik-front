import { formatBytes } from '../../utils/file'
import { MAX_AUDIO_BYTES, MAX_IMAGE_BYTES } from '../../services/workflowService'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-slate-800 pt-4 first:border-0 first:pt-0">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </h3>
      <div className="mt-2 space-y-2 text-xs leading-relaxed text-slate-400">
        {children}
      </div>
    </section>
  )
}

export function LipsyncDocs() {
  return (
    <div className="space-y-5">
      <Section title="Qué hace">
        <p>
          Anima una foto para que hable o cante siguiendo un audio. El movimiento
          de los labios sale del audio; la imagen aporta la cara, el encuadre y
          el estilo.
        </p>
      </Section>

      <Section title="Qué necesita">
        <ul className="list-disc space-y-1 pl-4 marker:text-slate-600">
          <li>
            <strong className="text-slate-300">Imagen base</strong> — PNG, JPG o
            WEBP, hasta {formatBytes(MAX_IMAGE_BYTES)}. Se recomienda que la
            boca esté semiabierta en la foto original, para que el modelo no
            tenga que adivinar cómo es.
          </li>
          <li>
            <strong className="text-slate-300">Audio</strong> — MP3, WAV o M4A,
            hasta {formatBytes(MAX_AUDIO_BYTES)}. Es lo que define la duración
            del video.
          </li>
          <li>
            <strong className="text-slate-300">Prompt</strong> — opcional.
          </li>
          <li>
            <strong className="text-slate-300">Nombre</strong> — opcional. Si lo
            dejás vacío se usa el nombre del archivo de audio.
          </li>
        </ul>
      </Section>

      <Section title="Sobre el prompt">
        <p>
          El prompt <strong className="text-slate-300">no afecta el lipsync</strong>.
          La sincronización con los labios viene del audio; el prompt condiciona
          el movimiento del cuerpo, el encuadre y el fondo.
        </p>
        <p>
          Si lo dejás vacío se usa <em>“A person is singing.”</em> como valor por
          defecto.
        </p>
      </Section>

      <Section title="Estados de la cola">
        <ul className="list-disc space-y-1 pl-4 marker:text-slate-600">
          <li>
            <strong className="text-slate-300">En Cola</strong> — el pedido se
            envió y espera una máquina libre.
          </li>
          <li>
            <strong className="text-slate-300">En Proceso</strong> — se está
            generando.
          </li>
          <li>
            <strong className="text-slate-300">Completado</strong> — el video
            está listo y se puede ver en la vista previa.
          </li>
          <li>
            <strong className="text-slate-300">Error</strong> — algo falló. El
            motivo aparece en la vista previa.
          </li>
        </ul>
        <p>
          La cola se actualiza sola: cuando un trabajo termina, la fila cambia de
          estado sin que haga falta recargar.
        </p>
      </Section>

      <Section title="Los tiempos">
        <p>
          <strong className="text-slate-300">Espera</strong> es el tiempo que el
          trabajo estuvo en cola antes de arrancar, y depende de si hay una
          máquina encendida. Si no la hay, hay que iniciar una.
        </p>
        <p>
          <strong className="text-slate-300">Ejecución</strong> es lo que tardó
          la generación en sí, y crece con la duración del audio. Los dos valores
          se conocen recién cuando el trabajo termina.
        </p>
      </Section>

      <Section title="Límites y detalles">
        <ul className="list-disc space-y-1 pl-4 marker:text-slate-600">
          <li>
            En esta pantalla ves solo tus propios trabajos.
          </li>
          <li>
            Un trabajo se puede cerrar la pestaña y seguir corriendo: el
            resultado queda guardado igual.
          </li>
        </ul>
      </Section>
    </div>
  )
}
