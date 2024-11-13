

export type AppCommands = 'code' | 'run' | 'deploy' | 'open' | 'save' | 'new' | 'remove' | ''

export type AppCommand = {
  command: AppCommands,
  payload?: any
  event?: any
}

export function useEventBus() {
  return useState<AppCommand>('eventBus', () => { return { command: '' } })
}

export function emitEvent(command: AppCommands, event?: any, payload?: any) {
  useEventBus().value = { command, payload, event }
}