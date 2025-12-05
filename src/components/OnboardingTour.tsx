import { useState, useEffect, useCallback } from 'react'
import { telemetry } from '../analytics/telemetry'
import './OnboardingTour.css'

const ONBOARDING_KEY = 'svn-onboarding-completed'

type TourStep = {
  target: string  // CSS selector or description
  title: string
  content: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const tourSteps: TourStep[] = [
  {
    target: '.panel--inputs',
    title: '📊 Enter Your Metrics',
    content: 'Start by entering your company name, funding stage, and key metrics like ARR, growth rate, and margins. These inputs drive the valuation calculation.',
    position: 'right',
  },
  {
    target: '.scenario-grid',
    title: '📈 See Live Valuations',
    content: 'Watch Bear, Base, and Bull case valuations update in real-time as you adjust your inputs. The methodology adapts to your funding stage automatically.',
    position: 'left',
  },
  {
    target: '.save-section',
    title: '💾 Save & Share',
    content: 'Save your valuations to build a library, share them with investors via unique links, or compare multiple scenarios in the Portfolio view.',
    position: 'top',
  },
]

type OnboardingTourProps = {
  onComplete?: () => void
}

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  // Check if user has completed onboarding
  useEffect(() => {
    const hasCompleted = localStorage.getItem(ONBOARDING_KEY)
    if (!hasCompleted) {
      // Small delay to let page render and ensure target elements exist
      const timer = setTimeout(() => {
        // Check that target elements exist before starting tour
        const inputsPanel = document.querySelector('.panel--inputs')
        const scenarioGrid = document.querySelector('.scenario-grid')
        const saveSection = document.querySelector('.save-section')
        
        if (inputsPanel && scenarioGrid && saveSection) {
          setIsActive(true)
          telemetry.track('onboarding_started', {})
        } else {
          // Try again after another short delay if elements not ready
          setTimeout(() => {
            setIsActive(true)
            telemetry.track('onboarding_started', {})
          }, 500)
        }
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [])

  // Update target position when step changes
  useEffect(() => {
    if (!isActive) return

    const updatePosition = () => {
      const step = tourSteps[currentStep]
      const target = document.querySelector(step.target)
      if (target) {
        setTargetRect(target.getBoundingClientRect())
      }
    }

    updatePosition()

    // Update on scroll or resize
    window.addEventListener('scroll', updatePosition)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isActive, currentStep])

  const handleNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }, [currentStep])

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    telemetry.track('onboarding_skipped', { step: currentStep })
    handleComplete()
  }

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setIsActive(false)
    telemetry.track('onboarding_completed', {})
    onComplete?.()
  }

  // Allow replaying the tour
  const handleReplay = useCallback(() => {
    localStorage.removeItem(ONBOARDING_KEY)
    setCurrentStep(0)
    setIsActive(true)
    telemetry.track('onboarding_started', { replayed: true })
  }, [])

  // Expose replay function globally for the navbar
  useEffect(() => {
    (window as unknown as { replayOnboarding?: () => void }).replayOnboarding = handleReplay
    return () => {
      delete (window as unknown as { replayOnboarding?: () => void }).replayOnboarding
    }
  }, [handleReplay])

  if (!isActive) return null

  const step = tourSteps[currentStep]
  const isLastStep = currentStep === tourSteps.length - 1
  const isFirstStep = currentStep === 0

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) return { opacity: 0 }

    const padding = 16
    const tooltipWidth = 320
    const tooltipHeight = 200 // Approximate

    switch (step.position) {
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
          left: targetRect.right + padding,
        }
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
          left: targetRect.left - tooltipWidth - padding,
        }
      case 'bottom':
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        }
      case 'top':
      default:
        return {
          top: targetRect.top - tooltipHeight - padding,
          left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        }
    }
  }

  return (
    <div className="onboarding-overlay" data-testid="onboarding-tour">
      {/* Backdrop */}
      <div className="onboarding-backdrop" onClick={handleSkip} />
      
      {/* Spotlight on target */}
      {targetRect && (
        <div 
          className="onboarding-spotlight"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Tooltip */}
      <div 
        className={`onboarding-tooltip onboarding-tooltip--${step.position}`}
        style={getTooltipStyle()}
      >
        <div className="onboarding-tooltip__progress">
          {tourSteps.map((_, index) => (
            <div 
              key={index}
              className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            />
          ))}
        </div>

        <h3 className="onboarding-tooltip__title">{step.title}</h3>
        <p className="onboarding-tooltip__content">{step.content}</p>

        <div className="onboarding-tooltip__actions">
          <button 
            onClick={handleSkip}
            className="onboarding-btn onboarding-btn--skip"
            data-testid="onboarding-skip"
          >
            Skip tour
          </button>
          <div className="onboarding-btn-group">
            {!isFirstStep && (
              <button 
                onClick={handleBack}
                className="onboarding-btn onboarding-btn--secondary"
              >
                Back
              </button>
            )}
            <button 
              onClick={handleNext}
              className="onboarding-btn onboarding-btn--primary"
              data-testid="onboarding-next"
            >
              {isLastStep ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export function to check/reset onboarding
export function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === 'true'
}

export function resetOnboarding(): void {
  localStorage.removeItem(ONBOARDING_KEY)
}

