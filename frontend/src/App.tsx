import { useEffect, useMemo, useState } from 'react'
import { fetchToilets } from './api/toiletsApi'
import { ToiletDetailCard } from './components/ToiletDetailCard'
import { ToiletList } from './components/ToiletList'
import { ToiletMap } from './components/ToiletMap'
import { useUserLocation } from './hooks/useUserLocation'
import type { Toilet } from './types/Toilet'
import type { ToiletDisplayItem } from './types/ToiletDisplayItem'
import {
  DEFAULT_MAXIMUM_RESULTS,
  findNearbyToilets,
} from './utils/toiletSearch'
import './App.css'

type OpenPanel = 'list' | null

function App() {
  const [toilets, setToilets] = useState<Toilet[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)

  // Store only the identity so selection is derived from current search results.
  const [selectedToiletId, setSelectedToiletId] = useState<Toilet['id'] | null>(null)

  const {
    coordinates: userLocation,
    status: userLocationStatus,
    errorMessage: userLocationErrorMessage,
  } = useUserLocation()

  useEffect(() => {
    const controller = new AbortController()

    async function loadToilets() {
      try {
        const toiletData = await fetchToilets(controller.signal)
        setToilets(toiletData)
      } catch (error) {
        // Cancellation is expected when the component is removed.
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        const message = error instanceof Error ? error.message : 'Ukjent feil'
        setErrorMessage(message)
      } finally {
        // A cancelled request must not complete another request's loading state.
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadToilets()

    return () => controller.abort()
  }, [])

  // Calculate all nearby toilets before limiting the visible result list.
  const nearbyToilets: ToiletDisplayItem[] = useMemo(() => {
    if (!userLocation) {
      return toilets
    }

    return findNearbyToilets(toilets, userLocation, {
      maximumResults: toilets.length,
    })
  }, [toilets, userLocation])

  const displayedToilets = useMemo(
    () => nearbyToilets.slice(0, DEFAULT_MAXIMUM_RESULTS),
    [nearbyToilets],
  )

  // Deriving selection avoids synchronously changing state in an effect.
  const selectedToilet =
    displayedToilets.find((toilet) => toilet.id === selectedToiletId) ?? null

  const showNoNearbyToiletsMessage =
    userLocation !== null && nearbyToilets.length === 0

  const locationStatusMessage = (() => {
    if (userLocationErrorMessage) {
      return userLocationErrorMessage
    }

    if (userLocationStatus === 'loading') {
      return 'Finner posisjonen din...'
    }

    if (showNoNearbyToiletsMessage) {
      return 'Ingen toaletter funnet innenfor 2 km.'
    }

    if (userLocationStatus === 'success') {
      return `Viser ${displayedToilets.length} av ${nearbyToilets.length} toaletter i nærheten.`
    }

    return null
  })()

  const listEmptyMessage = userLocation
    ? 'Ingen toaletter funnet innenfor 2 km.'
    : 'Ingen toaletter funnet.'

  function handleSelectToilet(toilet: ToiletDisplayItem) {
    setSelectedToiletId(toilet.id)
    setOpenPanel(null)
  }

  function handleCloseToiletDetails() {
    setSelectedToiletId(null)
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Toilapp</h1>
          <p>Finn offentlige toaletter i nærheten.</p>
        </div>
      </header>

      {loading && (
        <section className="status-panel" aria-live="polite" aria-busy="true">
          <p>Laster toaletter...</p>
        </section>
      )}

      {errorMessage && (
        <section className="status-panel status-panel--error">
          <p role="alert">Kunne ikke laste toaletter: {errorMessage}</p>
        </section>
      )}

      {!loading && !errorMessage && (
        <section
          className="map-wrapper"
          aria-label="Kart over toaletter i nærheten"
        >
          <ToiletMap
            toilets={displayedToilets}
            userLocation={userLocation}
            onSelectToilet={handleSelectToilet}
          />

          {locationStatusMessage && (
            <div
              className="location-status-card"
              role="status"
              aria-live="polite"
            >
              <p>{locationStatusMessage}</p>
            </div>
          )}

          {selectedToilet && openPanel === null && (
            <ToiletDetailCard
              toilet={selectedToilet}
              onClose={handleCloseToiletDetails}
            />
          )}

          {openPanel === null && (
            <div className="map-action-buttons">
              <button
                className="map-action-button map-action-button--primary"
                type="button"
                aria-expanded={false}
                aria-controls="toilet-list-panel"
                onClick={() => setOpenPanel('list')}
              >
                Vis liste ({displayedToilets.length})
              </button>
            </div>
          )}

          {openPanel === 'list' && (
            <aside
              id="toilet-list-panel"
              className="toilet-list-panel"
              aria-label="Liste over tilgjengelige toaletter"
            >
              <button
                className="close-list-button"
                type="button"
                aria-expanded={true}
                aria-controls="toilet-list-panel"
                onClick={() => setOpenPanel(null)}
              >
                Lukk liste
              </button>

              <ToiletList
                toilets={displayedToilets}
                selectedToiletId={selectedToilet?.id}
                emptyMessage={listEmptyMessage}
                onSelectToilet={handleSelectToilet}
              />
            </aside>
          )}
        </section>
      )}
    </main>
  )
}

export default App