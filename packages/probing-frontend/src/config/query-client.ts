import { useDialogStore, useLoadingOverlayStore, useToastNotificationStore } from '@/stores'
import {
  type Mutation,
  type QueryClientConfig,
  type MutationMeta,
  QueryClient,
} from '@tanstack/react-query'

declare module '@tanstack/react-query' {
  interface MutationMeta<
    TData = unknown,
    TError = unknown,
    TVariables = unknown,
    TContext = unknown
  > {
    loadingLabel?: string | ((variables: TVariables) => string)
    successToastLabel?: string | ((data: TData, variables: TVariables, context: TContext) => string)
    errorToastLabel?: string | ((error: TError, variables: TVariables, context: TContext) => string)
    confirmationDialog?: {
      title: string | ((variables: TVariables) => string)
      description?: string | ((variables: TVariables) => string)
      proceedLabel?: string
    }
  }
}

const { showToast } = useToastNotificationStore.getState()
const { showOverlay, hideOverlay } = useLoadingOverlayStore.getState()
const { openDialog } = useDialogStore.getState()

const resolveMeta = (query: {
  mutation: Mutation<unknown, unknown, unknown>
  data?: unknown
  error?: unknown
  variables?: unknown
  context?: unknown
}) => {
  const { mutation, data, error, variables, context } = query
  const meta = mutation.meta as MutationMeta | undefined

  if (!meta) return {}

  const loadingLabel =
    typeof meta.loadingLabel === 'function' ? meta.loadingLabel(variables) : meta.loadingLabel

  const successToastLabel =
    typeof meta.successToastLabel === 'function'
      ? meta.successToastLabel(data, variables, context)
      : meta.successToastLabel

  const errorToastLabel =
    typeof meta.errorToastLabel === 'function'
      ? meta.errorToastLabel(error, variables, context)
      : meta.errorToastLabel

  const confirmationDialog = meta.confirmationDialog

  const title =
    typeof confirmationDialog?.title === 'function'
      ? confirmationDialog?.title(variables)
      : confirmationDialog?.title

  const description =
    typeof confirmationDialog?.description === 'function'
      ? confirmationDialog?.description(variables)
      : confirmationDialog?.description

  const proceedLabel = confirmationDialog?.proceedLabel

  return {
    loadingLabel,
    successToastLabel,
    errorToastLabel,
    confirmationDialog: confirmationDialog
      ? { title: title as string, description, proceedLabel }
      : undefined,
  }
}

const waitForUserConfirmation = (confirmationDialog: {
  title: string
  description?: string
  proceedLabel?: string
}) => {
  return new Promise((resolve) => {
    openDialog({
      type: 'basic',
      title: confirmationDialog.title,
      description: confirmationDialog.description,
      proceedLabel: confirmationDialog.proceedLabel,
      onProceed: () => {
        resolve(true)
      },
      onCancel: () => {
        resolve(false)
      },
    })
  })
}

/**
 * Error thrown when a mutation is cancelled by the user in the confirmation dialog.
 */
class CancellationError extends Error {
  constructor() {
    super('Mutation cancelled')
  }
}

export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      useErrorBoundary: true,
    },
    mutations: {
      useErrorBoundary: false,
    },
  },
}

const queryClient = new QueryClient(queryClientConfig)
const mutationCache = queryClient.getMutationCache()

mutationCache.config.onMutate = async (variables, mutation) => {
  const meta = resolveMeta({ mutation, variables })
  if (meta.confirmationDialog) {
    const confirmed = await waitForUserConfirmation(meta.confirmationDialog)
    if (!confirmed) return Promise.reject(new CancellationError())
  }
  if (meta.loadingLabel) showOverlay(meta.loadingLabel)
}

mutationCache.config.onSuccess = (data, variables, context, mutation) => {
  const meta = resolveMeta({ mutation, data, variables, context })
  if (meta.successToastLabel) showToast(meta.successToastLabel, 'success')
}

mutationCache.config.onError = (error, variables, context, mutation) => {
  // If the error is due to the user cancelling the mutation, do nothing.
  if (error instanceof CancellationError) return

  const meta = resolveMeta({ mutation, error, variables, context })
  if (meta.errorToastLabel) showToast(meta.errorToastLabel, 'error')
}

mutationCache.config.onSettled = (data, error, variables, context, mutation) => {
  const meta = resolveMeta({ mutation, data, error, variables, context })
  if (meta.loadingLabel) hideOverlay()
}

export { queryClient }
