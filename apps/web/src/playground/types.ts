export interface WorkerDiagnostic {
  message: string
  start: number | undefined
  length: number | undefined
}

export interface WorkerResponse {
  lua: string
  diagnostics: WorkerDiagnostic[]
}
