export interface WorkerDiagnostic {
  message: string
  start: number | undefined
  length: number | undefined
  stack?: string
}

export interface WorkerResponse {
  lua: string
  diagnostics: WorkerDiagnostic[]
}
