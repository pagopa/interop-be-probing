import type { LangCode } from '@/types/commons.types'
import type { InferRouteKey } from '@pagopa/interop-fe-commons'
import { InteropRouterBuilder } from '@pagopa/interop-fe-commons'
import { createBrowserRouter } from 'react-router-dom'
import RoutesWrapper from './RoutesWrapper'
import { HomePage } from '@/pages/HomePage/Home.page'

export const { routes, reactRouterDOMRoutes, hooks, components, utils } = new InteropRouterBuilder<
  LangCode,
  'admin'
>({
  languages: ['it', 'en'],
})
  .addRoute({
    key: 'HOME',
    path: '/home',
    element: <HomePage />,
    public: true,
    authLevels: ['admin'],
  })
  .build()
export type RouteKey = InferRouteKey<typeof routes>

export const router = createBrowserRouter(
  [
    {
      element: <RoutesWrapper />,
      children: reactRouterDOMRoutes,
    },
    { path: '/', element: <components.Redirect to="HOME" /> },
    { path: '/*', element: <components.Redirect to="HOME" /> },
  ],
  { basename: '/' }
)