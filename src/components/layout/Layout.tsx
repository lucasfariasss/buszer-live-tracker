import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  currentPath?: string
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen w-full">
      {children}
    </div>
  )
}
