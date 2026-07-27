import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { fetchToilets } from './api/toiletsApi'
import { ToiletDetailCard } from './components/ToiletDetailCard'
import { ToiletList } from './components/ToiletList'
import { ToiletMap } from './components/ToiletMap'
import { useUserLocation } from './hooks/useUserLocation'
import type { Toilet } from './types/Toilet'
import type { ToiletDisplayItem } from './types/ToiletDisplayItem'
import { findNearbyToilets } from './utils/toiletSearch'
import './App.css'

function App() {
  const [toilets, setToilets] =
    useState<Toilet[]>([])

  const [loading, setLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const [showList, setShowList] =
    useState(false)

  const [selectedToilet, setSelectedToilet] =
    useState<ToiletDisplayItem | null>(null)

  const {
    coordinates: userLocation,
    status: userLocationStatus,
    errorMessage: userLocationErrorMessage,
  } = useUserLocation()

  useEffect(() => {
    const controller = new AbortController()

    async function loadToilets() {
      try {
        const toiletData = await fetchToilets(
          controller.signal,
        )

        setToilets(toiletData)
      } catch (error) {
        /*
         * Aborting is expected when React cleans up the effect.
         * It should therefore not be shown as an application error.
         */
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          return
        }

        const message =
          error instanceof Error
            ? error.message
            : 'Unknown error'

        setErrorMessage(message)
      } finally {
        /*
         * StrictMode can cancel the first development request while
         * starting another. The cancelled request must not change the
         * shared loading state.
         */
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadToilets()

    return () => {
      /*
       * Cancelling prevents an obsolete request from updating state
       * after unmounting or a StrictMode effect restart.
       */
      controller.abort()
    }
  }, [])

  const displayedToilets: ToiletDisplayItem[] =
    useMemo(() => {
      if (!userLocation) {
        return toilets
      }

      return findNearbyToilets(
        toilets,
        userLocation,
      )
    }, [toilets, userLocation])

  const showNoNearbyToiletsMessage =
    userLocation !== null &&
    displayedToilets.length === 0

  const locationStatusMessage = (() => {
    if (showNoNearbyToiletsMessage) {
      return 'No toilets found within 2 km.'
    }

    if (userLocationErrorMessage) {
      return userLocationErrorMessage
    }

    if (userLocationStatus === 'loading') {
      return 'Finding your location...'
    }

    if (userLocationStatus === 'success') {
      return 'Showing toilets within 2 km of your location.'
    }

    return null
  })()

  const listEmptyMessage = userLocation
    ? 'No toilets found within 2 km.'
    : 'No toilets found.'

  /**
   * Stores the toilet selected from either the map or list.
   *
   * The list closes so it does not cover the detail card on smaller
   * screens.
   */
  function handleSelectToilet(
    toilet: ToiletDisplayItem,
  ) {
    setSelectedToilet(toilet)
    setShowList(false)
  }

  /**
   * Removes the current selection and hides the detail card.
   */
  function handleCloseToiletDetails() {
    setSelectedToilet(null)
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Toilapp</h1>
          <p>Find nearby toilets in Oslo.</p>
        </div>
      </header>

      {loading && (
        <section
          className="status-panel"
          aria-live="polite"
          aria-busy="true"
        >
          <p>Loading toilets...</p>
        </section>
      )}

      {errorMessage && (
        <section className="status-panel status-panel--error">
          <p role="alert">
            Could not load toilets: {errorMessage}
          </p>
        </section>
      )}

      {!loading && !errorMessage && (
        <section
          className="map-wrapper"
          aria-label="Map showing nearby toilets"
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

          {selectedToilet && (
            <ToiletDetailCard
              toilet={selectedToilet}
              onClose={
                handleCloseToiletDetails
              }
            />
          )}

          {!showList && (
            <button
              className="list-toggle-button"
              type="button"
              aria-expanded="false"
              aria-controls="toilet-list-panel"
              onClick={() => setShowList(true)}
            >
              Show list ({displayedToilets.length})
            </button>
          )}

          {showList && (
            <aside
              id="toilet-list-panel"
              className="toilet-list-panel"
              aria-label="List of available toilets"
            >
              <button
                className="close-list-button"
                type="button"
                aria-expanded="true"
                aria-controls="toilet-list-panel"
                onClick={() =>
                  setShowList(false)
                }
              >
                Close list
              </button>

              <ToiletList
                toilets={displayedToilets}
                selectedToiletId={
                  selectedToilet?.id
                }
                emptyMessage={listEmptyMessage}
                onSelectToilet={
                  handleSelectToilet
                }
              />
            </aside>
          )}
        </section>
      )}
    </main>
  )
}

export default App