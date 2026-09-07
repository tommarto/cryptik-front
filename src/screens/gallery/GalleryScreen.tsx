import { useEffect, useMemo, useRef, useState } from "react";
import { CheckboxSelect } from "../../components/composites/CheckboxSelect";
import { Modal } from "../../components/composites/Modal";
import { Spinner } from "../../components/ui/Spinner";
import { useGallery } from "../../hooks/useGallery";
import { useVideoUrl } from "../../hooks/useVideoUrl";
import {
  ExecutionStatus,
  MediaType,
  type WorkflowExecution,
} from "../../types/workflow";
import { GalleryOverlay } from "./GalleryOverlay";
import { FALLBACK_ICON } from "./fallbackIcons";

const TYPE_OPTIONS = [
  { value: MediaType.Video, label: "Video" },
  { value: MediaType.Image, label: "Imagen" },
  { value: MediaType.Audio, label: "Audio" },
];

const STATUS_OPTIONS = [
  { value: ExecutionStatus.Completed, label: "Listo" },
  { value: ExecutionStatus.Processing, label: "En proceso" },
  { value: ExecutionStatus.Queued, label: "En cola" },
  { value: ExecutionStatus.Error, label: "Error" },
];

export function GalleryScreen() {
  const [types, setTypes] = useState<MediaType[]>([]);
  const [statuses, setStatuses] = useState<ExecutionStatus[]>([]);
  const [userIds, setUserIds] = useState<string[]>([]);
  const [opened, setOpened] = useState<WorkflowExecution | null>(null);

  // Sin selección = sin filtro. Es lo que espera alguien que destilda todo:
  // ver todo, no ver nada. Y van a la consulta, no acá: filtrar del lado del
  // cliente sobre una página mostraría tres resultados habiendo cien abajo.
  const {
    executions,
    thumbnails,
    users,
    isPending,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGallery({
    mediaTypes: types.length ? types : undefined,
    statuses: statuses.length ? statuses : undefined,
    userIds: userIds.length ? userIds : undefined,
  });

  const userOptions = useMemo(
    () => users.map((user) => ({ value: user.id, label: user.name })),
    [users],
  );

  const usersById = useMemo(
    () => Object.fromEntries(users.map((user) => [user.id, user])),
    [users],
  );

  // El layout necesita las medidas de cada foto para despejar la altura de la
  // fila. Las que no las tengan —media anteriores a que las guardáramos— caen a
  // una proporción vertical, que es la habitual acá.
  const photos = useMemo(
    () =>
      executions.map((execution) => {
        const thumbnail =
          thumbnails[execution.context.image_media_id as string];

        return {
          src: thumbnail?.url ?? "",
          width: thumbnail?.width ?? 3,
          height: thumbnail?.height ?? 4,
          execution,
        };
      }),
    [executions, thumbnails],
  );

  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isFetchingNextPage)
        void fetchNextPage();
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="py-8">
      <header className="mb-6 flex items-end justify-between gap-6 px-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">Galería</h1>
          <p className="mt-1 text-sm text-slate-400">
            Todo lo que generaste, de lo más nuevo a lo más viejo.
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <CheckboxSelect
            label="Tipo"
            options={TYPE_OPTIONS}
            selected={types}
            onChange={setTypes}
          />
          <CheckboxSelect
            label="Estado"
            options={STATUS_OPTIONS}
            selected={statuses}
            onChange={setStatuses}
          />
          <CheckboxSelect
            label="Autor"
            options={userOptions}
            selected={userIds}
            onChange={setUserIds}
          />
        </div>
      </header>

      {isPending ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : executions.length === 0 ? (
        <p className="py-20 text-center text-sm text-slate-500">
          {types.length || statuses.length || userIds.length
            ? "Ningún resultado con esos filtros."
            : "Todavía no generaste nada."}
        </p>
      ) : (
        <>
          {/* El negro se ve por el spacing: es lo que dibuja las líneas finas
              entre celdas sin pintar bordes en cada una. */}
          {/* Cuatro por fila, celdas iguales. El negro se ve por el gap: es
              lo que dibuja las líneas finas entre celdas sin pintar bordes en
              cada una, que se duplicarían entre vecinas. */}
          <div className="grid grid-cols-2 gap-[3px] bg-black sm:grid-cols-4">
            {photos.map(({ src, execution }) => {
              const Fallback = FALLBACK_ICON[execution.resultMediaType];
              const playable = execution.status === ExecutionStatus.Completed;

              return (
                <button
                  key={execution.id}
                  type="button"
                  onClick={() => playable && setOpened(execution)}
                  disabled={!playable}
                  title={execution.context.name ?? undefined}
                  className="group relative aspect-[3/4] overflow-hidden bg-slate-900 disabled:cursor-default"
                >
                  {src ? (
                    <img
                      src={src}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-slate-700">
                      <Fallback className="size-8" />
                    </span>
                  )}

                  <GalleryOverlay
                    execution={execution}
                    author={
                      execution.userId ? usersById[execution.userId] : undefined
                    }
                  />
                </button>
              );
            })}
          </div>

          <div ref={sentinel} className="flex justify-center py-8">
            {isFetchingNextPage && <Spinner className="size-6" />}
          </div>
        </>
      )}

      <PlayerModal execution={opened} onClose={() => setOpened(null)} />
    </div>
  );
}

function PlayerModal({
  execution,
  onClose,
}: {
  execution: WorkflowExecution | null;
  onClose: () => void;
}) {
  const { data: videoUrl, isPending } = useVideoUrl(
    execution?.id ?? null,
    Boolean(execution),
  );

  return (
    <Modal
      open={Boolean(execution)}
      onClose={onClose}
      title={execution?.context.name ?? "Resultado"}
    >
      <div className="flex min-h-64 items-center justify-center">
        {isPending ? (
          <Spinner />
        ) : videoUrl ? (
          <video
            src={videoUrl}
            controls
            autoPlay
            className="max-h-[65vh] rounded-lg"
          />
        ) : (
          <p className="text-xs text-slate-500">No se pudo cargar el video.</p>
        )}
      </div>
    </Modal>
  );
}
