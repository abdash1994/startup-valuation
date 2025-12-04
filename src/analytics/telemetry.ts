export type TelemetryEventName =
  | 'input_changed'
  | 'stage_changed'
  | 'scenario_rendered'
  | 'insight_copied'

export type TelemetryPayload = Record<string, string | number | boolean>

type TelemetryEvent = {
  name: TelemetryEventName
  timestamp: number
  payload?: TelemetryPayload
}

type TelemetrySubscriber = (event: TelemetryEvent) => void

const subscribers = new Set<TelemetrySubscriber>()

export const telemetry = {
  track(name: TelemetryEventName, payload?: TelemetryPayload) {
    const event: TelemetryEvent = {
      name,
      timestamp: Date.now(),
      payload,
    }

    if (import.meta.env.DEV) {
      console.debug('[telemetry]', event)
    }

    subscribers.forEach((subscriber) => subscriber(event))

    if (typeof window !== 'undefined' && 'navigator' in window) {
      if (typeof window.navigator.sendBeacon === 'function') {
        try {
          const blob = new Blob([JSON.stringify(event)], { type: 'application/json' })
          window.navigator.sendBeacon('/telemetry-placeholder', blob)
        } catch {
          // Ignore beacon failures; this placeholder illustrates where production analytics would go.
        }
      }
    }
  },
  subscribe(subscriber: TelemetrySubscriber) {
    subscribers.add(subscriber)
    return () => subscribers.delete(subscriber)
  },
}

export type TelemetryAction =
  | { type: 'input' }
  | { type: 'scenario' }

export type TelemetryState = {
  inputInteractions: number
  scenarioRenders: number
}

export const telemetryInitialState: TelemetryState = {
  inputInteractions: 0,
  scenarioRenders: 0,
}

export const telemetryReducer = (state: TelemetryState, action: TelemetryAction): TelemetryState => {
  switch (action.type) {
    case 'input':
      return { ...state, inputInteractions: state.inputInteractions + 1 }
    case 'scenario':
      return { ...state, scenarioRenders: state.scenarioRenders + 1 }
    default:
      return state
  }
}

