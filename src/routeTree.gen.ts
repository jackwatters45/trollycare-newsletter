/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'

// Create Virtual Routes

const LoginLazyImport = createFileRoute('/login')()
const HistoryLazyImport = createFileRoute('/history')()
const GenerateLazyImport = createFileRoute('/generate')()
const ExampleLazyImport = createFileRoute('/example')()
const IndexLazyImport = createFileRoute('/')()
const NewslettersNewsletterIdLazyImport = createFileRoute(
  '/newsletters/$newsletterId',
)()

// Create/Update Routes

const LoginLazyRoute = LoginLazyImport.update({
  path: '/login',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/login.lazy').then((d) => d.Route))

const HistoryLazyRoute = HistoryLazyImport.update({
  path: '/history',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/history.lazy').then((d) => d.Route))

const GenerateLazyRoute = GenerateLazyImport.update({
  path: '/generate',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/generate.lazy').then((d) => d.Route))

const ExampleLazyRoute = ExampleLazyImport.update({
  path: '/example',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/example.lazy').then((d) => d.Route))

const IndexLazyRoute = IndexLazyImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const NewslettersNewsletterIdLazyRoute =
  NewslettersNewsletterIdLazyImport.update({
    path: '/newsletters/$newsletterId',
    getParentRoute: () => rootRoute,
  } as any).lazy(() =>
    import('./routes/newsletters/$newsletterId.lazy').then((d) => d.Route),
  )

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/example': {
      id: '/example'
      path: '/example'
      fullPath: '/example'
      preLoaderRoute: typeof ExampleLazyImport
      parentRoute: typeof rootRoute
    }
    '/generate': {
      id: '/generate'
      path: '/generate'
      fullPath: '/generate'
      preLoaderRoute: typeof GenerateLazyImport
      parentRoute: typeof rootRoute
    }
    '/history': {
      id: '/history'
      path: '/history'
      fullPath: '/history'
      preLoaderRoute: typeof HistoryLazyImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginLazyImport
      parentRoute: typeof rootRoute
    }
    '/newsletters/$newsletterId': {
      id: '/newsletters/$newsletterId'
      path: '/newsletters/$newsletterId'
      fullPath: '/newsletters/$newsletterId'
      preLoaderRoute: typeof NewslettersNewsletterIdLazyImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IndexLazyRoute,
  ExampleLazyRoute,
  GenerateLazyRoute,
  HistoryLazyRoute,
  LoginLazyRoute,
  NewslettersNewsletterIdLazyRoute,
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/example",
        "/generate",
        "/history",
        "/login",
        "/newsletters/$newsletterId"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/example": {
      "filePath": "example.lazy.tsx"
    },
    "/generate": {
      "filePath": "generate.lazy.tsx"
    },
    "/history": {
      "filePath": "history.lazy.tsx"
    },
    "/login": {
      "filePath": "login.lazy.tsx"
    },
    "/newsletters/$newsletterId": {
      "filePath": "newsletters/$newsletterId.lazy.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
