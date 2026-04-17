'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps'
import styles from './providers.module.css'

function MapController({ center }) {
    const map = useMap()
    useEffect(() => {
        if (map && center) {
            map.panTo(center)
        }
    }, [map, center])
    return null
}

export default function Providers() {
    const [query, setQuery] = useState('')
    const [places, setPlaces] = useState([])
    const [selected, setSelected] = useState(null)
    const [loading, setLoading] = useState(false)
    const [userLocation, setUserLocation] = useState({ lat: 34.0522, lng: -118.2437 })
    const [mapCenter, setMapCenter] = useState({ lat: 34.0522, lng: -118.2437 })
    const [panelWidth, setPanelWidth] = useState(420)
    const isDragging = useRef(false)
    const containerRef = useRef(null)
    const router = useRouter()

    useEffect(() => {
        document.title = 'Find Providers | MedVoice'
        navigator.geolocation?.getCurrentPosition((pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
            setUserLocation(loc)
            setMapCenter(loc)
        })
    }, [])

    // Resizable panel drag logic
    const handleMouseDown = () => {
        isDragging.current = true
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
    }

    const handleMouseMove = useCallback((e) => {
        if (!isDragging.current || !containerRef.current) return
        const containerLeft = containerRef.current.getBoundingClientRect().left
        const newWidth = e.clientX - containerLeft
        if (newWidth >= 280 && newWidth <= 700) {
            setPanelWidth(newWidth)
        }
    }, [])

    const handleMouseUp = useCallback(() => {
        isDragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
    }, [])

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [handleMouseMove, handleMouseUp])

    const searchProviders = async () => {
        if (!query.trim()) return
        setLoading(true)
        setPlaces([])
        setSelected(null)

        try {
            const { Place } = await google.maps.importLibrary('places')
            const request = {
                textQuery: query + ' medical center hospital clinic',
                fields: [
                    'displayName', 'formattedAddress', 'rating',
                    'userRatingCount', 'location', 'photos',
                    'nationalPhoneNumber', 'regularOpeningHours', 'websiteURI'
                ],
                locationBias: userLocation,
                maxResultCount: 10,
            }

            const { places: results } = await Place.searchByText(request)

            const formatted = results.map(p => ({
                id: p.id,
                name: p.displayName,
                address: p.formattedAddress,
                rating: p.rating,
                reviewCount: p.userRatingCount,
                phone: p.nationalPhoneNumber,
                website: p.websiteURI,
                isOpen: p.regularOpeningHours?.isOpen?.(),
                location: { lat: p.location.lat(), lng: p.location.lng() },
                photo: p.photos?.[0]?.getURI({ maxWidth: 400 }) || null,
            }))

            setPlaces(formatted)
            if (formatted.length > 0) {
                setMapCenter(formatted[0].location)
            }
        } catch (err) {
            console.error('Search failed:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') searchProviders()
    }

    const handleSelectPlace = (place) => {
        setSelected(place)
        setMapCenter(place.location)
    }

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <main className={styles.main}>

                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.push('/')} className={styles.backBtn}>
                        ← Back to home
                    </button>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>＋</span>
                        <span className={styles.logoText}>MedVoice</span>
                    </div>
                </div>

                <div className={styles.content} ref={containerRef}>

                    {/* Left panel */}
                    <div
                        className={styles.leftPanel}
                        style={{ width: panelWidth }}
                    >
                        <h1 className={styles.title}>Find Medical Providers</h1>
                        <p className={styles.subtitle}>
                            Search for hospitals, clinics, and urgent care centers near you
                        </p>

                        {/* Search bar */}
                        <div className={styles.searchRow}>
                            <input
                                className={styles.searchInput}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search hospitals, clinics, urgent care..."
                            />
                            <button
                                onClick={searchProviders}
                                disabled={loading}
                                className={styles.searchBtn}
                            >
                                {loading ? '...' : '🔍'}
                            </button>
                        </div>

                        {/* Results */}
                        <div className={styles.results}>
                            {loading && (
                                <p className={styles.loadingText}>Searching nearby providers...</p>
                            )}

                            {!loading && places.length === 0 && query && (
                                <p className={styles.emptyText}>No results found. Try a different search.</p>
                            )}

                            {places.map((place) => (
                                <div
                                    key={place.id}
                                    className={`${styles.placeCard} ${selected?.id === place.id ? styles.placeCardSelected : ''}`}
                                    onClick={() => handleSelectPlace(place)}
                                >
                                    {place.photo && (
                                        <img
                                            src={place.photo}
                                            alt={place.name}
                                            className={styles.placePhoto}
                                        />
                                    )}
                                    <div className={styles.placeInfo}>
                                        <p className={styles.placeName}>{place.name}</p>
                                        <p className={styles.placeAddress}>{place.address}</p>

                                        <div className={styles.placeMeta}>
                                            {place.rating && (
                                                <span className={styles.rating}>
                                                    ⭐ {place.rating.toFixed(1)}
                                                    <span className={styles.reviewCount}>
                                                        ({place.reviewCount?.toLocaleString()})
                                                    </span>
                                                </span>
                                            )}
                                            {place.isOpen !== undefined && (
                                                <span className={place.isOpen ? styles.open : styles.closed}>
                                                    {place.isOpen ? 'Open now' : 'Closed'}
                                                </span>
                                            )}
                                        </div>

                                        {place.phone && (
                                            <p className={styles.placePhone}>📞 {place.phone}</p>
                                        )}

                                        <div className={styles.placeActions}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`, '_blank')
                                                }}
                                                className={styles.mapsBtn}
                                            >
                                                View on Google Maps
                                            </button>
                                            {place.phone && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        window.location.href = `tel:${place.phone}`
                                                    }}
                                                    className={styles.callBtn}
                                                >
                                                    📞 Call
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Drag handle */}
                    <div
                        className={styles.dragHandle}
                        onMouseDown={handleMouseDown}
                    >
                        <div className={styles.dragBar} />
                    </div>

                    {/* Map */}
                    <div className={styles.mapWrapper}>
                        <Map
                            mapId="medvoice-map"
                            defaultCenter={mapCenter}
                            defaultZoom={13}
                            style={{ width: '100%', height: '100%' }}
                            gestureHandling="auto"
                            disableDefaultUI={false}
                        >
                            <MapController center={mapCenter} />
                            <AdvancedMarker position={userLocation}>
                                <div className={styles.userMarker}>📍</div>
                            </AdvancedMarker>
                            {places.map((place) => (
                                <AdvancedMarker
                                    key={place.id}
                                    position={place.location}
                                    onClick={() => handleSelectPlace(place)}
                                >
                                    <Pin
                                        background={selected?.id === place.id ? '#02C39A' : '#0a2342'}
                                        borderColor={selected?.id === place.id ? '#028090' : '#0a2342'}
                                        glyphColor="#ffffff"
                                    />
                                </AdvancedMarker>
                            ))}
                        </Map>
                    </div>

                </div>
            </main>
        </APIProvider>
    )
}