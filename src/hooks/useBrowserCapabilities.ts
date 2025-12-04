import { useEffect, useState } from 'react'

type CapabilitySnapshot = {
  backdropFilter: boolean
  prefersReducedMotion: boolean
}

const detectCapabilities = (): CapabilitySnapshot => {
  const supportsBackdrop =
    typeof window !== 'undefined' &&
    typeof window.CSS !== 'undefined' &&
    typeof window.CSS.supports === 'function' &&
    (window.CSS.supports('backdrop-filter', 'blur(10px)') ||
      window.CSS.supports('-webkit-backdrop-filter', 'blur(10px)'))

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return {
    backdropFilter: Boolean(supportsBackdrop),
    prefersReducedMotion,
  }
}

export const useBrowserCapabilities = () => {
  const [capabilities, setCapabilities] = useState<CapabilitySnapshot>(() => detectCapabilities())

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handleChange = () => {
      setCapabilities(detectCapabilities())
    }

    mediaQuery.addEventListener('change', handleChange)
    window.addEventListener('resize', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      window.removeEventListener('resize', handleChange)
    }
  }, [])

  return capabilities
}

