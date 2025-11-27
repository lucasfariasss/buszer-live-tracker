export const FloatingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Círculos flutuantes com gradientes */}
      <div
        className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl animate-float"
        style={{
          background: 'radial-gradient(circle, hsl(193 91% 21%) 0%, transparent 70%)'
        }}
      />
      <div
        className="absolute bottom-32 right-20 w-96 h-96 rounded-full opacity-15 blur-3xl animate-float-delayed"
        style={{
          background: 'radial-gradient(circle, hsl(187 85% 36%) 0%, transparent 70%)'
        }}
      />
      <div
        className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full opacity-10 blur-3xl animate-float"
        style={{
          background: 'radial-gradient(circle, hsl(142 76% 36%) 0%, transparent 70%)',
          animationDelay: '2s'
        }}
      />
    </div>
  )
}
