export { RouterProvider } from './RouterProvider'
import * as _routes from './routes'

export const {
  useNavigate,
  useParams,
  useLocation,
  useAuthGuard,
  useGeneratePath,
  useSwitchPathLang,
} = _routes.hooks
export const { Link, Redirect, Breadcrumbs } = _routes.components
export const { getParentRoutes } = _routes.utils
export type RouteKey = _routes.RouteKey
export const routes = _routes.routes
