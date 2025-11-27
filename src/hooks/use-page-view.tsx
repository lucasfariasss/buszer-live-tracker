import { useEffect } from 'react'

export const usePageView = (pageName: string) => {
  useEffect(() => {
    // This hook can be used for analytics tracking
    // For now, it just logs the page view
    console.log(`Page view: ${pageName}`)
  }, [pageName])
}
