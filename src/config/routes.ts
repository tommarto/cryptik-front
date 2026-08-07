/**
 * Paths de la app en un solo lugar — los usan el router y los links.
 * Vive fuera de `router.tsx` para que los componentes puedan importarlos
 * sin generar un ciclo (router → layout → router).
 */
export enum AppRoutes {
  Home = '/',
  InfiniteTalk = '/lipsync/infinitetalk',
}
