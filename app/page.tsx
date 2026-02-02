import { Button } from '@/components/Button'
import { greet } from '@/lib/utils'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold" data-testid="heading">
        {greet('World')}
      </h1>
      <p className="text-gray-600" data-testid="description">
        A basic Next.js project with Playwright testing
      </p>
      <Button>Get Started</Button>
    </main>
  )
}
