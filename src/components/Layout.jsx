export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-stone-100">
      <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}