import {
  useEffect,
  useMemo,
  useState,
} from 'react'
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

type OpenPanel =
  | 'filters'
  | 'list'
  | null

function App() {
  const [toilets, setToilets] =
    useState<Toilet[]>([])

  const [loading, setLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const [openPanel, setOpenPanel] =
    useState<OpenPanel>(null)

  const [selectedToilet, setSelectedToilet] =
    useState<ToiletDisplayItem | null>(
      null,
    )

  const [filters, setFilters] =
    useState<ToiletFilters>(
      DEFAULT_TOILET_FILTERS,
    )

  const {
    coordinates: userLocation,
    status: userLocationStatus,
    errorMessage:
      userLocationErrorMessage,
  } = useUserLocation()

  useEffect(() => {
    const controller =
      new AbortController()

    async function loadToilets() {
      try {
        const toiletData =
          await fetchToilets(
            controller.signal,
          )

        setToilets(toiletData)
      } catch (error) {
        /*
         * AbortError is expected when React cleans up the effect.
         * It should not be presented as an application failure.
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
         * StrictMode may cancel the first development request while
         * starting another. A cancelled request must not finish the
         * loading state for the active request.
         */
        if (
          !controller.signal.aborted
        ) {
          setLoading(false)
        }
      }
    }

    loadToilets()

    return () => {
      controller.abort()
    }
  }, [])

  /*
   * Request every toilet inside the radius before applying user
   * filters. Limiting to six first could hide a matching seventh
   * toilet.
   */
  const nearbyToilets:
    ToiletDisplayItem[] =
    useMemo(() => {
      if (!userLocation) {
        return toilets
      }

      return findNearbyToilets(
        toilets,
        userLocation,
        {
          maximumResults:
            toilets.length,
        },
      )
    }, [toilets, userLocation])

  const filteredToilets =
    useMemo(
      () =>
        filterToilets(
          nearbyToilets,
          filters,
        ),
      [nearbyToilets, filters],
    )

  const displayedToilets =
    useMemo(
      () =>
        filteredToilets.slice(
          0,
          DEFAULT_MAXIMUM_RESULTS,
        ),
      [filteredToilets],
    )

  const activeFilterCount =
    countActiveToiletFilters(filters)

  const filtersAreActive =
    hasActiveToiletFilters(filters)

  const showNoNearbyToiletsMessage =
    userLocation !== null &&
    nearbyToilets.length === 0

  const showNoFilterMatchesMessage =
    filtersAreActive &&
    nearbyToilets.length > 0 &&
    filteredToilets.length === 0

  const locationStatusMessage =
    (() => {
      if (
        userLocationErrorMessage
      ) {
        return userLocationErrorMessage
      }

      if (
        userLocationStatus ===
        'loading'
      ) {
        return 'Finding your location...'
      }

      if (
        showNoNearbyToiletsMessage
      ) {
        return 'No toilets found within 2 km.'
      }

      if (
        showNoFilterMatchesMessage
      ) {
        return 'No toilets match the selected filters.'
      }

      if (
        userLocationStatus ===
        'success'
      ) {
        return `Showing ${displayedToilets.length} of ${nearbyToilets.length} nearby toilets.`
      }

      return null
    })()

  const listEmptyMessage =
    filtersAreActive
      ? 'No toilets match the selected filters.'
      : userLocation
        ? 'No toilets found within 2 km.'
        : 'No toilets found.'

  /*
   * If active filters remove the selected toilet, the detail card
   * must close. Otherwise App could show details for a toilet that
   * is no longer present on the map or in the list.
   */
  useEffect(() => {
    if (!selectedToilet) {
      return
    }

    const selectedToiletIsVisible =
      displayedToilets.some(
        (toilet) =>
          toilet.id ===
          selectedToilet.id,
      )

    if (
      !selectedToiletIsVisible
    ) {
      setSelectedToilet(null)
    }
  }, [
    displayedToilets,
    selectedToilet,
  ])

  /**
   * Stores a toilet selected from either the map or the list.
   */
  function handleSelectToilet(
    toilet: ToiletDisplayItem,
  ) {
    setSelectedToilet(toilet)
    setOpenPanel(null)
  }

  function handleCloseToiletDetails() {
    setSelectedToilet(null)
  }

  function handleFiltersChange(
    nextFilters: ToiletFilters,
  ) {
    setFilters(nextFilters)
  }

  function handleResetFilters() {
    setFilters(
      DEFAULT_TOILET_FILTERS,
    )
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Toilapp</h1>

          <p>
            Find nearby toilets in Oslo.
          </p>
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
            Could not load toilets:{' '}
            {errorMessage}
          </p>
        </section>
      )}

      {!loading &&
        !errorMessage && (
          <section
            className="map-wrapper"
            aria-label="Map showing nearby toilets"
          >
            <ToiletMap
              toilets={
                displayedToilets
              }
              userLocation={
                userLocation
              }
              onSelectToilet={
                handleSelectToilet
              }
            />

            {locationStatusMessage && (
              <div
                className="location-status-card"
                role="status"
                aria-live="polite"
              >
                <p>
                  {
                    locationStatusMessage
                  }
                </p>
              </div>
            )}

            {selectedToilet &&
              openPanel === null && (
                <ToiletDetailCard
                  toilet={
                    selectedToilet
                  }
                  onClose={
                    handleCloseToiletDetails
                  }
                />
              )}

            {openPanel === null && (
              <div className="map-action-buttons">
                <button
                  className="map-action-button"
                  type="button"
                  aria-expanded={
                    false
                  }
                  aria-controls="toilet-filter-panel"
                  onClick={() =>
                    setOpenPanel(
                      'filters',
                    )
                  }
                >
                  Filters
                  {activeFilterCount >
                  0
                    ? ` (${activeFilterCount})`
                    : ''}
                </button>

                <button
                  className="map-action-button map-action-button--primary"
                  type="button"
                  aria-expanded={
                    false
                  }
                  aria-controls="toilet-list-panel"
                  onClick={() =>
                    setOpenPanel(
                      'list',
                    )
                  }
                >
                  Show list (
                  {
                    displayedToilets.length
                  }
                  )
                </button>
              </div>
            )}

            {openPanel ===
              'filters' && (
              <aside
                id="toilet-filter-panel"
                className="filter-panel"
                aria-label="Filter nearby toilets"
              >
                <ToiletFilterPanel
                  filters={filters}
                  onFiltersChange={
                    handleFiltersChange
                  }
                  onResetFilters={
                    handleResetFilters
                  }
                  onClose={() =>
                    setOpenPanel(null)
                  }
                />
              </aside>
            )}

            {openPanel ===
              'list' && (
              <aside
                id="toilet-list-panel"
                className="toilet-list-panel"
                aria-label="List of available toilets"
              >
                <button
                  className="close-list-button"
                  type="button"
                  aria-expanded={
                    true
                  }
                  aria-controls="toilet-list-panel"
                  onClick={() =>
                    setOpenPanel(null)
                  }
                >
                  Close list
                </button>

                <ToiletList
                  toilets={
                    displayedToilets
                  }
                  selectedToiletId={
                    selectedToilet?.id
                  }
                  emptyMessage={
                    listEmptyMessage
                  }
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