import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="label-upper mb-4">Error</p>
        <h1 className="font-serif-display text-7xl sm:text-8xl font-bold golden-text mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-[#f5f5f5] mb-4">Page Not Found</h2>
        <p className="text-[#a3a3a3] mb-8">
          The page you are looking for does not exist.
        </p>
        <Link href="/" className="btn-primary">
          Go Back Home
        </Link>
      </div>
    </div>
  )
}
