import { useEffect, useMemo, useState } from 'react'
import { fetchToilets } from './api/toiletsApi'
import { ToiletDetailCard } from './components/ToiletDetailCard'
import { ToiletFilterPanel } from './components/ToiletFilterPanel'
import { ToiletList } from './components/ToiletList'
import { ToiletMap } from './components/ToiletMap'
import { useUserLocation } from './hooks/useUserLocation'
import type { Toilet } from './types/Toilet'
import type { ToiletDisplayItem } from './types/ToiletDisplayItem'
import {
  DEFAULT_TOILET_FILTERS,
  type ToiletFilters,
} from './types/ToiletFilters'
import {
  countActiveToiletFilters,
  filterToilets,
  hasActiveToiletFilters,
} from './utils/toiletFilters'
import {
  DEFAULT_MAXIMUM_RESULTS,
  findNearbyToilets,
} from './utils/toiletSearch'
import './App.css'

type OpenPanel = 'filters' | 'list' | null

function App() {
  const [toilets, setToilets] = useState<Toilet[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)

  // Store the ID and derive the selected toilet from current results.
  const [selectedToiletId, setSelectedToiletId] =
    useState<Toilet['id'] | null>(null)

  const [filters, setFilters] = useState<ToiletFilters>(
    DEFAULT_TOILET_FILTERS,
  )

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
        // Cancellation is expected during effect cleanup.
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          return
        }

        const message =
          error instanceof Error ? error.message : 'Unknown error'

        setErrorMessage(message)
      } finally {
        // A cancelled request must not finish another request's loading state.
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadToilets()

    return () => {
      controller.abort()
    }
  }, [])

  // Find all nearby toilets before applying filters and the list limit.
  const nearbyToilets: ToiletDisplayItem[] = useMemo(() => {
    if (!userLocation) {
      return toilets
    }

    return findNearbyToilets(toilets, userLocation, {
      maximumResults: toilets.length,
    })
  }, [toilets, userLocation])

  const filteredToilets = useMemo(
    () => filterToilets(nearbyToilets, filters),
    [nearbyToilets, filters],
  )

  const displayedToilets = useMemo(
    () => filteredToilets.slice(0, DEFAULT_MAXIMUM_RESULTS),
    [filteredToilets],
  )

  // Derive this value during rendering instead of updating state in an effect.
  const selectedToilet =
    displayedToilets.find(
      (toilet) => toilet.id === selectedToiletId,
    ) ?? null

  const activeFilterCount = countActiveToiletFilters(filters)
  const filtersAreActive = hasActiveToiletFilters(filters)

  const showNoNearbyToiletsMessage =
    userLocation !== null && nearbyToilets.length === 0

  const showNoFilterMatchesMessage =
    filtersAreActive &&
    nearbyToilets.length > 0 &&
    filteredToilets.length === 0

  const locationStatusMessage = (() => {
    if (userLocationErrorMessage) {
      return userLocationErrorMessage
    }

    if (userLocationStatus === 'loading') {
      return 'Finding your location...'
    }

    if (showNoNearbyToiletsMessage) {
      return 'No toilets found within 2 km.'
    }

    if (showNoFilterMatchesMessage) {
      return 'No toilets match the selected filters.'
    }

    if (userLocationStatus === 'success') {
      return `Showing ${displayedToilets.length} of ${nearbyToilets.length} nearby toilets.`
    }

    return null
  })()

  const listEmptyMessage = filtersAreActive
    ? 'No toilets match the selected filters.'
    : userLocation
      ? 'No toilets found within 2 km.'
      : 'No toilets found.'

  function handleSelectToilet(toilet: ToiletDisplayItem) {
    setSelectedToiletId(toilet.id)
    setOpenPanel(null)
  }

  function handleCloseToiletDetails() {
    setSelectedToiletId(null)
  }

  function handleFiltersChange(nextFilters: ToiletFilters) {
    setFilters(nextFilters)

    const nextDisplayedToilets = filterToilets(
      nearbyToilets,
      nextFilters,
    ).slice(0, DEFAULT_MAXIMUM_RESULTS)

    const selectionStillExists = nextDisplayedToilets.some(
      (toilet) => toilet.id === selectedToiletId,
    )

    // Clear a removed selection as part of the filter-change event.
    // Resetting the filters later should not reopen old details.
    if (!selectionStillExists) {
      setSelectedToiletId(null)
    }
  }

  function handleResetFilters() {
    handleFiltersChange(DEFAULT_TOILET_FILTERS)
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

          {selectedToilet && openPanel === null && (
            <ToiletDetailCard
              toilet={selectedToilet}
              onClose={handleCloseToiletDetails}
            />
          )}

          {openPanel === null && (
            <div className="map-action-buttons">
              <button
                className="map-action-button"
                type="button"
                aria-expanded={false}
                aria-controls="toilet-filter-panel"
                onClick={() => setOpenPanel('filters')}
              >
                Filters
                {activeFilterCount > 0
                  ? ` (${activeFilterCount})`
                  : ''}
              </button>

              <button
                className="map-action-button map-action-button--primary"
                type="button"
                aria-expanded={false}
                aria-controls="toilet-list-panel"
                onClick={() => setOpenPanel('list')}
              >
                Show list ({displayedToilets.length})
              </button>
            </div>
          )}

          {openPanel === 'filters' && (
            <aside
              id="toilet-filter-panel"
              className="filter-panel"
              aria-label="Filter nearby toilets"
            >
              <ToiletFilterPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onResetFilters={handleResetFilters}
                onClose={() => setOpenPanel(null)}
              />
            </aside>
          )}

          {openPanel === 'list' && (
            <aside
              id="toilet-list-panel"
              className="toilet-list-panel"
              aria-label="List of available toilets"
            >
              <button
                className="close-list-button"
                type="button"
                aria-expanded={true}
                aria-controls="toilet-list-panel"
                onClick={() => setOpenPanel(null)}
              >
                Close list
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