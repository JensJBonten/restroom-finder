import { useEffect, useState } from 'react'
import { fetchToilets } from './api/toiletsApi'
import { ToiletList } from './components/ToiletList'
import type { Toilet } from './types/Toilet'
import './App.css'

function App() {
  const [toilets, setToilets] = useState<Toilet[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadToilets() {
      try {
        const toiletData = await fetchToilets()
        setToilets(toiletData)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'

        setErrorMessage(message)
      } finally {
        setLoading(false)
      }
    }

    loadToilets()
  }, [])

  return (
    <main>
      <h1>Toilapp</h1>
      <p>Find nearby toilets in the city.</p>

      {loading && <p>Loading toilets...</p>}

      {errorMessage && (
        <p role="alert">Could not load toilets: {errorMessage}</p>
      )}

      {!loading && !errorMessage && (
        <ToiletList toilets={toilets} />
      )}
    </main>
  )
}

export default App