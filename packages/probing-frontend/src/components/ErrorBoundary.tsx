import React from 'react'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import type { FallbackProps } from 'react-error-boundary'
import { ErrorBoundary as _ErrorBoundary } from 'react-error-boundary'

type ErrorBoundaryProps = {
  children: React.ReactNode
  FallbackComponent: React.ComponentType<FallbackProps>
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, FallbackComponent }) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <_ErrorBoundary onReset={reset} FallbackComponent={FallbackComponent}>
          {children}
        </_ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
