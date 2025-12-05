/**
 * Telemetry Event System
 * 
 * Tracks user interactions for analytics and debugging.
 * Currently logs to console in development mode and prepares
 * beacon payloads for production integration.
 * 
 * To integrate with a real analytics service (Mixpanel, Amplitude, etc.):
 * 1. Add the service SDK to the project
 * 2. Initialize in the track() function
 * 3. Forward events to the service
 */

export type TelemetryEventName =
  | 'input_changed'
  | 'stage_changed'
  | 'scenario_rendered'
  | 'insight_copied'
  // New events for Phase 8
  | 'valuation_run'
  | 'scenario_saved'
  | 'report_downloaded'
  | 'share_link_copied'
  | 'page_view'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  | 'methodology_viewed'
  | 'benchmark_interaction'
  | 'portfolio_viewed'
  | 'library_viewed'

export type TelemetryPayload = Record<string, string | number | boolean | null>

type TelemetryEvent = {
  name: TelemetryEventName
  timestamp: number
  payload?: TelemetryPayload
}

type TelemetrySubscriber = (event: TelemetryEvent) => void

const subscribers = new Set<TelemetrySubscriber>()

// Session ID for correlating events within a session
const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export const telemetry = {
  /**
   * Track an analytics event
   * @param name - Event name from TelemetryEventName type
   * @param payload - Optional additional data to attach to the event
   */
  track(name: TelemetryEventName, payload?: TelemetryPayload) {
    try {
      const event: TelemetryEvent = {
        name,
        timestamp: Date.now(),
        payload: {
          ...payload,
          sessionId,
          url: typeof window !== 'undefined' ? window.location.pathname : null,
        },
      }

      // Development logging
      if (import.meta.env.DEV) {
        console.info(`[analytics] ${name}`, payload || '')
      }

      // Notify subscribers
      subscribers.forEach((subscriber) => {
        try {
          subscriber(event)
        } catch (err) {
          console.warn('[telemetry] Subscriber error:', err)
        }
      })

      // Send beacon (placeholder for production analytics)
      if (typeof window !== 'undefined' && 'navigator' in window) {
        if (typeof window.navigator.sendBeacon === 'function') {
          try {
            const blob = new Blob([JSON.stringify(event)], { type: 'application/json' })
            window.navigator.sendBeacon('/telemetry-placeholder', blob)
          } catch {
            // Ignore beacon failures silently
          }
        }
      }
    } catch (err) {
      // Fail silently - analytics should never break the app
      if (import.meta.env.DEV) {
        console.warn('[telemetry] Track error:', err)
      }
    }
  },

  /**
   * Track a page view event
   * @param page - Page identifier (e.g., 'valuator', 'library', 'portfolio')
   */
  trackPageView(page: string) {
    this.track('page_view', { page })
  },

  /**
   * Track a valuation run event with key metrics
   */
  trackValuationRun(data: { stage: string; arr: number; growth: number; confidence: number }) {
    this.track('valuation_run', {
      stage: data.stage,
      arr: data.arr,
      growth: data.growth,
      confidence: data.confidence,
      timestamp: Date.now(),
    })
  },

  /**
   * Track when a scenario is saved
   */
  trackScenarioSaved(data: { stage: string; isUpdate: boolean; storage: 'local' | 'cloud' }) {
    this.track('scenario_saved', {
      stage: data.stage,
      isUpdate: data.isUpdate,
      storage: data.storage,
    })
  },

  /**
   * Track report download
   */
  trackReportDownloaded() {
    this.track('report_downloaded', {})
  },

  /**
   * Track share link copied
   */
  trackShareLinkCopied() {
    this.track('share_link_copied', {})
  },

  /**
   * Subscribe to telemetry events
   * @returns Unsubscribe function
   */
  subscribe(subscriber: TelemetrySubscriber) {
    subscribers.add(subscriber)
    return () => subscribers.delete(subscriber)
  },

  /**
   * Get current session ID
   */
  getSessionId() {
    return sessionId
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

