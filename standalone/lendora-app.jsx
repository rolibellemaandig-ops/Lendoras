const { useState, useEffect, useRef } = React;
    const motionFallback = new Proxy({}, { get: (_, tag) => tag });
    const motionLibrary = window.Motion || {};
    const motion = motionLibrary.motion || motionFallback;
    const AnimatePresence = motionLibrary.AnimatePresence || React.Fragment;
    const markLendoraBooted = () => {
        if (typeof window !== 'undefined') {
            window.__lendoraBooted = true;
        }
    };
    const PHOSPHOR_WEIGHT_CLASSES = new Set(['ph', 'ph-fill', 'ph-bold']);
    const originalCreateElement = React.createElement.bind(React);

    const getPhosphorIconMeta = (className = '') => {
        const tokens = className.split(/\s+/).filter(Boolean);
        const icon = tokens.find((token) => token.startsWith('ph-') && token !== 'ph-fill' && token !== 'ph-bold') || 'ph-circle';
        const weight = tokens.includes('ph-fill') ? 'fill' : tokens.includes('ph-bold') ? 'bold' : 'regular';
        const cleanClassName = tokens.filter((token) => !PHOSPHOR_WEIGHT_CLASSES.has(token) && token !== icon).join(' ');

        return { cleanClassName, icon, weight };
    };

    const PhosphorIcon = React.forwardRef(({ className = '', ...rest }, ref) => {
        const { cleanClassName, icon, weight } = getPhosphorIconMeta(className);
        const markup = PHOSPHOR_ICON_MARKUP?.[icon]?.[weight]
            || PHOSPHOR_ICON_MARKUP?.[icon]?.regular
            || PHOSPHOR_ICON_MARKUP?.['ph-circle']?.regular
            || '';
        const accessibilityProps = rest['aria-label'] || rest.role
            ? {}
            : { 'aria-hidden': rest['aria-hidden'] ?? true };

        return originalCreateElement(
            'i',
            {
                ...rest,
                ...accessibilityProps,
                ref,
                className: ['ph-icon', cleanClassName].filter(Boolean).join(' '),
                'data-ph-icon': icon,
                'data-ph-weight': weight
            },
            originalCreateElement('svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                viewBox: '0 0 256 256',
                fill: 'currentColor',
                className: 'ph-icon-svg',
                focusable: 'false',
                dangerouslySetInnerHTML: { __html: markup }
            })
        );
    });

    PhosphorIcon.displayName = 'PhosphorIcon';

    const lendoraRuntime = typeof window !== 'undefined' ? window : globalThis;

    if (!lendoraRuntime.__lendoraPhosphorIconsPatched) {
        lendoraRuntime.__lendoraPhosphorIconsPatched = true;
        React.createElement = (type, props, ...children) => {
            if (type === 'i' && typeof props?.className === 'string') {
                const tokens = props.className.split(/\s+/).filter(Boolean);
                if (tokens.some((token) => PHOSPHOR_WEIGHT_CLASSES.has(token))) {
                    return originalCreateElement(PhosphorIcon, props);
                }
            }

            return originalCreateElement(type, props, ...children);
        };
    }

    class LendoraErrorBoundary extends React.Component {
        constructor(props) {
            super(props);
            this.state = { error: null };
        }

        static getDerivedStateFromError(error) {
            return { error };
        }

        componentDidCatch(error) {
            if (typeof window !== 'undefined' && typeof window.renderLendoraStartupError === 'function') {
                window.renderLendoraStartupError(`Runtime error: ${error?.message || 'Unknown render error'}`);
            }
        }

        render() {
            if (this.state.error) {
                return (
                    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-brand-50 to-white">
                        <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white/95 p-7 shadow-soft">
                            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 text-brand-900 flex items-center justify-center text-2xl font-black">!</div>
                            <h1 className="mt-5 text-2xl font-black text-slate-900">Lendora hit a startup error</h1>
                            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{this.state.error.message || 'Unknown render error'}</p>
                            <p className="mt-4 text-xs font-medium leading-relaxed text-slate-500">Keep the HTML beside the <strong>vendor</strong>, <strong>styles</strong>, and <strong>standalone</strong> folders, or use <code>npm run dev</code>.</p>
                        </div>
                    </div>
                );
            }

            return this.props.children;
        }
    }

    // --- GLOBAL STATE & MOCK DATA ---
    const CURRENT_USER = {
        id: 'u_me',
        name: "Luther N.",
        avatar: "https://i.pravatar.cc/150?img=11",
        title: "Freelance Multimedia Artist",
        rating: 5.0,
        joined: '2026',
        verified: false,
        lends: 12,
        email: '',
        campusEmail: '',
        emailVerified: false,
        phone: '',
        phoneVerified: false,
        studentNumber: '',
        studentVerified: false,
        idUploaded: false,
        idFileName: '',
        verificationStatus: 'Verification Required'
    };

    const USERS = {
        'dave': { id: 'u1', name: "Dave C.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&h=150", rating: 4.9, joined: '2024', verified: true, phone: '09171234567' },
        'elena': { id: 'u2', name: "Elena R.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=150&h=150", rating: 5.0, joined: '2025', verified: true, phone: '09172223344' },
        'mark': { id: 'u3', name: "Mark T.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=150&h=150", rating: 4.7, joined: '2025', verified: true, phone: '09173334455' },
        'sarah': { id: 'u4', name: "Sarah L.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?fit=crop&w=150&h=150", rating: 4.8, joined: '2024', verified: true, phone: '09174445566' }
    };

    const USTP_CDO_CENTER = [8.48574, 124.65618];
    const USTP_CDO_BOUNDS = { minLat: 8.48435, maxLat: 8.48708, minLng: 124.65474, maxLng: 124.65758 };

    const CAMPUS_LOCATION_POINTS = {
        'ICT Building': [8.48668, 124.65712],
        'Student Center': [8.48584, 124.65628],
        'Architecture Hub': [8.48484, 124.65496],
        'Science Center': [8.48592, 124.65558],
        'Engineering Lobby': [8.48528, 124.65526],
        'COT Building': [8.48458, 124.65512],
        'Library Steps': [8.48622, 124.65618],
        'Library Annex': [8.48600, 124.65642],
        'Student Innovation Lab': [8.48634, 124.65694],
        'Maker Space': [8.48518, 124.65672],
        'Engineering Workshop': [8.48482, 124.65560],
        'Nursing Skills Lab': [8.48556, 124.65686],
        'Media Lab': [8.48596, 124.65734],
        'Conference Hall Lobby': [8.48668, 124.65656],
        'Library Reading Area': [8.48616, 124.65632],
        'Engineering Bldg': [8.48506, 124.65538]
    };

    const USTP_CDO_POINTS = Object.values(CAMPUS_LOCATION_POINTS);
    const STORAGE_PREFIX = 'lendora.v3';
    const WALKING_SPEED_MPS = 1.28;
    const CAMPUS_WALKWAY_SPINE = [
        { label: 'Architecture Gate', coords: [8.48448, 124.65486] },
        { label: 'Workshop Lane', coords: [8.48482, 124.65516] },
        { label: 'Engineering Walk', coords: [8.48514, 124.65542] },
        { label: 'Science Court', coords: [8.48546, 124.65576] },
        { label: 'Student Center Path', coords: [8.48580, 124.65612] },
        { label: 'Library Walk', coords: [8.48612, 124.65644] },
        { label: 'ICT Promenade', coords: [8.48644, 124.65684] },
        { label: 'North Loop', coords: [8.48674, 124.65718] }
    ];

    const resolveInitialValue = (value) => typeof value === 'function' ? value() : value;

    const canUseLocalStorage = () => {
        try {
            return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
        } catch (error) {
            return false;
        }
    };

    const getStorageKey = (key) => `${STORAGE_PREFIX}:${key}`;

    const readStoredValue = (key, fallback) => {
        const fallbackValue = resolveInitialValue(fallback);
        if (!canUseLocalStorage()) return fallbackValue;

        try {
            const raw = window.localStorage.getItem(getStorageKey(key));
            return raw ? JSON.parse(raw) : fallbackValue;
        } catch (error) {
            return fallbackValue;
        }
    };

    const writeStoredValue = (key, value) => {
        if (!canUseLocalStorage()) return;

        try {
            window.localStorage.setItem(getStorageKey(key), JSON.stringify(value));
        } catch (error) {}
    };

    const clearStoredNamespace = () => {
        if (!canUseLocalStorage()) return;

        try {
            Object.keys(window.localStorage)
                .filter((key) => key.startsWith(`${STORAGE_PREFIX}:`))
                .forEach((key) => window.localStorage.removeItem(key));
        } catch (error) {}
    };

    const usePersistentState = (key, fallback) => {
        const [value, setValue] = useState(() => readStoredValue(key, fallback));

        useEffect(() => {
            writeStoredValue(key, value);
        }, [key, value]);

        return [value, setValue];
    };

    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const getDistanceMeters = (from = USTP_CDO_CENTER, to = USTP_CDO_CENTER) => {
        const [fromLat, fromLng] = from;
        const [toLat, toLng] = to;
        const earthRadius = 6371000;
        const latDelta = toRadians(toLat - fromLat);
        const lngDelta = toRadians(toLng - fromLng);
        const a =
            Math.sin(latDelta / 2) ** 2 +
            Math.cos(toRadians(fromLat)) *
                Math.cos(toRadians(toLat)) *
                Math.sin(lngDelta / 2) ** 2;

        return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const formatDistanceLabel = (meters = 0) => {
        if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
        const rounded = Math.max(10, Math.round(meters / 5) * 5);
        return `${rounded}m`;
    };

    const getEtaMinutes = (distanceMeters = 0) => Math.max(1, Math.round(distanceMeters / WALKING_SPEED_MPS / 60));

    const dedupeRoutePoints = (points) =>
        points.filter((point, index) => index === 0 || getDistanceMeters(points[index - 1], point) > 4);

    const getNearestWalkwayIndex = (coords) =>
        CAMPUS_WALKWAY_SPINE.reduce((bestIndex, node, index, nodes) => {
            const bestDistance = getDistanceMeters(coords, nodes[bestIndex].coords);
            const nextDistance = getDistanceMeters(coords, node.coords);
            return nextDistance < bestDistance ? index : bestIndex;
        }, 0);

    const buildCampusRoute = (origin = USTP_CDO_CENTER, destination = USTP_CDO_CENTER) => {
        const safeOrigin = clampToCampus(origin);
        const safeDestination = clampToCampus(destination);
        const startIndex = getNearestWalkwayIndex(safeOrigin);
        const endIndex = getNearestWalkwayIndex(safeDestination);
        const walkwaySegment =
            startIndex <= endIndex
                ? CAMPUS_WALKWAY_SPINE.slice(startIndex, endIndex + 1)
                : CAMPUS_WALKWAY_SPINE.slice(endIndex, startIndex + 1).reverse();

        const routePoints = dedupeRoutePoints([
            safeOrigin,
            CAMPUS_WALKWAY_SPINE[startIndex].coords,
            ...walkwaySegment.map((node) => node.coords),
            CAMPUS_WALKWAY_SPINE[endIndex].coords,
            safeDestination
        ]);

        const distanceMeters = routePoints.reduce((sum, point, index) => {
            if (index === 0) return sum;
            return sum + getDistanceMeters(routePoints[index - 1], point);
        }, 0);

        return {
            points: routePoints,
            coordinates: routePoints.map(([lat, lng]) => [lng, lat]),
            distanceMeters,
            etaMinutes: getEtaMinutes(distanceMeters),
            waypoints: walkwaySegment.map((node) => node.label)
        };
    };

    const getRouteSummary = (origin, destination) => {
        const route = buildCampusRoute(origin, destination);
        return {
            ...route,
            distanceLabel: formatDistanceLabel(route.distanceMeters),
            etaLabel: `${route.etaMinutes} min${route.etaMinutes === 1 ? '' : 's'}`,
            geojson: {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: route.coordinates
                }
            }
        };
    };

    const getCampusPoint = (seed = 0) => {
        const safeSeed = Number.isFinite(Number(seed)) ? Math.abs(Number(seed)) : 0;
        const point = USTP_CDO_POINTS[safeSeed % USTP_CDO_POINTS.length] || USTP_CDO_CENTER;
        return [...point];
    };

    const clampToCampus = (coords = USTP_CDO_CENTER) => {
        const [lat = USTP_CDO_CENTER[0], lng = USTP_CDO_CENTER[1]] = coords;
        return [
            Math.min(USTP_CDO_BOUNDS.maxLat, Math.max(USTP_CDO_BOUNDS.minLat, lat)),
            Math.min(USTP_CDO_BOUNDS.maxLng, Math.max(USTP_CDO_BOUNDS.minLng, lng))
        ];
    };

    const getCampusCoordsForLocation = (location, seed = 0) => {
        const campusCoords = CAMPUS_LOCATION_POINTS[location];
        return clampToCampus(campusCoords || getCampusPoint(seed));
    };

    const DEFAULT_USER_LOCATION = {
        coords: getCampusCoordsForLocation('Student Center'),
        source: 'campus-default',
        accuracy: null,
        error: '',
        loading: true,
        updatedAt: null
    };

    const formatCoordinatePair = (coords = USTP_CDO_CENTER) => {
        const [lat, lng] = clampToCampus(coords);
        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    };

    const createRectPolygon = (center, latOffset, lngOffset) => {
        const [lat, lng] = center;
        return [[
            [lng - lngOffset, lat - latOffset],
            [lng + lngOffset, lat - latOffset],
            [lng + lngOffset, lat + latOffset],
            [lng - lngOffset, lat + latOffset],
            [lng - lngOffset, lat - latOffset]
        ]];
    };

    const CAMPUS_BUILDING_SPECS = [
        { id: 'ict-building', label: 'ICT Building', center: getCampusCoordsForLocation('ICT Building'), latOffset: 0.00010, lngOffset: 0.00009, height: 28, tint: 'tech' },
        { id: 'student-center', label: 'Student Center', center: getCampusCoordsForLocation('Student Center'), latOffset: 0.00011, lngOffset: 0.00010, height: 18, tint: 'hub' },
        { id: 'architecture-hub', label: 'Architecture Hub', center: getCampusCoordsForLocation('Architecture Hub'), latOffset: 0.00009, lngOffset: 0.00008, height: 14, tint: 'studio' },
        { id: 'science-center', label: 'Science Center', center: getCampusCoordsForLocation('Science Center'), latOffset: 0.00010, lngOffset: 0.00009, height: 22, tint: 'lab' },
        { id: 'engineering-lobby', label: 'Engineering Lobby', center: getCampusCoordsForLocation('Engineering Lobby'), latOffset: 0.00009, lngOffset: 0.00008, height: 17, tint: 'hall' },
        { id: 'cot-building', label: 'COT Building', center: getCampusCoordsForLocation('COT Building'), latOffset: 0.00008, lngOffset: 0.00008, height: 16, tint: 'hall' },
        { id: 'library', label: 'Library', center: getCampusCoordsForLocation('Library Steps'), latOffset: 0.00012, lngOffset: 0.00010, height: 26, tint: 'library' },
        { id: 'innovation-lab', label: 'Innovation Lab', center: getCampusCoordsForLocation('Student Innovation Lab'), latOffset: 0.00008, lngOffset: 0.00008, height: 15, tint: 'tech' },
        { id: 'maker-space', label: 'Maker Space', center: getCampusCoordsForLocation('Maker Space'), latOffset: 0.00008, lngOffset: 0.00007, height: 13, tint: 'studio' },
        { id: 'nursing-lab', label: 'Nursing Lab', center: getCampusCoordsForLocation('Nursing Skills Lab'), latOffset: 0.00008, lngOffset: 0.00007, height: 15, tint: 'lab' },
        { id: 'media-lab', label: 'Media Lab', center: getCampusCoordsForLocation('Media Lab'), latOffset: 0.00008, lngOffset: 0.00007, height: 14, tint: 'studio' },
        { id: 'conference-hall', label: 'Conference Hall', center: getCampusCoordsForLocation('Conference Hall Lobby'), latOffset: 0.00009, lngOffset: 0.00009, height: 20, tint: 'hub' }
    ];

    const CAMPUS_OUTLINE_GEOJSON = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: { name: 'USTP CDO' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        [124.65474, 8.48434],
                        [124.65552, 8.48430],
                        [124.65638, 8.48436],
                        [124.65710, 8.48450],
                        [124.65750, 8.48496],
                        [124.65755, 8.48586],
                        [124.65740, 8.48672],
                        [124.65688, 8.48702],
                        [124.65596, 8.48708],
                        [124.65512, 8.48696],
                        [124.65478, 8.48640],
                        [124.65474, 8.48434]
                    ]]
                }
            }
        ]
    };

    const CAMPUS_BUILDINGS_GEOJSON = {
        type: 'FeatureCollection',
        features: CAMPUS_BUILDING_SPECS.map((building) => ({
            type: 'Feature',
            properties: {
                id: building.id,
                name: building.label,
                height: building.height,
                tint: building.tint
            },
            geometry: {
                type: 'Polygon',
                coordinates: createRectPolygon(building.center, building.latOffset, building.lngOffset)
            }
        }))
    };

    const CAMPUS_PATHS_GEOJSON = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: { name: 'Main Spine', kind: 'spine' },
                geometry: {
                    type: 'LineString',
                    coordinates: CAMPUS_WALKWAY_SPINE.map(({ coords: [lat, lng] }) => [lng, lat])
                }
            },
            ...CAMPUS_BUILDING_SPECS.map((building) => {
                const nearestNode = CAMPUS_WALKWAY_SPINE[getNearestWalkwayIndex(building.center)];
                return {
                    type: 'Feature',
                    properties: { name: `${building.label} Access`, kind: 'connector' },
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [nearestNode.coords[1], nearestNode.coords[0]],
                            [building.center[1], building.center[0]]
                        ]
                    }
                };
            })
        ]
    };

    const CAMPUS_POINTS_GEOJSON = {
        type: 'FeatureCollection',
        features: Object.entries(CAMPUS_LOCATION_POINTS).map(([name, coords]) => ({
            type: 'Feature',
            properties: { name, coordsLabel: formatCoordinatePair(coords) },
            geometry: {
                type: 'Point',
                coordinates: [coords[1], coords[0]]
            }
        }))
    };

    const GOOGLE_MAPS_STORAGE_KEY = 'google-maps-api-key';
    const GOOGLE_MAPS_SCRIPT_ID = 'lendora-google-maps-script';
    const GOOGLE_MAPS_QUERY_PARAM = 'gmaps_key';
    const GOOGLE_MAPS_ROADMAP_STYLES = [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
        { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] }
    ];
    const CAMPUS_GOOGLE_BOUNDS = {
        north: USTP_CDO_BOUNDS.maxLat,
        south: USTP_CDO_BOUNDS.minLat,
        east: USTP_CDO_BOUNDS.maxLng,
        west: USTP_CDO_BOUNDS.minLng
    };
    const CAMPUS_OUTLINE_PATH = (CAMPUS_OUTLINE_GEOJSON.features?.[0]?.geometry?.coordinates?.[0] || []).map(([lng, lat]) => ({ lat, lng }));
    const CAMPUS_MAP_MIN_ZOOM = 16;
    const CAMPUS_MAP_MAX_ZOOM = 24;
    const CAMPUS_MAP_DEFAULT_ZOOM = 16.8;
    const CAMPUS_MAP_FOCUS_ZOOM = 20.8;
    const CAMPUS_MAP_FIT_MAX_ZOOM = 20.5;
    const CAMPUS_MAP_ZOOM_STEP = 1;

    const getLatLngLiteral = (coords = USTP_CDO_CENTER) => {
        const [lat, lng] = clampToCampus(coords);
        return { lat, lng };
    };

    const toLatLngPath = (points = []) => points.map((coords) => getLatLngLiteral(coords));

    const getGoogleMapTypeId = (mapStyleKey = 'default') => {
        if (mapStyleKey === 'satellite') return 'satellite';
        if (mapStyleKey === 'terrain') return 'terrain';
        return 'roadmap';
    };

    const getGoogleMapStyles = (mapStyleKey = 'default') => (
        mapStyleKey === 'default' || mapStyleKey === 'terrain' ? GOOGLE_MAPS_ROADMAP_STYLES : null
    );

    const getGoogleMapsApiKey = () => {
        if (typeof window === 'undefined') return '';

        const globalKey = typeof window.LENDORA_GOOGLE_MAPS_API_KEY === 'string'
            ? window.LENDORA_GOOGLE_MAPS_API_KEY.trim()
            : '';

        let queryKey = '';
        try {
            queryKey = (new URLSearchParams(window.location.search || '').get(GOOGLE_MAPS_QUERY_PARAM) || '').trim();
        } catch (error) {}

        if (queryKey) {
            writeStoredValue(GOOGLE_MAPS_STORAGE_KEY, queryKey);
        }

        const storedKey = readStoredValue(GOOGLE_MAPS_STORAGE_KEY, '');
        return globalKey || queryKey || storedKey || '';
    };

    const loadGoogleMapsApi = () => {
        if (typeof window === 'undefined') {
            return Promise.reject(new Error('Google Maps is only available in a browser.'));
        }

        if (window.google?.maps) {
            return Promise.resolve(window.google.maps);
        }

        if (window.__lendoraGoogleMapsLoader) {
            return window.__lendoraGoogleMapsLoader;
        }

        const apiKey = getGoogleMapsApiKey();
        if (!apiKey) {
            return Promise.reject(new Error('Google Maps API key missing. Set window.LENDORA_GOOGLE_MAPS_API_KEY or open this page with ?gmaps_key=YOUR_KEY.'));
        }

        window.__lendoraGoogleMapsLoader = new Promise((resolve, reject) => {
            const staleScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
            if (staleScript && !window.google?.maps) {
                staleScript.remove();
            }

            const cleanup = () => {
                delete window.__lendoraGoogleMapsInit;
            };

            const handleError = () => {
                cleanup();
                window.__lendoraGoogleMapsLoader = null;
                reject(new Error('Google Maps failed to load. Check the API key, billing, referrer settings, and network access.'));
            };

            window.__lendoraGoogleMapsInit = () => {
                cleanup();
                resolve(window.google.maps);
            };

            const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
            if (existingScript) {
                existingScript.addEventListener('error', handleError, { once: true });
                return;
            }

            const script = document.createElement('script');
            script.id = GOOGLE_MAPS_SCRIPT_ID;
            script.async = true;
            script.defer = true;
            script.onerror = handleError;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=__lendoraGoogleMapsInit&v=weekly`;
            document.head.appendChild(script);
        });

        return window.__lendoraGoogleMapsLoader;
    };

    const resetGoogleMapsLoader = () => {
        if (typeof window === 'undefined') return;

        const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
        if (existingScript) {
            existingScript.remove();
        }

        delete window.__lendoraGoogleMapsInit;
        window.__lendoraGoogleMapsLoader = null;
    };

    const clearGoogleOverlay = (overlay) => {
        if (!overlay) return;
        if (typeof overlay.setMap === 'function') {
            overlay.setMap(null);
            return;
        }
        if (typeof overlay.remove === 'function') {
            overlay.remove();
        }
    };

    const clearGoogleOverlayList = (overlays = []) => overlays.forEach((overlay) => clearGoogleOverlay(overlay));

    const createGoogleCampusMap = (googleMaps, container, centerCoords, mapStyleKey = 'default', extraOptions = {}) => (
        new googleMaps.Map(container, {
            center: getLatLngLiteral(centerCoords),
            zoom: CAMPUS_MAP_DEFAULT_ZOOM,
            minZoom: CAMPUS_MAP_MIN_ZOOM,
            maxZoom: CAMPUS_MAP_MAX_ZOOM,
            mapTypeId: getGoogleMapTypeId(mapStyleKey),
            restriction: {
                latLngBounds: CAMPUS_GOOGLE_BOUNDS,
                strictBounds: false
            },
            disableDefaultUI: false,
            clickableIcons: false,
            zoomControl: true,
            streetViewControl: false,
            fullscreenControl: false,
            mapTypeControl: false,
            keyboardShortcuts: true,
            gestureHandling: 'greedy',
            styles: getGoogleMapStyles(mapStyleKey),
            backgroundColor: '#f0f5fb',
            ...extraOptions
        })
    );

    const createGoogleRouteOverlays = (googleMaps, map, routePoints = []) => {
        const path = toLatLngPath(routePoints);
        const casing = new googleMaps.Polyline({
            map,
            path,
            strokeColor: '#ffffff',
            strokeOpacity: 0.96,
            strokeWeight: 8,
            clickable: false,
            zIndex: 2
        });

        const line = new googleMaps.Polyline({
            map,
            path,
            strokeColor: '#4285f4',
            strokeOpacity: 1,
            strokeWeight: 5,
            clickable: false,
            zIndex: 3
        });

        return [casing, line];
    };

    const createCampusBoundaryOverlay = (googleMaps, map, mapStyleKey = 'default') => (
        new googleMaps.Polygon({
            map,
            paths: CAMPUS_OUTLINE_PATH,
            strokeColor: '#36527d',
            strokeOpacity: mapStyleKey === 'satellite' ? 0.55 : 0.72,
            strokeWeight: 2,
            fillColor: mapStyleKey === 'satellite' ? '#4d6b5f' : '#d8e8d6',
            fillOpacity: mapStyleKey === 'satellite' ? 0.08 : 0.14,
            clickable: false,
            zIndex: 1
        })
    );

    const createCircleMarker = (googleMaps, map, coords, fillColor = '#2563eb', scale = 8) => (
        new googleMaps.Marker({
            map,
            position: getLatLngLiteral(coords),
            clickable: false,
            zIndex: 4,
            icon: {
                path: googleMaps.SymbolPath.CIRCLE,
                scale,
                fillColor,
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 4
            }
        })
    );

    const createHtmlMapMarker = (googleMaps, { map, coords, content, anchor = 'bottom' }) => {
        class HtmlMapMarker extends googleMaps.OverlayView {
            constructor(position, node, markerAnchor) {
                super();
                this.position = new googleMaps.LatLng(position.lat, position.lng);
                this.node = node;
                this.markerAnchor = markerAnchor;
                this.container = null;
            }

            onAdd() {
                if (this.container) return;

                const container = document.createElement('div');
                container.style.position = 'absolute';
                container.style.transform = this.markerAnchor === 'center'
                    ? 'translate(-50%, -50%)'
                    : 'translate(-50%, -100%)';
                container.style.pointerEvents = 'auto';
                container.appendChild(this.node);
                this.container = container;
                this.getPanes().overlayMouseTarget.appendChild(container);
            }

            draw() {
                if (!this.container) return;
                const projection = this.getProjection();
                if (!projection) return;
                const point = projection.fromLatLngToDivPixel(this.position);
                if (!point) return;
                this.container.style.left = `${point.x}px`;
                this.container.style.top = `${point.y}px`;
            }

            onRemove() {
                if (this.container?.parentNode) {
                    this.container.parentNode.removeChild(this.container);
                }
                this.container = null;
            }
        }

        const overlay = new HtmlMapMarker(getLatLngLiteral(coords), content, anchor);
        overlay.setMap(map);
        return overlay;
    };

    const LEAFLET_CAMPUS_BOUNDS = [
        [USTP_CDO_BOUNDS.minLat, USTP_CDO_BOUNDS.minLng],
        [USTP_CDO_BOUNDS.maxLat, USTP_CDO_BOUNDS.maxLng]
    ];

    const LEAFLET_TILE_THEMES = {
        default: {
            url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
            options: {
                subdomains: 'abcd',
                maxNativeZoom: 20,
                maxZoom: CAMPUS_MAP_MAX_ZOOM,
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
            }
        },
        satellite: {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            options: {
                maxNativeZoom: 20,
                maxZoom: CAMPUS_MAP_MAX_ZOOM,
                attribution: 'Tiles &copy; Esri'
            }
        },
        terrain: {
            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            options: {
                subdomains: 'abc',
                maxNativeZoom: 19,
                maxZoom: CAMPUS_MAP_MAX_ZOOM,
                attribution: '&copy; OpenTopoMap contributors'
            }
        }
    };

    const getLeafletTheme = (mapStyleKey = 'default') => LEAFLET_TILE_THEMES[mapStyleKey] || LEAFLET_TILE_THEMES.default;
    const toLeafletLatLng = (coords = USTP_CDO_CENTER) => clampToCampus(coords);
    const toLeafletPath = (points = []) => points.map((coords) => toLeafletLatLng(coords));
    const toLeafletGeoPath = (coordinates = []) => coordinates.map(([lng, lat]) => [lat, lng]);
    const getCampusOutlineLatLngs = () => toLeafletGeoPath(CAMPUS_OUTLINE_GEOJSON.features?.[0]?.geometry?.coordinates?.[0] || []);
    const getRouteBearing = (from = USTP_CDO_CENTER, to = USTP_CDO_CENTER) => {
        const [fromLat, fromLng] = from;
        const [toLat, toLng] = to;
        const latDelta = toLat - fromLat;
        const lngDelta = toLng - fromLng;
        return (Math.atan2(lngDelta, latDelta) * 180) / Math.PI;
    };

    const createLeafletCampusOverlay = (Leaflet, mapStyleKey = 'default') => {
        const layer = Leaflet.layerGroup();
        const isSatellite = mapStyleKey === 'satellite';
        const isTerrain = mapStyleKey === 'terrain';
        const outlineLatLngs = getCampusOutlineLatLngs();

        Leaflet.polygon(outlineLatLngs, {
            color: isSatellite ? '#d5e3ff' : '#5f7f9a',
            weight: 2,
            opacity: isSatellite ? 0.72 : 0.88,
            fillColor: isSatellite ? '#dcefd9' : isTerrain ? '#d6ead1' : '#dfeee1',
            fillOpacity: isSatellite ? 0.08 : 0.18,
            interactive: false
        }).addTo(layer);

        CAMPUS_BUILDINGS_GEOJSON.features.forEach((feature) => {
            Leaflet.polygon(toLeafletGeoPath(feature.geometry?.coordinates?.[0] || []), {
                color: isSatellite ? '#f7fbff' : '#94a8bc',
                weight: 1,
                opacity: isSatellite ? 0.6 : 0.85,
                fillColor: isSatellite ? '#f8fbff' : '#ffffff',
                fillOpacity: isSatellite ? 0.2 : 0.68,
                interactive: false
            }).addTo(layer);
        });

        CAMPUS_PATHS_GEOJSON.features.forEach((feature) => {
            const kind = feature.properties?.kind;
            Leaflet.polyline(toLeafletGeoPath(feature.geometry?.coordinates || []), {
                color: kind === 'spine' ? '#45b97a' : '#8fb4d8',
                weight: kind === 'spine' ? 4 : 2,
                opacity: isSatellite ? 0.75 : 0.9,
                dashArray: kind === 'spine' ? null : '4 6',
                interactive: false
            }).addTo(layer);
        });

        CAMPUS_POINTS_GEOJSON.features.forEach((feature) => {
            Leaflet.circleMarker(toLeafletGeoPath([feature.geometry?.coordinates || []])[0], {
                radius: 3.8,
                color: '#ffffff',
                weight: 1.5,
                fillColor: isSatellite ? '#9ed0ff' : '#36b37e',
                fillOpacity: 0.95,
                interactive: false
            }).addTo(layer);
        });

        return layer;
    };

    const createLeafletItemIcon = (Leaflet, item, isActive) => {
        const imageUrl = String(item?.images?.[0] || item?.owner?.avatar || '').replace(/"/g, '&quot;');
        return Leaflet.divIcon({
            className: 'lendora-map-pin',
            iconSize: [46, 54],
            iconAnchor: [23, 54],
            html: `<div class="map-marker ${isActive ? 'active' : ''}" style="background-image:url(&quot;${imageUrl}&quot;);"></div>`
        });
    };

    const createLeafletPulseIcon = (Leaflet, kind = 'live') => Leaflet.divIcon({
        className: 'lendora-map-pin',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        html: `<div class="${kind === 'destination' ? 'map-destination-pin' : 'map-live-pin'}"></div>`
    });

    const createLeafletArrowIcon = (Leaflet, rotation = 0) => Leaflet.divIcon({
        className: 'lendora-map-pin',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        html: `<div class="map-route-arrow-icon" style="transform: rotate(${rotation}deg);"></div>`
    });

    const createLeafletChipIcon = (Leaflet, label, tone = 'blue') => Leaflet.divIcon({
        className: 'lendora-map-pin',
        iconSize: [90, 28],
        iconAnchor: [45, 34],
        html: `<div class="map-safe-zone-chip ${tone === 'red' ? 'red' : ''}">${label}</div>`
    });

    const addLeafletFocusZone = (Leaflet, layerGroup, coords, tone = 'blue', radius = 20) => {
        const palettes = {
            blue: { stroke: '#2563eb', fill: '#93c5fd' },
            red: { stroke: '#ef4444', fill: '#fca5a5' },
            green: { stroke: '#10b981', fill: '#86efac' }
        };
        const palette = palettes[tone] || palettes.blue;

        Leaflet.circle(toLeafletLatLng(coords), {
            radius,
            color: palette.stroke,
            weight: 2,
            opacity: 0.86,
            fillColor: palette.fill,
            fillOpacity: 0.12,
            interactive: false
        }).addTo(layerGroup);
    };

    const addLeafletRouteLayer = (Leaflet, layerGroup, routePoints = [], options = {}) => {
        const path = toLeafletPath(routePoints);
        const { showArrows = true } = options;

        Leaflet.polyline(path, {
            color: '#ffffff',
            weight: 10,
            opacity: 0.96,
            lineCap: 'round',
            lineJoin: 'round',
            interactive: false
        }).addTo(layerGroup);

        Leaflet.polyline(path, {
            color: '#3b82f6',
            weight: 6,
            opacity: 1,
            lineCap: 'round',
            lineJoin: 'round',
            interactive: false
        }).addTo(layerGroup);

        Leaflet.polyline(path, {
            color: '#8ec5ff',
            weight: 2,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round',
            dashArray: '10 12',
            interactive: false
        }).addTo(layerGroup);

        if (!showArrows) return;

        routePoints.slice(1).forEach((point, index) => {
            const previousPoint = routePoints[index];
            if (!previousPoint) return;
            const midpoint = [
                (previousPoint[0] + point[0]) / 2,
                (previousPoint[1] + point[1]) / 2
            ];
            const bearing = getRouteBearing(previousPoint, point);
            Leaflet.marker(toLeafletLatLng(midpoint), {
                icon: createLeafletArrowIcon(Leaflet, bearing),
                keyboard: false,
                interactive: false
            }).addTo(layerGroup);
        });
    };

    const MEETUP_TIME_SLOTS = [
        { id: '08:00', label: '8:00 AM' },
        { id: '10:30', label: '10:30 AM' },
        { id: '13:00', label: '1:00 PM' },
        { id: '15:30', label: '3:30 PM' },
        { id: '18:00', label: '6:00 PM' }
    ];

    const createDefaultAvailability = (location = 'ICT Building') => ({
        slots: MEETUP_TIME_SLOTS.map((slot) => slot.id),
        activeDays: [1, 2, 3, 4, 5, 6],
        leadHours: 2,
        maxAdvanceDays: 14,
        bufferMinutes: 45,
        preferredMeetup: location
    });

    const ensureItemAvailability = (item = {}) => ({
        ...item,
        availability: item.availability || createDefaultAvailability(item.location)
    });

    const INITIAL_ITEMS = [
        { id: 1, name: "Sony A7 IV Mirrorless", priceDaily: 850, priceHourly: 140, category: "CITC", condition: "Pristine", location: "ICT Building", value: 135000, images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800"], owner: USERS['dave'], rating: 4.9, coords: [8.4862, 124.6575], description: "Perfect for high-res photo shoots and 4K videography. Includes 2 batteries and a 128GB SD card.", insured: true, tags: ['camera', 'production', 'presentation'] },
        { id: 2, name: "DJI Ronin-SC Gimbal", priceDaily: 550, priceHourly: 95, category: "CEA", condition: "Good", location: "Student Center", value: 22000, images: ["https://images.unsplash.com/photo-1621618956973-2e3eb8c393bc?auto=format&fit=crop&q=80&w=800"], owner: USERS['elena'], rating: 4.7, coords: [8.4859, 124.6545], description: "Smooth footage for videography projects. Please make sure you know how to balance it before renting.", insured: true, tags: ['production', 'video', 'presentation'] },
        { id: 3, name: "Transit Totem (1:10 Prototype)", priceDaily: 220, priceHourly: 40, category: "CSM", condition: "Excellent", location: "Architecture Hub", value: 5000, images: ["https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&q=80&w=800"], owner: USERS['sarah'], rating: 5.0, coords: [8.4858, 124.6542], description: "Acrylic scale model designed to map jeepney routes in CDO. Great for presentation reference.", insured: false, tags: ['architecture', 'model', 'presentation'] },
        { id: 4, name: "Godox SL60W Video Light", priceDaily: 320, priceHourly: 55, category: "Production", condition: "Excellent", location: "Science Center", value: 7500, images: ["https://images.unsplash.com/photo-1520334363555-c1165a6b0cfa?auto=format&fit=crop&q=80&w=800"], owner: USERS['mark'], rating: 4.8, coords: [8.4855, 124.6560], description: "Comes with a softbox and heavy-duty stand. Essential for studio lighting setups.", insured: false, tags: ['lighting', 'production', 'presentation'] },
        { id: 5, name: "Zoom H4n Pro Recorder", priceDaily: 250, priceHourly: 40, category: "Production", condition: "Good", location: "ICT Building", value: 12000, images: ["https://images.unsplash.com/photo-1590845947376-2638caa89309?auto=format&fit=crop&q=80&w=800"], owner: USERS['dave'], rating: 4.9, coords: [8.4864, 124.6572], description: "Clean audio recording. Perfect for thesis interviews, documentaries, or short films.", insured: true, tags: ['audio', 'recording', 'production'] },
        { id: 6, name: "Casio fx-991EX ClassWiz", priceDaily: 120, priceHourly: 25, category: "CEA", condition: "Excellent", location: "Engineering Lobby", value: 1600, images: ["https://images.unsplash.com/photo-1635241161466-541f065683ba?auto=format&fit=crop&q=80&w=800"], owner: USERS['mark'], rating: 4.8, coords: [8.4852, 124.6558], description: "Scientific calculator ideal for engineering and calculus exams. Includes fresh AAA batteries.", insured: false, tags: ['calculator', 'math', 'exam'] },
        { id: 7, name: "Casio fx-570ES Plus", priceDaily: 90, priceHourly: 20, category: "CEA", condition: "Good", location: "COT Building", value: 1100, images: ["https://images.unsplash.com/photo-1581093806997-124204d9fa9d?auto=format&fit=crop&q=80&w=800"], owner: USERS['sarah'], rating: 4.7, coords: [8.4850, 124.6551], description: "Budget-friendly scientific calculator for physics, chemistry, and statics classes.", insured: false, tags: ['calculator', 'math', 'science'] },
        { id: 8, name: "TI-84 Plus Graphing Calculator", priceDaily: 180, priceHourly: 35, category: "CSTE", condition: "Excellent", location: "Library Steps", value: 6500, images: ["https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800"], owner: USERS['elena'], rating: 4.9, coords: [8.4860, 124.6568], description: "Great for advanced math, data plotting, and board exam review drills.", insured: true, tags: ['calculator', 'math', 'review'] },
        { id: 9, name: "Engineering Drawing Set", priceDaily: 80, priceHourly: 20, category: "CEA", condition: "Good", location: "Architecture Hub", value: 1800, images: ["https://images.unsplash.com/photo-1515876305429-17f9b2b9d0f8?auto=format&fit=crop&q=80&w=800"], owner: USERS['dave'], rating: 4.6, coords: [8.4857, 124.6549], description: "T-square, triangles, and technical pens for drafting activities and plate work.", insured: false, tags: ['drawing', 'architecture', 'academic'] },
        { id: 10, name: "Portable Thermal Printer", priceDaily: 300, priceHourly: 55, category: "CITC", condition: "Excellent", location: "Library Annex", value: 6000, images: ["https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800"], owner: USERS['mark'], rating: 4.8, coords: [8.4863, 124.6557], description: "Fast monochrome prints for handouts and reports. Includes one paper roll.", insured: true, tags: ['printing', 'paperwork', 'reports'] },
        { id: 11, name: "Laptop Cooling Pad + Stand", priceDaily: 70, priceHourly: 15, category: "CITC", condition: "Good", location: "ICT Building", value: 1800, images: ["https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&q=80&w=800"], owner: USERS['sarah'], rating: 4.7, coords: [8.4865, 124.6570], description: "Keeps laptops cool during coding marathons and online presentations.", insured: false, tags: ['laptop', 'coding', 'study'] },
        { id: 12, name: "15.6in Portable Monitor", priceDaily: 260, priceHourly: 45, category: "CITC", condition: "Excellent", location: "Student Innovation Lab", value: 9500, images: ["https://images.unsplash.com/photo-1593642532871-8b12e02d091c?auto=format&fit=crop&q=80&w=800"], owner: USERS['elena'], rating: 4.8, coords: [8.4854, 124.6564], description: "Useful for coding, editing, and dual-screen presentations for class demos.", insured: true, tags: ['laptop', 'coding', 'presentation'] },
        { id: 13, name: "Arduino Starter Kit", priceDaily: 240, priceHourly: 45, category: "COT", condition: "Excellent", location: "Maker Space", value: 5500, images: ["https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&q=80&w=800"], owner: USERS['dave'], rating: 4.9, coords: [8.4851, 124.6561], description: "Complete kit with sensors and jumpers for embedded systems and prototyping labs.", insured: true, tags: ['electronics', 'coding', 'project'] },
        { id: 14, name: "Digital Multimeter", priceDaily: 150, priceHourly: 30, category: "COT", condition: "Good", location: "Engineering Workshop", value: 2600, images: ["https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800"], owner: USERS['mark'], rating: 4.7, coords: [8.4849, 124.6556], description: "Reliable meter for electronics troubleshooting and lab measurements.", insured: false, tags: ['electronics', 'lab', 'science'] },
        { id: 15, name: "Lab Coat + Goggles Set", priceDaily: 95, priceHourly: 20, category: "CSTE", condition: "Excellent", location: "Science Center", value: 1700, images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800"], owner: USERS['sarah'], rating: 4.9, coords: [8.4856, 124.6563], description: "Clean set for chemistry and biology labs. Sizes M and L available.", insured: false, tags: ['lab', 'science', 'health'] },
        { id: 16, name: "Littmann Classic Stethoscope", priceDaily: 240, priceHourly: 45, category: "CON", condition: "Excellent", location: "Nursing Skills Lab", value: 7200, images: ["https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800"], owner: USERS['elena'], rating: 4.9, coords: [8.4848, 124.6569], description: "For return demonstrations and clinical practice with clear acoustics.", insured: true, tags: ['health', 'lab', 'clinical'] },
        { id: 17, name: "Ring Light + Phone Tripod", priceDaily: 180, priceHourly: 35, category: "CSM", condition: "Good", location: "Media Lab", value: 3500, images: ["https://images.unsplash.com/photo-1521579971123-1192931a1452?auto=format&fit=crop&q=80&w=800"], owner: USERS['mark'], rating: 4.8, coords: [8.4861, 124.6553], description: "Ideal for online reporting, vlogs, and product shoot assignments.", insured: false, tags: ['presentation', 'production', 'content'] },
        { id: 18, name: "Mini Projector 720p", priceDaily: 420, priceHourly: 70, category: "COM", condition: "Excellent", location: "Conference Hall Lobby", value: 13000, images: ["https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?auto=format&fit=crop&q=80&w=800"], owner: USERS['dave'], rating: 4.8, coords: [8.4866, 124.6562], description: "Portable projector for defense slides, org film showing, or classroom demos.", insured: true, tags: ['presentation', 'projector', 'class'] },
        { id: 19, name: "Power Bank 20,000mAh", priceDaily: 110, priceHourly: 20, category: "General", condition: "Good", location: "Student Center", value: 2200, images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800"], owner: USERS['sarah'], rating: 4.6, coords: [8.4853, 124.6547], description: "Fast charging support for all-day classes and fieldwork.", insured: false, tags: ['essentials', 'study', 'device'] },
        { id: 20, name: "Board Exam Review Books Bundle", priceDaily: 60, priceHourly: 15, category: "Academic", condition: "Good", location: "Library Reading Area", value: 2800, images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800"], owner: USERS['elena'], rating: 4.9, coords: [8.4867, 124.6559], description: "Reference books and solved problems for engineering and science review.", insured: false, tags: ['books', 'review', 'academic'] }
    ].map((item, index) => ensureItemAvailability({ ...item, coords: getCampusCoordsForLocation(item.location, index) }));

    const INBOX_MOCK = [
        { id: 'c1', owner: USERS['dave'], item: INITIAL_ITEMS[0], lastMsg: "Yes, I can meet at 2PM at the Admin Hub.", unread: 1, time: "10:42 AM", status: 'Awaiting Meetup', priority: 'Pickup today' },
        { id: 'c2', owner: USERS['sarah'], item: INITIAL_ITEMS[4], lastMsg: "Please ensure the files are backed up.", unread: 0, time: "Yesterday", status: 'Condition Review', priority: 'Photo proof logged' }
    ];

    const INITIAL_REQUESTS = [
        { id: 101, user: USERS['mark'], title: "LUNHAW Earth Day Props", category: "Production", budget: "₱400/day", dateNeeded: "This Friday" },
        { id: 102, user: USERS['sarah'], title: "Surveying Prism Pole", category: "Academic", budget: "₱200/day", dateNeeded: "Tomorrow" }
    ];

    const STUDENT_NEED_FILTERS = [
        { id: 'all', label: 'All Needs', tags: [] },
        { id: 'calculator', label: 'Calculators', tags: ['calculator', 'math', 'exam'] },
        { id: 'coding', label: 'Coding Gear', tags: ['coding', 'laptop', 'electronics', 'device'] },
        { id: 'printing', label: 'Printing', tags: ['printing', 'paperwork', 'reports'] },
        { id: 'lab', label: 'Lab & Health', tags: ['lab', 'health', 'science', 'clinical'] },
        { id: 'present', label: 'Presentation', tags: ['presentation', 'production', 'projector', 'content'] },
        { id: 'study', label: 'Study Kits', tags: ['books', 'review', 'academic', 'essentials', 'study'] }
    ];

    const REQUEST_TEMPLATES = [
        { title: "Scientific Calculator for Quiz Week", category: "Academic", budget: "250", dateNeeded: "Tomorrow", details: "Need a working scientific calculator for 2 days. Prefer Casio ClassWiz." },
        { title: "Printer for Research Chapter", category: "CITC", budget: "350", dateNeeded: "This Weekend", details: "Need a reliable printer for report chapters and appendices." },
        { title: "Projector for Group Reporting", category: "General", budget: "500", dateNeeded: "Friday", details: "Need a portable projector with HDMI for classroom reporting." },
        { title: "Arduino Kit for Prototype Demo", category: "COT", budget: "400", dateNeeded: "Next Tuesday", details: "Need an Arduino starter set for an embedded systems prototype." }
    ];

    const CATEGORY_RATE_GUIDE = {
        Academic: [100, 300],
        Production: [280, 850],
        CITC: [180, 700],
        CEA: [120, 550],
        COT: [150, 600],
        CSM: [120, 450],
        CSTE: [120, 450],
        CON: [180, 550],
        COM: [150, 500],
        General: [120, 400]
    };

    const LENDORA_PLATFORM_PERCENT = 15;
    const LENDORA_GUARD_PERCENT = 5;
    const STANDARD_LENDER_PERCENT = 100 - LENDORA_PLATFORM_PERCENT;
    const PROTECTED_LENDER_PERCENT = 100 - LENDORA_PLATFORM_PERCENT - LENDORA_GUARD_PERCENT;

    const getRevenueShare = (rentalFee, insured = false) => {
        const safeRentalFee = Math.max(0, Math.round(Number(rentalFee) || 0));
        const lendoraAmount = Math.round(safeRentalFee * (LENDORA_PLATFORM_PERCENT / 100));
        const guardAmount = insured ? Math.round(safeRentalFee * (LENDORA_GUARD_PERCENT / 100)) : 0;
        const lenderAmount = Math.max(0, safeRentalFee - lendoraAmount - guardAmount);

        return {
            lenderPercent: insured ? PROTECTED_LENDER_PERCENT : STANDARD_LENDER_PERCENT,
            lendoraPercent: LENDORA_PLATFORM_PERCENT,
            guardPercent: insured ? LENDORA_GUARD_PERCENT : 0,
            lenderAmount,
            lendoraAmount,
            guardAmount
        };
    };

    const getMeetupZone = (item) => `${item?.location || 'ICT Building'} Safe Zone`;

    const buildMeetupSnapshotCard = (item) => ({
        title: 'Meetup Snapshot',
        rows: [
            { label: 'Location', value: getMeetupZone(item) },
            { label: 'Escrow', value: 'Payment secured' },
            { label: 'Protection', value: item?.insured ? 'Lendora Guard active' : 'Standard handoff' }
        ],
        note: 'Use the action chips below for ETA updates, call requests, or condition-photo reminders.'
    });

    const getChatPreviewText = (message) => {
        if (!message) return 'No updates yet';
        if (message.text) return message.text;
        if (message.card?.title) return message.card.title;
        if (message.image) return 'Sent a photo';
        return 'New chat update';
    };

    const createDefaultChatMessages = (item) => [
        { text: `Hi! I've reserved the ${item?.name || 'item'}.`, type: 'sent', time: 'Just now', status: 'Seen' },
        {
            text: `Thanks. Meetup is at the ${getMeetupZone(item)}. Bring your student ID and we will do a quick handoff photo check.`,
            type: 'received',
            time: 'Just now',
            card: buildMeetupSnapshotCard(item)
        }
    ];

    const createChatThread = (thread = {}) => {
        const item = thread.item || null;
        const messages = Array.isArray(thread.messages) && thread.messages.length > 0
            ? thread.messages
            : createDefaultChatMessages(item);
        const lastMessage = messages[messages.length - 1];

        return {
            id: thread.id || `c_${Date.now()}`,
            rentalId: thread.rentalId || null,
            owner: thread.owner || item?.owner || CURRENT_USER,
            item,
            unread: thread.unread ?? 0,
            time: thread.time || lastMessage?.time || 'Just now',
            lastMsg: thread.lastMsg || getChatPreviewText(lastMessage),
            status: thread.status || (item ? 'Active Rental' : 'Open Thread'),
            priority: thread.priority || ((thread.unread ?? 0) > 0 ? 'Needs reply' : 'On track'),
            meetupZone: thread.meetupZone || getMeetupZone(item),
            protectionLabel: thread.protectionLabel || (item?.insured ? 'Lendora Guard' : 'Standard'),
            schedule: thread.schedule || item?.schedule || null,
            messages
        };
    };

    // --- Countdown UI for active rentals ---
    const formatRemaining = (ms) => {
        if (!Number.isFinite(ms) || ms <= 0) return '00:00:00';
        const total = Math.max(0, Math.floor(ms / 1000));
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const seconds = total % 60;
        return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
    };

    const Countdown = ({ endTime }) => {
        const [now, setNow] = useState(Date.now());
        useEffect(() => {
            if (!endTime) return;
            const id = setInterval(() => setNow(Date.now()), 1000);
            return () => clearInterval(id);
        }, [endTime]);

        if (!endTime) return null;
        const remaining = endTime - now;
        const human = formatRemaining(remaining);
        const label = remaining > 0 ? `Time left ${human}` : 'Ended';
        return (
            <div className={`text-[11px] font-bold ${remaining > 0 ? 'text-green-700' : 'text-red-600'}`}>
                {label}
            </div>
        );
    };

    // --- Service worker & web-push subscription helpers ---
    const VAPID_PUBLIC_KEY = 'REPLACE_WITH_YOUR_VAPID_PUBLIC_KEY'; // TODO: replace with real key

    const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const registerServiceWorkerAndSubscribe = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return console.info('Push not supported in this browser');
        try {
            const reg = await navigator.serviceWorker.register('sw.js');
            console.info('Service worker registered', reg);
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return console.info('Push permission not granted');
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
            console.info('Push subscription acquired', sub);
            // Send subscription to server for cross-device notifications
            try { await fetch('/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) }); } catch (e) { console.warn('Failed to register subscription with server', e); }
            return sub;
        } catch (err) {
            console.warn('SW/Push registration failed', err);
        }
    };

    const unsubscribePush = async () => {
        if (!('serviceWorker' in navigator)) return;
        try {
            const reg = await navigator.serviceWorker.getRegistration();
            if (!reg) return;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                await sub.unsubscribe();
                try { await fetch('/unsubscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) }); } catch (e) { console.warn('Failed to tell server about unsubscribe', e); }
            }
        } catch (e) { console.warn('Unsubscribe failed', e); }
    };

    const PROFILE_VISIBILITY_OPTIONS = [
        { id: 'students', label: 'Verified students only', note: 'Only verified campus users can see your full profile.' },
        { id: 'campus', label: 'Campus members', note: 'Anyone on the campus app can discover your profile.' },
        { id: 'private', label: 'Private profile', note: 'Only linked rentals and direct contacts can view you.' }
    ];

    const MESSAGE_PRIVACY_OPTIONS = [
        { id: 'linked-only', label: 'Linked rentals only', note: 'Only threads tied to items, rentals, or requests can start chats.' },
        { id: 'verified-only', label: 'Verified students', note: 'Any verified student can message you from profile or listing entry points.' },
        { id: 'everyone', label: 'Open inbox', note: 'All users can start a message thread with you.' }
    ];

    const formatTagLabel = (tag) => tag.replace(/-/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());

    const getItemSignals = (item) => {
        const tags = item.tags || [];
        const signals = [];
        if (item.priceDaily <= 200) signals.push({ icon: 'ph-piggy-bank', label: 'Budget Pick' });
        else if (item.priceDaily <= 500) signals.push({ icon: 'ph-student', label: 'Student Rate' });
        if (item.insured) signals.push({ icon: 'ph-shield-check', label: 'Guarded' });
        if ((item.rating || 0) >= 4.8) signals.push({ icon: 'ph-star', label: 'Top Rated' });
        if (tags.includes('presentation')) signals.push({ icon: 'ph-presentation-chart', label: 'Presentation Ready' });
        if (tags.includes('lab')) signals.push({ icon: 'ph-flask', label: 'Lab Ready' });
        if (tags.includes('coding')) signals.push({ icon: 'ph-code', label: 'Project Ready' });
        return signals.slice(0, 3);
    };

    const getRequestUrgencyMeta = (req) => {
        const needed = (req.dateNeeded || '').toLowerCase();
        if (needed.includes('today') || needed.includes('tomorrow')) {
            return { label: 'Urgent', tone: 'bg-red-50 text-red-700 border border-red-200', note: 'Needs a fast lender reply' };
        }
        if (needed.includes('friday') || needed.includes('week')) {
            return { label: 'Soon', tone: 'bg-amber-50 text-amber-700 border border-amber-200', note: 'Best to arrange meetup early' };
        }
        return { label: 'Open', tone: 'bg-blue-50 text-blue-700 border border-blue-200', note: 'Flexible campus handoff window' };
    };

    const getListingHealthMeta = (item) => {
        if (item.paused) return { label: 'Paused', meter: 0, tone: 'text-amber-700 bg-amber-50 border border-amber-200' };
        if (item.priceDaily <= 650) return { label: 'High booking chance', meter: 88, tone: 'text-green-700 bg-green-50 border border-green-200' };
        if (item.priceDaily <= 900) return { label: 'Solid match rate', meter: 68, tone: 'text-blue-700 bg-blue-50 border border-blue-200' };
        return { label: 'Lower student fit', meter: 38, tone: 'text-red-700 bg-red-50 border border-red-200' };
    };

    const getRentalProgressMeta = (status) => {
        if (status === 'Authorized') return { progress: 34, label: 'Awaiting handoff', note: 'Next step: meet the owner and scan the handoff QR.' };
        if (status === 'Active') return { progress: 72, label: 'On rent', note: 'Next step: keep chat open for return coordination.' };
        if (status === 'No-Show') return { progress: 100, label: 'Meetup issue logged', note: 'The missed meetup was recorded for trust and refund review.' };
        return { progress: 100, label: 'Completed', note: 'Rental closed. You can now leave a review.' };
    };

    const toDateKey = (value) => {
        const date = value instanceof Date ? value : new Date(value);
        const safeDate = Number.isFinite(date.getTime()) ? date : new Date();
        return `${safeDate.getFullYear()}-${String(safeDate.getMonth() + 1).padStart(2, '0')}-${String(safeDate.getDate()).padStart(2, '0')}`;
    };

    const fromDateKey = (dateKey) => {
        const [year, month, day] = String(dateKey || '').split('-').map(Number);
        return new Date(year || new Date().getFullYear(), (month || 1) - 1, day || 1, 0, 0, 0, 0);
    };

    const formatDateLabel = (value, options = { month: 'short', day: 'numeric' }) => {
        const date = value instanceof Date ? value : new Date(value);
        if (!Number.isFinite(date.getTime())) return 'Flexible';
        return date.toLocaleDateString('en-PH', options);
    };

    const formatSlotLabel = (slotId) => MEETUP_TIME_SLOTS.find((slot) => slot.id === slotId)?.label || slotId;

    const formatDateTimeLabel = (timestamp) => {
        if (!Number.isFinite(timestamp)) return 'Flexible';
        return new Date(timestamp).toLocaleString('en-PH', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const parseBudgetAmount = (budget) => {
        const numeric = String(budget || '').replace(/[^\d.]/g, '');
        return Math.max(0, Number(numeric) || 0);
    };

    const getRentalBaseFee = (rental) => {
        const unitPrice = rental?.type === 'Hours' ? rental?.priceHourly : rental?.priceDaily;
        return Math.max(0, (Number(unitPrice) || 0) * Math.max(1, Number(rental?.dur) || 1));
    };

    const buildBookingWindow = ({ dateKey, slotId, durationValue = 1, isHourly = false }) => {
        const day = fromDateKey(dateKey);
        const [hours, minutes] = String(slotId || '08:00').split(':').map(Number);
        const startTs = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours || 0, minutes || 0, 0, 0).getTime();
        const durationMs = Math.max(1, Number(durationValue) || 1) * (isHourly ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000);
        const endTs = startTs + durationMs;

        return {
            startTs,
            endTs,
            dateKey: toDateKey(startTs),
            slotId,
            slotLabel: formatSlotLabel(slotId),
            dateLabel: formatDateLabel(startTs, { weekday: 'short', month: 'short', day: 'numeric' }),
            windowLabel: `${formatDateTimeLabel(startTs)} to ${new Date(endTs).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}`
        };
    };

    const getRentalWindow = (rental) => {
        if (!rental) return null;

        const startTs = rental.bookingStart || rental.startTime || null;
        const endTs = rental.bookingEnd || rental.endTime || (startTs ? startTs + (rental.type === 'Hours' ? (rental.dur || 1) * 60 * 60 * 1000 : (rental.dur || 1) * 24 * 60 * 60 * 1000) : null);

        if (!startTs || !endTs) return null;

        return {
            startTs,
            endTs,
            dateKey: toDateKey(startTs),
            slotId: rental.schedule?.slotId || `${String(new Date(startTs).getHours()).padStart(2, '0')}:${String(new Date(startTs).getMinutes()).padStart(2, '0')}`,
            dateLabel: formatDateLabel(startTs, { weekday: 'short', month: 'short', day: 'numeric' }),
            slotLabel: rental.schedule?.slotLabel || new Date(startTs).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' }),
            summary: `${formatDateLabel(startTs, { month: 'short', day: 'numeric' })} • ${new Date(startTs).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}`,
            windowLabel: `${formatDateTimeLabel(startTs)} to ${formatDateTimeLabel(endTs)}`
        };
    };

    const rangesOverlap = (startA, endA, startB, endB) => Math.max(startA, startB) < Math.min(endA, endB);

    const hasBookingConflict = (itemId, startTs, endTs, rentals = [], excludeRentalId = null) =>
        rentals.some((rental) => {
            if (!rental) return false;
            if ((rental.itemId || rental.id) !== itemId) return false;
            if (excludeRentalId && rental.id === excludeRentalId) return false;
            if (['Completed', 'No-Show'].includes(rental.status)) return false;
            const window = getRentalWindow(rental);
            if (!window) return false;
            return rangesOverlap(startTs, endTs, window.startTs, window.endTs);
        });

    const getItemBookings = (itemId, rentals = []) =>
        rentals
            .filter((rental) => (rental.itemId || rental.id) === itemId && !['Completed', 'No-Show'].includes(rental.status))
            .map((rental) => ({ rental, window: getRentalWindow(rental) }))
            .filter((entry) => entry.window)
            .sort((a, b) => a.window.startTs - b.window.startTs);

    const getUpcomingAvailabilitySlots = (item, rentals = [], durationValue = 1, isHourly = false, maxSlots = 10) => {
        const availability = item?.availability || createDefaultAvailability(item?.location);
        const now = Date.now();
        const results = [];

        for (let dayOffset = 0; dayOffset < Math.max(5, availability.maxAdvanceDays || 14); dayOffset += 1) {
            const day = new Date();
            day.setHours(0, 0, 0, 0);
            day.setDate(day.getDate() + dayOffset);
            if (!availability.activeDays.includes(day.getDay())) continue;

            for (const slotId of availability.slots || []) {
                const preview = buildBookingWindow({ dateKey: toDateKey(day), slotId, durationValue, isHourly });
                if (preview.startTs < now + (availability.leadHours || 0) * 60 * 60 * 1000) continue;
                if (hasBookingConflict(item.id, preview.startTs, preview.endTs, rentals)) continue;
                results.push(preview);
                if (results.length >= maxSlots) return results;
            }
        }

        return results;
    };

    const getLateFeeEstimate = (rental, now = Date.now()) => {
        const window = getRentalWindow(rental);
        if (!window || now <= window.endTs) return 0;
        const hoursLate = Math.ceil((now - window.endTs) / (60 * 60 * 1000));
        return hoursLate * Math.max(20, Number(rental.lateFeePerHour) || 0);
    };

    const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

    const getTrustSnapshot = (targetUser, rentals = [], items = [], reviews = []) => {
        if (!targetUser?.id) {
            return { score: 50, badge: 'New', avgRating: 0, completed: 0, noShows: 0, lateReturns: 0, label: 'Building history' };
        }

        const ownedItems = items.filter((item) => item.owner?.id === targetUser.id);
        const ownedItemIds = ownedItems.map((item) => item.id);
        const relatedRentals = rentals.filter((rental) => [rental.borrower?.id, rental.lender?.id, rental.owner?.id].includes(targetUser.id));
        const completed = relatedRentals.filter((rental) => rental.status === 'Completed').length;
        const noShows = relatedRentals.filter((rental) => rental.noShow?.atFaultUserId === targetUser.id).length;
        const lateReturns = relatedRentals.filter((rental) => rental.borrower?.id === targetUser.id && Number(rental.lateFeeApplied) > 0).length;
        const claimFlags = relatedRentals.filter((rental) => rental.claimStatus === 'Approved' && rental.borrower?.id === targetUser.id).length;
        const reviewPool = reviews.filter((review) => ownedItemIds.includes(review.itemId));
        const avgRating = reviewPool.length > 0
            ? reviewPool.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / reviewPool.length
            : Number(targetUser.rating) || 0;
        const score = clampScore(
            48 +
            (targetUser.studentVerified ? 12 : 0) +
            (targetUser.phoneVerified ? 4 : 0) +
            (targetUser.idUploaded ? 6 : 0) +
            completed * 4 +
            avgRating * 6 -
            noShows * 12 -
            lateReturns * 7 -
            claimFlags * 8
        );

        return {
            score,
            avgRating: Math.round(avgRating * 10) / 10,
            completed,
            noShows,
            lateReturns,
            badge: score >= 86 ? 'Campus Trusted' : score >= 72 ? 'Reliable' : score >= 58 ? 'Fair Standing' : 'Needs history',
            label: score >= 86 ? 'Excellent meetup and completion record.' : score >= 72 ? 'Healthy trust and response behavior.' : score >= 58 ? 'Still building stronger rental history.' : 'Needs more completed rentals and cleaner records.'
        };
    };

    const tokenizeSearchCorpus = (text = '') =>
        String(text)
            .toLowerCase()
            .split(/[^a-z0-9]+/)
            .filter((token) => token.length > 2);

    const doesSavedSearchMatchItem = (searchConfig, item) => {
        if (!searchConfig || !item) return false;
        const query = String(searchConfig.query || '').trim().toLowerCase();
        const corpus = `${item.name} ${item.category} ${item.location} ${item.description} ${(item.tags || []).join(' ')}`.toLowerCase();
        const matchesQuery = !query || corpus.includes(query);
        const matchesCategory = !searchConfig.category || searchConfig.category === 'All' || item.category === searchConfig.category;
        const matchesNeed = !searchConfig.needFilter || searchConfig.needFilter === 'all' || (item.tags || []).some((tag) => (searchConfig.needTags || []).includes(tag));
        const matchesPrice = Number(item.priceDaily) <= Number(searchConfig.maxPrice || 999999);
        const matchesRating = Number(item.rating || 0) >= Number(searchConfig.minRating || 0);
        return matchesQuery && matchesCategory && matchesNeed && matchesPrice && matchesRating;
    };

    const getRequestMatchScore = (item, request, rentals = []) => {
        if (!item || !request) return 0;

        const requestBudget = parseBudgetAmount(request.budget);
        const requestTokens = new Set(tokenizeSearchCorpus(`${request.title} ${request.details || ''}`));
        const itemTokens = tokenizeSearchCorpus(`${item.name} ${item.category} ${item.description} ${(item.tags || []).join(' ')}`);
        const tokenMatches = itemTokens.filter((token) => requestTokens.has(token)).length;
        const availabilityBonus = getUpcomingAvailabilitySlots(item, rentals, 1, false, 1).length > 0 ? 10 : 0;
        const budgetBonus = requestBudget === 0
            ? 10
            : item.priceDaily <= requestBudget
                ? 25
                : item.priceDaily <= requestBudget * 1.2
                    ? 12
                    : 0;

        return Math.min(99, (
            (item.category === request.category ? 35 : 10) +
            Math.min(30, tokenMatches * 8) +
            budgetBonus +
            availabilityBonus +
            ((item.insured ? 8 : 0) + ((item.rating || 0) >= 4.8 ? 6 : 0))
        ));
    };

    const getRequestMatches = (request, items = [], rentals = [], limit = 3) =>
        items
            .filter((item) => !item.paused)
            .map((item) => ({ item, score: getRequestMatchScore(item, request, rentals) }))
            .filter((entry) => entry.score >= 25)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

    const getLenderAnalytics = (user, items = [], rentals = [], reqs = [], savedSearches = []) => {
        const myItems = items.filter((item) => item.owner?.id === user?.id);
        const myItemIds = myItems.map((item) => item.id);
        const myRentals = rentals.filter((rental) => myItemIds.includes(rental.itemId || rental.id));
        const completed = myRentals.filter((rental) => rental.status === 'Completed');
        const active = myRentals.filter((rental) => rental.status === 'Active' || rental.status === 'Authorized');
        const totalRevenue = completed.reduce((sum, rental) => {
            const share = getRevenueShare(getRentalBaseFee(rental), rental.insured);
            return sum + share.lenderAmount;
        }, 0);
        const demandMatches = reqs
            .filter((request) => request.user?.id !== user?.id)
            .map((request) => ({ request, matches: getRequestMatches(request, myItems, rentals, 1) }))
            .filter((entry) => entry.matches.length > 0);
        const watchHits = savedSearches.reduce((sum, searchConfig) => sum + myItems.filter((item) => doesSavedSearchMatchItem(searchConfig, item)).length, 0);
        const overpricedListings = myItems.filter((item) => item.priceDaily > ((CATEGORY_RATE_GUIDE[item.category] || CATEGORY_RATE_GUIDE.General)[1] || 1000)).length;
        const completionRate = myRentals.length > 0 ? Math.round((completed.length / myRentals.length) * 100) : 0;

        return {
            myItems,
            myRentals,
            liveListings: myItems.filter((item) => !item.paused).length,
            completionRate,
            totalRevenue,
            activeBookings: active.length,
            demandMatches,
            watchHits,
            protectedCount: myItems.filter((item) => item.insured).length,
            avgRate: myItems.length > 0 ? Math.round(myItems.reduce((sum, item) => sum + item.priceDaily, 0) / myItems.length) : 0,
            overpricedListings
        };
    };

    const readImageFileAsPreview = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const image = new Image();
            image.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const scale = Math.min(1, 720 / Math.max(image.width, image.height));
                    canvas.width = Math.round(image.width * scale);
                    canvas.height = Math.round(image.height * scale);
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.68));
                } catch (error) {
                    resolve(reader.result);
                }
            };
            image.onerror = () => resolve(reader.result);
            image.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const buildScheduleCard = (scheduleWindow, item) => ({
        title: 'Meetup Schedule',
        rows: [
            { label: 'Date', value: scheduleWindow?.dateLabel || 'Flexible' },
            { label: 'Meetup', value: getMeetupZone(item) },
            { label: 'Window', value: scheduleWindow?.slotLabel || 'To confirm' }
        ],
        note: 'Use the thread shortcuts below if you need to confirm or adjust the meetup time.'
    });

    // --- REUSABLE UI COMPONENTS ---
    const SectionTitle = ({ children }) => <h2 className="text-xs font-bold text-slate-500 uppercase mb-3 mt-6 px-2 section-title-line">{children}</h2>;
    
    const MenuBtn = ({ icon, color, label, onClick, subtitle }) => (
        <motion.div whileTap={{ scale: 0.98 }} whileHover={{ y: -2 }} onClick={onClick} className="premium-card p-4 rounded-2xl transition-all mb-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} shadow-sm`}><i className={`ph ${icon} text-xl`}></i></div>
                <div><span className="text-sm font-bold text-slate-800 block">{label}</span>{subtitle && <span className="text-[10px] text-slate-400 font-medium">{subtitle}</span>}</div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                <i className="ph ph-caret-right text-slate-500 text-sm"></i>
            </div>
        </motion.div>
    );

    const GoogleMapsKeyPanel = ({ value, onChange, onSave }) => (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mt-4 text-left shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-2">Google Maps Key</p>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Paste Google Maps JavaScript API key"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
                type="button"
                onClick={onSave}
                className="w-full mt-3 py-3 rounded-xl bg-brand-900 text-white text-sm font-black"
            >
                Save Key And Reload Map
            </button>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-3">
                This key must have Google Maps JavaScript API enabled and billing turned on.
            </p>
        </div>
    );

    // --- MAP (Grab / Waze style campus map without API key) ---
    const CampusMap = ({ items, onSelect, selectedItem, mapStyleKey, showRoute, userLocation }) => {
        const mapRef = useRef(null);
        const mapInstance = useRef(null);
        const tileLayerRef = useRef(null);
        const campusLayerRef = useRef(null);
        const pointsLayerRef = useRef(null);
        const routeLayerRef = useRef(null);
        const [mapNotice, setMapNotice] = useState('');
        const [mapReady, setMapReady] = useState(false);
        const initCenter = clampToCampus(userLocation?.coords || USTP_CDO_CENTER);
        const showMapFallback = /failed|issue|unavailable/i.test(mapNotice);
        const handleMapZoom = (delta) => {
            const map = mapInstance.current;
            if (!map) return;
            const nextZoom = Math.max(CAMPUS_MAP_MIN_ZOOM, Math.min(CAMPUS_MAP_MAX_ZOOM, (map.getZoom() || CAMPUS_MAP_DEFAULT_ZOOM) + delta));
            map.setZoom(nextZoom, { animate: true });
        };
        const handleRecenterMap = () => {
            const map = mapInstance.current;
            const Leaflet = window.L;
            if (!map || !Leaflet) return;

            const userCoords = clampToCampus(userLocation?.coords || USTP_CDO_CENTER);
            const selectedCoords = selectedItem ? clampToCampus(selectedItem.coords || initCenter) : null;

            if (showRoute && selectedCoords) {
                const routeSummary = getRouteSummary(userCoords, selectedCoords);
                map.fitBounds(Leaflet.latLngBounds(toLeafletPath(routeSummary.points)), {
                    paddingTopLeft: [40, 110],
                    paddingBottomRight: [40, 190],
                    animate: true,
                    maxZoom: CAMPUS_MAP_FIT_MAX_ZOOM
                });
                return;
            }

            map.flyTo(
                toLeafletLatLng(selectedCoords || userCoords),
                selectedCoords ? CAMPUS_MAP_FOCUS_ZOOM : CAMPUS_MAP_DEFAULT_ZOOM,
                { animate: true, duration: 0.8 }
            );
        };

        useEffect(() => {
            const container = mapRef.current;
            if (!container) return;

            if (!container.offsetWidth || !container.offsetHeight) {
                setMapNotice('Map container not ready. Please try again.');
                const retryTimer = setTimeout(() => {
                    if (container.offsetWidth > 0 && container.offsetHeight > 0) {
                        setMapNotice('');
                    }
                }, 500);
                return () => clearTimeout(retryTimer);
            }

            const Leaflet = window.L;
            if (!Leaflet) {
                setMapNotice('Map library failed to load. Please refresh the page.');
                return;
            }

            try {
                const map = Leaflet.map(container, {
                    zoomControl: false,
                    attributionControl: true,
                    preferCanvas: true,
                    maxBounds: LEAFLET_CAMPUS_BOUNDS,
                    maxBoundsViscosity: 0.75,
                    minZoom: CAMPUS_MAP_MIN_ZOOM,
                    maxZoom: CAMPUS_MAP_MAX_ZOOM,
                    zoomSnap: 0.05,
                    zoomDelta: 0.5,
                    scrollWheelZoom: true,
                    doubleClickZoom: true,
                    touchZoom: true,
                    dragging: true,
                    keyboard: true,
                    wheelPxPerZoomLevel: 60
                });

                map.setView(toLeafletLatLng(initCenter), CAMPUS_MAP_DEFAULT_ZOOM);
                map.attributionControl.setPrefix('');

                mapInstance.current = map;
                pointsLayerRef.current = Leaflet.layerGroup().addTo(map);
                routeLayerRef.current = Leaflet.layerGroup().addTo(map);

                requestAnimationFrame(() => map.invalidateSize());
                setMapReady(true);
                setMapNotice('');
            } catch (error) {
                console.error('Leaflet map initialization failed:', error);
                setMapNotice('Map loading issue. Please refresh the page.');
            }

            return () => {
                if (mapInstance.current) {
                    mapInstance.current.remove();
                    mapInstance.current = null;
                }
                tileLayerRef.current = null;
                campusLayerRef.current = null;
                pointsLayerRef.current = null;
                routeLayerRef.current = null;
            };
        }, []);

        useEffect(() => {
            const map = mapInstance.current;
            const Leaflet = window.L;
            if (!map || !Leaflet || !mapReady) return;

            const theme = getLeafletTheme(mapStyleKey);
            const userCoords = clampToCampus(userLocation?.coords || USTP_CDO_CENTER);
            const selectedCoords = selectedItem ? clampToCampus(selectedItem.coords || initCenter) : null;

            if (tileLayerRef.current) {
                map.removeLayer(tileLayerRef.current);
            }
            tileLayerRef.current = Leaflet.tileLayer(theme.url, theme.options).addTo(map);

            if (campusLayerRef.current) {
                map.removeLayer(campusLayerRef.current);
            }
            campusLayerRef.current = createLeafletCampusOverlay(Leaflet, mapStyleKey).addTo(map);

            if (!pointsLayerRef.current) {
                pointsLayerRef.current = Leaflet.layerGroup().addTo(map);
            }
            pointsLayerRef.current.clearLayers();

            addLeafletFocusZone(Leaflet, pointsLayerRef.current, userCoords, 'blue', 18);
            Leaflet.marker(toLeafletLatLng(userCoords), {
                icon: createLeafletPulseIcon(Leaflet, 'live'),
                keyboard: false
            }).addTo(pointsLayerRef.current);

            items.forEach((item, index) => {
                const markerCoords = clampToCampus(item.coords || getCampusPoint(index));
                const marker = Leaflet.marker(toLeafletLatLng(markerCoords), {
                    icon: createLeafletItemIcon(Leaflet, item, selectedItem?.id === item.id),
                    keyboard: false
                });
                marker.bindTooltip(item.name, {
                    direction: 'top',
                    offset: [0, -36],
                    opacity: 0.96,
                    className: 'map-item-tooltip'
                });
                if (selectedItem?.id === item.id) {
                    marker.openTooltip();
                }
                marker.on('click', (event) => {
                    if (event?.originalEvent) {
                        Leaflet.DomEvent.stop(event.originalEvent);
                    }
                    onSelect(item);
                    marker.openTooltip();
                });
                marker.addTo(pointsLayerRef.current);
            });

            map.off('click');
            map.on('click', () => onSelect(null));

            if (!routeLayerRef.current) {
                routeLayerRef.current = Leaflet.layerGroup().addTo(map);
            }
            routeLayerRef.current.clearLayers();

            if (showRoute && selectedCoords) {
                const routeSummary = getRouteSummary(userCoords, selectedCoords);
                addLeafletFocusZone(Leaflet, routeLayerRef.current, selectedCoords, 'green', 22);
                addLeafletRouteLayer(Leaflet, routeLayerRef.current, routeSummary.points, { showArrows: true });
                map.fitBounds(Leaflet.latLngBounds(toLeafletPath(routeSummary.points)), {
                    paddingTopLeft: [40, 110],
                    paddingBottomRight: [40, 190],
                    animate: true,
                    maxZoom: CAMPUS_MAP_FIT_MAX_ZOOM
                });
            } else if (selectedCoords) {
                addLeafletFocusZone(Leaflet, routeLayerRef.current, selectedCoords, 'green', 22);
                map.flyTo(toLeafletLatLng(selectedCoords), CAMPUS_MAP_FOCUS_ZOOM, { animate: true, duration: 0.8 });
            } else {
                map.flyTo(toLeafletLatLng(userCoords), CAMPUS_MAP_DEFAULT_ZOOM, { animate: true, duration: 0.8 });
            }

            requestAnimationFrame(() => map.invalidateSize());
        }, [items, selectedItem, onSelect, showRoute, mapReady, userLocation, initCenter[0], initCenter[1], mapStyleKey]);

        return (
            <>
                <div id="map-container" ref={mapRef}></div>
                <div className="map-ui-stack">
                    <button type="button" onClick={() => handleMapZoom(CAMPUS_MAP_ZOOM_STEP)} className="map-ui-btn active:scale-90 transition-transform">
                        <i className="ph ph-plus text-lg"></i>
                    </button>
                    <button type="button" onClick={() => handleMapZoom(-CAMPUS_MAP_ZOOM_STEP)} className="map-ui-btn active:scale-90 transition-transform">
                        <i className="ph ph-minus text-lg"></i>
                    </button>
                    <button type="button" onClick={handleRecenterMap} className="map-ui-btn wide active:scale-95 transition-transform">
                        <i className={`ph ${showRoute && selectedItem ? 'ph-navigation-arrow' : 'ph-crosshair'} text-base`}></i>
                        <span>{showRoute && selectedItem ? 'Route' : 'Center'}</span>
                    </button>
                </div>
                <div className="map-ui-hint">Pinch, drag, and tap markers</div>
                {mapNotice && (
                    <div className="absolute top-4 left-4 right-4 z-[1000] bg-white/95 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-semibold text-slate-600 shadow-sm">
                        {mapNotice}
                    </div>
                )}
                {showMapFallback && (
                    <div className="absolute inset-0 bg-slate-50 flex items-center justify-center p-6">
                        <div className="text-center max-w-sm">
                            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="ph ph-map-trifold text-2xl text-slate-500"></i>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Map Unavailable</h3>
                            <p className="text-sm text-slate-600 mb-4">The campus map could not load. You can still browse the item list.</p>
                        </div>
                    </div>
                )}
            </>
        );
    };

    // --- SCREENS ---

    const OnboardingScreen = ({ onFinish }) => {
        const [step, setStep] = useState(0);
        const data = [
            { title: "Borrow what you need.", subtitle: "Find class-ready gear from verified USTP CDO students.", icon: "ph-student" },
            { title: "Lend with clear protection.", subtitle: "Optional Lendora Guard supports documented accidental-damage claims.", icon: "ph-shield-check" },
            { title: "Meet up with confidence.", subtitle: "Escrow, chat records, and handoff checks keep each rental accountable.", icon: "ph-lock-key" }
        ];
        return (
            <div className="flex-1 min-h-0 bg-white flex flex-col justify-end p-8 relative overflow-hidden pb-12">
                <div className="absolute top-0 inset-x-0 h-2/3 bg-gradient-to-b from-brand-50 to-white"></div>
                <div className="relative z-10 space-y-6 text-center">
                    <AnimatePresence mode="wait">
                        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                            <div className="w-20 h-20 mx-auto bg-brand-50 rounded-2xl flex items-center justify-center mb-6 text-brand-900 shadow-sm border border-brand-100">
                                <i className={`ph ${data[step].icon} text-4xl`}></i>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">{data[step].title}</h1>
                            <p className="text-slate-500 font-medium leading-relaxed px-4">{data[step].subtitle}</p>
                        </motion.div>
                    </AnimatePresence>
                    <div className="flex items-center justify-center flex-col pt-8 gap-8">
                        <div className="flex gap-2">
                            {[0,1,2].map(i => <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-6 bg-brand-900' : 'w-2 bg-slate-200'}`} />)}
                        </div>
                        <motion.button whileTap={{ scale: 0.97 }} onClick={() => step < 2 ? setStep(step+1) : onFinish()} className="w-full bg-brand-900 text-white font-bold py-4 rounded-xl shadow-soft text-lg transition-colors hover:bg-brand-950">
                            {step < 2 ? 'Continue' : 'Open App'}
                        </motion.button>
                    </div>
                </div>
            </div>
        );
    };

    const LoginScreen = ({ onLogin }) => {
        const [method, setMethod] = useState('email');
        const [identifier, setIdentifier] = useState('student@ustp.edu.ph');
        const [notice, setNotice] = useState('');
        const [continuing, setContinuing] = useState(false);

        const switchMethod = (nextMethod) => {
            setMethod(nextMethod);
            setIdentifier(nextMethod === 'email' ? 'student@ustp.edu.ph' : '09');
            setNotice('');
        };

        const normalizedIdentifier = method === 'phone'
            ? identifier.replace(/\D/g, '').slice(0, 11)
            : identifier.trim().toLowerCase();

        const handleContinue = () => {
            if (!normalizedIdentifier) {
                setNotice('Enter your email or phone first.');
                return;
            }
            if (method === 'email' && !normalizedIdentifier.includes('@')) {
                setNotice('Enter a valid email address.');
                return;
            }
            if (method === 'phone' && normalizedIdentifier.length < 10) {
                setNotice('Enter a valid phone number.');
                return;
            }

            setContinuing(true);
            setNotice('');
            setTimeout(() => {
                setContinuing(false);
                onLogin({ method, identifier: normalizedIdentifier });
            }, 500);
        };

        return (
            <div className="flex-1 min-h-0 flex flex-col p-8 bg-white justify-center relative">
                <div className="text-center mb-8 relative z-10">
                    <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-100 shadow-sm"><i className="ph ph-handshake text-brand-900 text-4xl"></i></div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Sign in</h1>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto">Use your school email or mobile number to continue.</p>
                </div>

                <div className="space-y-5 relative z-10">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-bold">Sign-in method</span>
                        <small>{method === 'email' ? 'Email' : 'Phone'}</small>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => switchMethod('email')}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition ${method === 'email' ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            <i className="ph ph-envelope mr-2"></i>Email
                        </button>
                        <button
                            type="button"
                            onClick={() => switchMethod('phone')}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition ${method === 'phone' ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            <i className="ph ph-device-mobile mr-2"></i>Phone
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">
                            {method === 'email' ? 'Email address' : 'Mobile number'}
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <i className={`ph ${method === 'email' ? 'ph-envelope' : 'ph-device-mobile'} text-slate-400`}></i>
                            </div>
                            <input
                                value={identifier}
                                onChange={(e) => setIdentifier(method === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 11) : e.target.value)}
                                inputMode={method === 'phone' ? 'numeric' : 'email'}
                                placeholder={method === 'email' ? 'student@ustp.edu.ph' : '09XXXXXXXXX'}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleContinue} className="w-full bg-brand-900 hover:bg-brand-950 text-white font-black py-4 rounded-xl shadow-md transition-colors">
                        {continuing ? 'Opening...' : 'Continue'}
                    </motion.button>

                    {notice && (
                        <div className="rounded-xl bg-brand-50 border border-brand-100 p-3 text-xs font-semibold text-brand-700">{notice}</div>
                    )}
                </div>
            </div>
        );
    };

    const VerificationGateView = ({ user, onOpenVerification }) => {
        const [message, setMessage] = useState('');

        const handleVerifyClick = () => {
            setMessage('Verification flow ready.');
            setTimeout(() => {
                onOpenVerification();
            }, 200);
        };

        return (
            <div className="flex-1 min-h-0 flex flex-col bg-slate-50 px-6 pt-16 pb-8">
                <div className="flex-1 flex flex-col justify-center gap-6">
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6">
                        <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 mb-5">
                            <i className="ph ph-shield-check text-2xl"></i>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand-700 mb-2">Student verification</p>
                        <h1 className="text-2xl font-black text-slate-900 leading-tight mb-2">A short verification is required to continue.</h1>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">Upload your student ID and confirm your school details in one tap. We keep this secure and private.</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-sm font-bold text-slate-900 mb-2">Current status</p>
                        <p className="text-sm text-slate-600 mb-4">{user.studentVerified ? 'Student status verified ✓' : 'Pending verification'}</p>
                        <button onClick={handleVerifyClick} className="w-full bg-brand-accent text-brand-950 font-black py-3 rounded-xl shadow-accent hover:bg-brand-400 transition">Start verification</button>
                        {message && <p className="mt-3 text-xs text-brand-700">{message}</p>}
                    </div>
                </div>
            </div>
        );
    };

    const ExploreView = ({ items, reqs, rentals, onSelect, onSave, saved, onCreateRequest, onCreateListing, onToggleListingPause, onAdjustListingPrice, onOfferRequest, savedSearches, onSaveSearch, onRemoveSavedSearch, onOpenAnalytics, userMode, setUserMode, user, userLocation, locationEnabled, onRefreshLocation, onToggleLocation }) => {
        const [isMap, setIsMap] = useState(false);
        const [mapStyle, setMapStyle] = useState('default');
        const [showRoute, setShowRoute] = useState(true);
        const [tab, setTab] = useState('gear');
        const [category, setCategory] = useState('All');
        const [search, setSearch] = useState('');
        const [selectedMapItem, setSelectedMapItem] = useState(null);
        const [sortBy, setSortBy] = useState('price-low');
        const [showAdvanced, setShowAdvanced] = useState(false);
        const [priceRange, setPriceRange] = useState([0, 1200]);
        const [minRating, setMinRating] = useState(0);
        const [budgetBand, setBudgetBand] = useState('student');
        const [needFilter, setNeedFilter] = useState('all');
        const [showRequestComposer, setShowRequestComposer] = useState(false);
        const [showListingComposer, setShowListingComposer] = useState(false);
        const [activeOfferReqId, setActiveOfferReqId] = useState(null);
        const [offerNote, setOfferNote] = useState('');
        const [composerError, setComposerError] = useState('');
        const [requestDraft, setRequestDraft] = useState({ title: '', category: 'Production', budget: '400', dateNeeded: 'Tomorrow', details: '' });
        const [listingDraft, setListingDraft] = useState({ name: '', category: 'Production', condition: 'Excellent', priceDaily: '500', location: 'ICT Building', description: '', insured: true, value: '12000', image: '' });
        const categoryOptions = ['All', ...Array.from(new Set(items.map(i => i.category))).sort()];
        const selectedNeed = STUDENT_NEED_FILTERS.find(f => f.id === needFilter) || STUDENT_NEED_FILTERS[0];
        const normalizedSearch = search.trim().toLowerCase();
        const listingRateBand = CATEGORY_RATE_GUIDE[listingDraft.category] || CATEGORY_RATE_GUIDE.General;
        const suggestedRate = Math.min(1000, Math.max(100, Math.round((listingRateBand[0] + listingRateBand[1]) / 2)));
        const locationLabel = !locationEnabled ? 'Location Off' : userLocation?.loading ? 'Locating' : 'Location On';

        const filteredItems = items.filter(i => {
            const isLive = !i.paused;
            const matchesCategory = category === 'All' || i.category === category;
            const corpus = `${i.name} ${i.category} ${i.location} ${i.description}`.toLowerCase();
            const matchesSearch = normalizedSearch === '' || corpus.includes(normalizedSearch) || (i.tags || []).some(tag => tag.includes(normalizedSearch));
            const matchesPrice = i.priceDaily >= priceRange[0] && i.priceDaily <= priceRange[1];
            const matchesRating = i.rating >= minRating;
            const matchesNeed = needFilter === 'all' || (i.tags || []).some(tag => selectedNeed.tags.includes(tag));
            const matchesBudgetBand =
                budgetBand === 'all' ? true :
                budgetBand === 'student' ? i.priceDaily <= 800 :
                budgetBand === 'project' ? i.priceDaily <= 1200 :
                i.priceDaily <= 1800;
            return isLive && matchesCategory && matchesSearch && matchesPrice && matchesRating && matchesBudgetBand && matchesNeed;
        });

        const sortedItems = [...filteredItems].sort((a, b) => {
            if (sortBy === 'newest') return 0;
            if (sortBy === 'price-low') return a.priceDaily - b.priceDaily;
            if (sortBy === 'price-high') return b.priceDaily - a.priceDaily;
            if (sortBy === 'rating') return b.rating - a.rating;
            return 0;
        });

        const visibleItems = sortedItems;
        const myListings = items.filter(i => i.owner?.id === user?.id);
        const activeListings = myListings.filter(i => !i.paused);
        const requestBoard = reqs.filter(r => r.user?.id !== user?.id);
        const myRequests = reqs.filter(r => r.user?.id === user?.id);
        const activeOfferTarget = reqs.find(r => r.id === activeOfferReqId);
        const estimatedDailyRevenue = activeListings.reduce((sum, item) => sum + item.priceDaily, 0);
        const estimatedDailyPayout = activeListings.reduce((sum, item) => sum + getRevenueShare(item.priceDaily, item.insured).lenderAmount, 0);
        const pendingOfferCount = requestBoard.filter(r => (r.offers || []).length > 0).length;
        const studentFriendlyListings = myListings.filter(i => i.priceDaily <= 900).length;
        const guardedListings = myListings.filter(i => i.insured).length;
        const activeFilterCount = [
            budgetBand !== 'student',
            needFilter !== 'all',
            category !== 'All',
            minRating > 0,
            sortBy !== 'price-low',
            priceRange[0] !== 0 || priceRange[1] !== 1200
        ].filter(Boolean).length;
        const watchlistPreview = savedSearches.slice(0, 2).map((searchConfig) => ({
            ...searchConfig,
            matchCount: items.filter((item) => doesSavedSearchMatchItem(searchConfig, item)).length
        }));
        const saveableSearch = normalizedSearch || activeFilterCount > 0;

        const submitRequest = (e) => {
            e.preventDefault();
            if (!requestDraft.title.trim()) return setComposerError('Add a request title.');
            if (!Number(requestDraft.budget)) return setComposerError('Add a valid daily budget.');
            if (Number(requestDraft.budget) > 1500) return setComposerError('Keep request budgets at ₱1,500/day or lower for student match rates.');
            onCreateRequest(requestDraft);
            setRequestDraft({ title: '', category: 'Production', budget: '400', dateNeeded: 'Tomorrow', details: '' });
            setComposerError('');
            setShowRequestComposer(false);
            setTab('requests');
        };

        const submitListing = (e) => {
            e.preventDefault();
            if (!listingDraft.name.trim()) return setComposerError('Add an item name.');
            if (!Number(listingDraft.priceDaily)) return setComposerError('Add a valid daily price.');
            if (Number(listingDraft.priceDaily) > 1000) return setComposerError('For student listings, keep the rate at ₱1,000/day or below.');
            onCreateListing(listingDraft);
            setListingDraft({ name: '', category: 'Production', condition: 'Excellent', priceDaily: '500', location: 'ICT Building', description: '', insured: true, value: '12000', image: '' });
            setComposerError('');
            setShowListingComposer(false);
        };

        const submitOffer = (e) => {
            e.preventDefault();
            if (!activeOfferReqId) return;
            if (!offerNote.trim()) return setComposerError('Add a short offer message.');
            onOfferRequest(activeOfferReqId, offerNote.trim());
            setOfferNote('');
            setComposerError('');
            setActiveOfferReqId(null);
        };

        return (
            <div className="flex-1 min-h-0 flex flex-col bg-slate-50 relative">
                <header className="blur-header pt-12 pb-4 px-6 z-40 flex justify-between items-center shrink-0">
                    <div className="flex-1">
                        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-1">{userMode === 'renter' ? 'Borrow Mode' : 'Lend Mode'}</h1>
                        <p className="text-[11px] text-slate-500 font-semibold mb-2">USTP CDO Marketplace • Verified student rentals</p>
                        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-fit">
                            <button onClick={() => setUserMode('renter')} className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition-all ${userMode === 'renter' ? 'bg-brand-900 text-white shadow-md' : 'text-slate-600'}`}>Borrow</button>
                            <button onClick={() => setUserMode('lender')} className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition-all ${userMode === 'lender' ? 'bg-brand-900 text-white shadow-md' : 'text-slate-600'}`}>Lend</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {userMode === 'renter' && tab === 'gear' && (
                            <>
                                <button onClick={() => { setIsMap(false); setSelectedMapItem(null); setTab('requests'); }} className="px-3 h-10 rounded-full bg-white text-slate-700 border border-slate-200 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center active:scale-90 transition-transform">Requests</button>
                                <button onClick={() => { setIsMap(!isMap); setSelectedMapItem(null); setTab('gear'); }} className="w-10 h-10 rounded-full bg-white text-slate-700 shadow-sm border border-slate-100 flex items-center justify-center active:scale-90 transition-transform"><i className={`ph ${isMap ? 'ph-list' : 'ph-map-trifold'} text-lg`}></i></button>
                            </>
                        )}
                        {userMode === 'renter' && tab === 'requests' && (
                            <button onClick={() => { setTab('gear'); setIsMap(false); }} className="px-3 h-10 rounded-full bg-white text-slate-700 border border-slate-200 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center active:scale-90 transition-transform">Find Gear</button>
                        )}
                    </div>
                </header>

                <div className="flex-1 min-h-0 flex flex-col relative">
                    {!isMap && userMode === 'renter' && (
                        <div className="px-6 pt-4 mb-2 relative z-30 shrink-0">
                            {tab === 'gear' && (
                                <>
                                    <div className="flex gap-2 mb-4">
                                        <div className="relative flex-1">
                                            <i className="ph ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
                                            <input type="text" placeholder="Search tech, books, tools..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white py-3.5 pl-12 pr-4 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-all border-0" />
                                        </div>
                                        <button onClick={() => setShowAdvanced(!showAdvanced)} className={`h-12 px-4 rounded-xl border flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${showAdvanced ? 'bg-brand-900 text-white border-brand-900' : 'bg-white text-slate-600 border-slate-200'}`}>
                                            <i className="ph ph-sliders-horizontal text-lg normal-case"></i>
                                            <span>Filter</span>
                                            {activeFilterCount > 0 && <span className={`min-w-5 h-5 px-1 rounded-full flex items-center justify-center text-[10px] ${showAdvanced ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-800'}`}>{activeFilterCount}</span>}
                                        </button>
                                    </div>

                                    <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                                        <button
                                            type="button"
                                            disabled={!saveableSearch}
                                            onClick={() => onSaveSearch({
                                                label: normalizedSearch ? `Search: ${search.trim()}` : `${category === 'All' ? 'Campus' : category} watch`,
                                                query: search.trim(),
                                                category,
                                                needFilter,
                                                needTags: selectedNeed.tags,
                                                maxPrice: priceRange[1],
                                                minRating,
                                                createdAt: Date.now()
                                            })}
                                            className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${saveableSearch ? 'bg-white text-brand-700 border-brand-200 shadow-sm' : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                                        >
                                            Save Search
                                        </button>
                                        {watchlistPreview.map((searchConfig) => (
                                            <div key={searchConfig.id} className="px-3 py-2 rounded-full bg-brand-50 border border-brand-100 text-[10px] font-black uppercase tracking-widest text-brand-800 whitespace-nowrap flex items-center gap-2">
                                                <span>{searchConfig.label}</span>
                                                <span className="text-brand-600">{searchConfig.matchCount} hits</span>
                                                <button type="button" onClick={() => onRemoveSavedSearch(searchConfig.id)} className="w-4 h-4 rounded-full bg-white/80 text-brand-700 flex items-center justify-center">
                                                    <i className="ph ph-x text-[10px]"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {showAdvanced && (
                                        <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="bg-brand-50 rounded-xl mb-4 border border-brand-100 filter-drawer-scroll">
                                            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 p-4 pb-3 bg-brand-50/95 backdrop-blur-sm border-b border-brand-100">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-700">Filter Items</p>
                                                    <p className="text-xs font-semibold text-slate-500">Scroll inside this panel to see all filter controls.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setBudgetBand('student');
                                                        setNeedFilter('all');
                                                        setCategory('All');
                                                        setPriceRange([0, 1200]);
                                                        setMinRating(0);
                                                        setSortBy('price-low');
                                                    }}
                                                    className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 shrink-0"
                                                >
                                                    Reset
                                                </button>
                                            </div>
                                            <div className="p-4 pt-3 space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-700 mb-2 block">Budget</label>
                                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                                    {[['student', 'Affordable'], ['project', 'Balanced'], ['pro', 'Premium'], ['all', 'All']].map(([v, l]) => (
                                                        <button key={v} onClick={() => setBudgetBand(v)} className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${budgetBand === v ? 'bg-brand-900 text-white border-brand-900' : 'bg-white text-slate-600 border-slate-200'}`}>{l}</button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-700 mb-2 block">Student Need</label>
                                                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                                    {STUDENT_NEED_FILTERS.map(filter => (
                                                        <button key={filter.id} onClick={() => setNeedFilter(filter.id)} className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${needFilter === filter.id ? 'bg-brand-100 text-brand-900 border-brand-300' : 'bg-white text-slate-500 border-slate-200'}`}>
                                                            {filter.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-700 mb-2 block">Category</label>
                                                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                                    {categoryOptions.map(c => (
                                                        <button key={c} onClick={() => setCategory(c)} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${category === c ? 'bg-brand-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>{c}</button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-xs font-bold text-slate-700">Price Range</label>
                                                    <span className="text-xs font-bold text-brand-600">₱{priceRange[0]} - ₱{priceRange[1]}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <input type="range" min="0" max="1200" value={priceRange[0]} onChange={e => setPriceRange([parseInt(e.target.value), priceRange[1]])} className="flex-1 h-2 bg-slate-200 rounded-full" />
                                                    <input type="range" min="0" max="1200" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])} className="flex-1 h-2 bg-slate-200 rounded-full" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-700 mb-2 block">Min Rating</label>
                                                <div className="flex gap-1">
                                                    {[0, 3, 4, 5].map(r => (
                                                        <button key={r} onClick={() => setMinRating(r)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${minRating === r ? 'bg-brand-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>{r === 0 ? 'All' : `${r}★`}</button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-700 mb-2 block">Sort By</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[['newest', 'Newest'], ['price-low', 'Price: Low→High'], ['price-high', 'Price: High→Low'], ['rating', 'Top Rated']].map(([v, l]) => (
                                                        <button key={v} onClick={() => setSortBy(v)} className={`py-2 rounded-lg text-xs font-bold transition-all ${sortBy === v ? 'bg-brand-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>{l}</button>
                                                    ))}
                                                </div>
                                            </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {userMode === 'renter' && !isMap && tab === 'gear' && (
                        <div className="flex-1 min-h-0 overflow-y-auto custom-scroll px-6 pb-28">
                            <div className="mt-4 space-y-3">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">Available Now</h3>
                                    <p className="text-xs font-semibold text-slate-500">{sortedItems.length} items inside USTP CDO campus</p>
                                </div>
                                <p className="text-[11px] font-semibold text-slate-500">{category === 'All' ? 'All categories' : category} • {needFilter === 'all' ? 'All needs' : selectedNeed.label} • {budgetBand === 'student' ? 'Student budget' : budgetBand === 'project' ? 'Balanced budget' : budgetBand === 'pro' ? 'Premium picks' : 'All price ranges'}</p>
                                <div className="space-y-3">
                                    {visibleItems.length === 0 ? (
                                        <p className="text-sm font-medium text-slate-500 py-6 text-center">No items match your current filters.</p>
                                    ) : (
                                        visibleItems.map((item, idx) => {
                                            const isSaved = saved.find(s => s.id === item.id);
                                            return (
                                                <motion.div initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{delay:idx*0.04}} key={item.id} className="premium-card p-3 rounded-2xl cursor-pointer active:scale-[0.98] transition-all flex items-start gap-3" onClick={() => onSelect(item)}>
                                                    <img src={item.images[0]} className="w-16 h-16 rounded-lg object-cover border border-slate-100" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <h4 className="font-bold text-sm text-slate-900 truncate">{item.name}</h4>
                                                            <p className="text-xs font-black text-brand-900 shrink-0">₱{item.priceDaily}/day</p>
                                                        </div>
                                                        <p className="text-xs text-slate-500 truncate">{item.category} • {item.location}</p>
                                                        <div className="mt-2 flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.condition}</span>
                                                                {item.insured && <span className="px-2 py-1 rounded-full bg-brand-50 text-[10px] font-bold uppercase tracking-widest text-brand-700 border border-brand-100">Guarded</span>}
                                                                {item.priceDaily <= 700 && <span className="px-2 py-1 rounded-full bg-amber-50 text-[10px] font-bold uppercase tracking-widest text-amber-700 border border-amber-100">Affordable</span>}
                                                            </div>
                                                            <span className="flex items-center gap-1 text-xs font-bold text-slate-700 shrink-0"><i className="ph-fill ph-star text-yellow-400"></i>{item.rating || 'New'}</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={(e) => {e.stopPropagation(); onSave(item);}} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-90"><i className={`${isSaved ? 'ph-fill text-brand-alert' : 'ph'} ph-heart`}></i></button>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {userMode === 'renter' && !isMap && tab === 'requests' && (
                        <div className="flex-1 min-h-0 overflow-y-auto custom-scroll px-6 pb-28">
                            <div className="bg-brand-50 border border-brand-200 p-4 rounded-xl mb-5 flex items-start gap-3">
                                <i className="ph-fill ph-megaphone text-brand-600 text-2xl shrink-0"></i>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-brand-900 mb-1">Request Board</p>
                                    <p className="text-xs font-medium text-brand-700 leading-relaxed">Post what you need for classes, org projects, or thesis work and get direct offers from lenders.</p>
                                </div>
                                <button onClick={() => { setComposerError(''); setShowRequestComposer(true); }} className="px-3 py-2 rounded-lg bg-white border border-brand-200 text-[10px] font-bold uppercase tracking-widest text-brand-700 active:scale-95">Post</button>
                            </div>

                            {myRequests.length > 0 && (
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Your Requests</h4>
                                        <span className="text-[10px] font-bold text-brand-700">{myRequests.length} active</span>
                                    </div>
                                    <div className="space-y-2">
                                        {myRequests.slice(0, 2).map(r => (
                                            <div key={`mine-${r.id}`} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                                <p className="text-sm font-bold text-slate-900 truncate">{r.title}</p>
                                                <div className="flex items-center justify-between text-[11px] mt-1">
                                                    <span className="font-semibold text-slate-500">{r.dateNeeded}</span>
                                                    <span className="font-bold text-brand-700">{(r.offers || []).length} offers</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {reqs.map((req) => {
                                    const ownReq = req.user?.id === user?.id;
                                    const existingOffer = (req.offers || []).find(o => o.lenderId === user?.id);
                                    const urgency = getRequestUrgencyMeta(req);
                                    const latestOffer = (req.offers || [])[0];
                                    const smartMatches = getRequestMatches(req, items, rentals, 2);
                                    return (
                                        <div key={req.id} className="premium-card p-4 rounded-2xl transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{req.category}</span>
                                                    <h4 className="font-bold text-slate-900 text-base">{req.title}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-brand-600 text-sm bg-brand-50 px-2 py-1 rounded-lg border border-brand-100">{req.budget}</p>
                                                    <span className={`inline-flex mt-2 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${urgency.tone}`}>{urgency.label}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4">
                                                <i className="ph ph-calendar-blank"></i> Needed: <span className="font-bold text-slate-700">{req.dateNeeded}</span>
                                                <span className="mx-1">•</span>
                                                <span className="font-bold text-brand-700">{(req.offers || []).length} offers</span>
                                            </div>
                                            {req.details && <p className="text-xs text-slate-600 font-medium mb-3 leading-relaxed">{req.details}</p>}
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 mb-3 flex items-center justify-between gap-3">
                                                <p className="text-[11px] font-semibold text-slate-600">{urgency.note}</p>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-700">Campus-safe meetup</span>
                                            </div>
                                            {latestOffer && (
                                                <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 mb-3">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-700 mb-1">Latest Offer</p>
                                                    <p className="text-xs font-medium text-brand-900 leading-relaxed">{latestOffer.lenderName}: {latestOffer.note}</p>
                                                </div>
                                            )}
                                            {smartMatches.length > 0 && (
                                                <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Smart Matches</p>
                                                    <div className="space-y-2">
                                                        {smartMatches.map(({ item, score }) => (
                                                            <div key={`smart-${req.id}-${item.id}`} className="flex items-center justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                                                                    <p className="text-[10px] font-semibold text-slate-500 truncate">{item.location} • ₱{item.priceDaily}/day</p>
                                                                </div>
                                                                <span className="px-2 py-1 rounded-full bg-green-50 border border-green-200 text-[9px] font-black uppercase tracking-widest text-green-700 shrink-0">{score}% fit</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                                                <div className="flex items-center gap-2">
                                                    <img src={req.user.avatar} className="w-6 h-6 rounded-full object-cover" />
                                                    <span className="text-xs font-bold text-slate-700">{req.user.name}</span>
                                                </div>
                                                <button
                                                    disabled={ownReq}
                                                    onClick={() => {
                                                        setComposerError('');
                                                        setActiveOfferReqId(req.id);
                                                        setOfferNote(existingOffer?.note || `I can fulfill "${req.title}" at your requested schedule.`);
                                                    }}
                                                    className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm ${ownReq ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-brand-950 bg-brand-accent hover:bg-yellow-500'}`}
                                                >
                                                    {ownReq ? 'Your Post' : existingOffer ? 'Update Offer' : 'Fulfill'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={() => { setComposerError(''); setShowRequestComposer(true); }} className="w-full mt-6 py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"><i className="ph-bold ph-plus"></i> Post a Request</button>
                        </div>
                    )}

                    {userMode === 'renter' && isMap && tab === 'gear' && (
                        <div className="flex-1 min-h-0 w-full relative">
                             <CampusMap items={sortedItems} selectedItem={selectedMapItem} onSelect={(item) => setSelectedMapItem(item)} mapStyleKey={mapStyle} showRoute={showRoute} userLocation={userLocation} />
                             <div className="absolute top-4 left-0 w-full z-[500] px-6 space-y-2">
                                 <div className="flex flex-wrap items-center gap-2">
                                     {['default','satellite','terrain'].map((styleKey) => (
                                         <button key={styleKey} onClick={() => setMapStyle(styleKey)} className={`px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-all ${mapStyle === styleKey ? 'bg-brand-900 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}>
                                             {styleKey === 'default' ? 'Map' : styleKey === 'satellite' ? 'Satellite' : 'Terrain'}
                                         </button>
                                     ))}
                                     <button onClick={() => setShowRoute(prev => !prev)} className={`px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-all ${showRoute ? 'bg-blue-900 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}>
                                         {showRoute ? 'Route On' : 'Route Off'}
                                     </button>
                                     <button onClick={onRefreshLocation} className="px-3 py-2 rounded-full bg-white text-slate-700 border border-slate-200 text-xs font-bold shadow-sm whitespace-nowrap">
                                         Refresh
                                     </button>
                                     <button onClick={onToggleLocation} className={`px-3 py-2 rounded-full text-xs font-bold shadow-sm whitespace-nowrap ${locationEnabled ? 'bg-brand-900 text-white border border-brand-900' : 'bg-white text-slate-700 border border-slate-200'}`}>
                                         {locationLabel}
                                     </button>
                                 </div>
                             </div>
                             <AnimatePresence>
                                 {selectedMapItem && (
                                     <motion.div initial={{ y: 150, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 150, opacity: 0 }} transition={{type: "spring", stiffness: 300, damping: 25}} className="absolute bottom-28 left-4 right-4 glass-panel p-3 rounded-2xl shadow-float flex items-center gap-3 cursor-pointer z-[1000]" onClick={() => onSelect(selectedMapItem)}>
                                         <img src={selectedMapItem.images[0]} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                                         <div className="flex-1"><h4 className="font-bold text-slate-900 text-sm leading-tight mb-1">{selectedMapItem.name}</h4><p className="text-[10px] text-slate-500 font-medium mb-1"><i className="ph-fill ph-map-pin text-brand-500"></i> {selectedMapItem.location}</p><p className="font-black text-brand-900 text-sm">₱{selectedMapItem.priceDaily} <span className="text-[10px] text-slate-400 font-normal">/day</span></p></div>
                                         <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mr-1"><i className="ph ph-arrow-right text-lg"></i></div>
                                     </motion.div>
                                 )}
                             </AnimatePresence>
                        </div>
                    )}

                    {userMode === 'lender' && (
                        <div className="flex-1 min-h-0 overflow-y-auto custom-scroll px-6 pb-28 pt-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2"><i className="ph-fill ph-hand-coins text-green-600"></i> Lender Workspace</h3>
                                <div className="campus-hero rounded-[26px] p-5 mb-4">
                                    <div className="relative z-10">
                                    <div className="grid grid-cols-3 gap-3">
                                        <div><p className="text-[9px] font-bold text-blue-100/80 uppercase mb-1">Active</p><p className="text-xl font-black text-white">{activeListings.length}</p></div>
                                        <div><p className="text-[9px] font-bold text-blue-100/80 uppercase mb-1">Demand</p><p className="text-xl font-black text-white">{requestBoard.length}</p></div>
                                        <div><p className="text-[9px] font-bold text-blue-100/80 uppercase mb-1">Gross/day</p><p className="text-xl font-black text-white">₱{estimatedDailyRevenue.toLocaleString()}</p></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                        <div className="campus-mini-stat rounded-2xl p-3">
                                            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-100/80">Student Priced</p>
                                            <p className="text-lg font-black mt-1">{studentFriendlyListings}</p>
                                            <p className="text-[10px] text-blue-100/80">listings at or below ₱900</p>
                                        </div>
                                        <div className="campus-mini-stat rounded-2xl p-3">
                                            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-100/80">Guarded</p>
                                            <p className="text-lg font-black mt-1">{guardedListings}</p>
                                            <p className="text-[10px] text-blue-100/80">protected handoffs</p>
                                        </div>
                                    </div>
                                    <div className="campus-mini-stat rounded-2xl p-3 mt-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-100/80">Take-home/day</p>
                                                <p className="text-lg font-black mt-1">₱{estimatedDailyPayout.toLocaleString()}</p>
                                            </div>
                                            <span className="px-2 py-1 rounded-full bg-white/10 border border-white/15 text-[9px] font-black uppercase tracking-widest text-white">Share Applied</span>
                                        </div>
                                        <p className="text-[10px] text-blue-100/80 mt-2">Standard: {STANDARD_LENDER_PERCENT}% lender / {LENDORA_PLATFORM_PERCENT}% Lendora. Protected: {PROTECTED_LENDER_PERCENT}% lender / {LENDORA_PLATFORM_PERCENT}% Lendora / {LENDORA_GUARD_PERCENT}% Guard.</p>
                                    </div>
                                    <p className="text-[11px] font-semibold text-blue-100/90 mt-3">{pendingOfferCount} requests already have lender interest. Cleaner photos and student-friendly rates close faster.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <button onClick={() => { setComposerError(''); setShowListingComposer(true); }} className="py-3 bg-brand-900 hover:bg-brand-950 text-white font-bold rounded-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-1"><i className="ph-fill ph-camera-plus text-lg"></i> New Listing</button>
                                    <button onClick={() => { setUserMode('renter'); setTab('requests'); }} className="py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-1"><i className="ph ph-list-checks text-lg"></i> Open Requests</button>
                                    <button onClick={onOpenAnalytics} className="py-3 bg-amber-50 border border-amber-200 text-amber-800 font-bold rounded-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-1"><i className="ph ph-chart-line-up text-lg"></i> Analytics</button>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-black text-slate-900 text-sm mb-3">Your Listings</h4>
                                {myListings.length === 0 ? (
                                    <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-6 text-center">
                                        <p className="text-sm font-bold text-slate-700 mb-1">No listings yet</p>
                                        <p className="text-xs text-slate-500 font-medium mb-4">Create your first listing to start receiving offers.</p>
                                        <button onClick={() => { setComposerError(''); setShowListingComposer(true); }} className="px-4 py-2 rounded-lg bg-brand-900 text-white text-xs font-bold uppercase tracking-widest">Add Listing</button>
                                    </div>
                                ) : (
                                    myListings.map(item => {
                                        const studentRate = item.priceDaily <= 900;
                                        const health = getListingHealthMeta(item);
                                        return (
                                        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} key={`listing-${item.id}`} className={`premium-card p-4 rounded-2xl mb-3 transition-all ${item.paused ? 'opacity-80' : ''}`}>
                                            <div className="flex gap-3">
                                                <img src={item.images?.[0]} className="w-14 h-14 rounded-xl object-cover border border-slate-200" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h5 className="font-bold text-slate-900 text-sm truncate">{item.name}</h5>
                                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${item.paused ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{item.paused ? 'Paused' : 'Live'}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500">{item.category} • {item.location}</p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <p className="text-xs font-black text-brand-900">₱{item.priceDaily}/day</p>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${studentRate ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{studentRate ? 'Student Rate' : 'High Rate'}</span>
                                                    </div>
                                                    <div className="mt-2">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Booking Health</span>
                                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${health.tone}`}>{health.label}</span>
                                                        </div>
                                                        <div className="campus-progress-track"><div className="campus-progress-fill" style={{width: `${health.meter}%`}}></div></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 mt-3">
                                                <button onClick={() => onSelect(item)} className="py-2 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-widest">View</button>
                                                <button onClick={() => onToggleListingPause(item.id)} className="py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-widest">{item.paused ? 'Resume' : 'Pause'}</button>
                                                <button onClick={() => onAdjustListingPrice(item.id, -50)} className="py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-widest">-₱50</button>
                                                <button onClick={() => onAdjustListingPrice(item.id, 50)} className="py-2 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 text-[10px] font-bold uppercase tracking-widest">+₱50</button>
                                            </div>
                                        </motion.div>
                                    );
                                    })
                                )}
                            </div>

                            <div>
                                <h4 className="font-black text-slate-900 text-sm mb-3">Demand You Can Fulfill</h4>
                                {requestBoard.length === 0 ? (
                                    <p className="text-center text-slate-400 py-6 font-medium text-sm">No matching requests at the moment.</p>
                                ) : (
                                    requestBoard.slice(0, 4).map(r => {
                                        const existingOffer = (r.offers || []).find(o => o.lenderId === user?.id);
                                        const urgency = getRequestUrgencyMeta(r);
                                        const bestFit = getRequestMatches(r, myListings, rentals, 1)[0];
                                        return (
                                            <div key={`demand-${r.id}`} className="campus-fact-card p-4 rounded-2xl mb-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{r.category}</p>
                                                        <p className="font-bold text-sm text-slate-900 truncate">{r.title}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{r.dateNeeded} • {r.budget}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${urgency.tone}`}>{urgency.label}</span>
                                                            <span className="text-[10px] font-semibold text-slate-500">{urgency.note}</span>
                                                        </div>
                                                        {bestFit && (
                                                            <div className="mt-2 rounded-xl bg-white border border-slate-200 px-3 py-2">
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Best Match</p>
                                                                <p className="text-xs font-bold text-slate-900 mt-1 truncate">{bestFit.item.name}</p>
                                                                <p className="text-[10px] font-semibold text-slate-500 mt-1">₱{bestFit.item.priceDaily}/day • {bestFit.score}% fit</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button onClick={() => { setComposerError(''); setActiveOfferReqId(r.id); setOfferNote(existingOffer?.note || `I can lend an item for "${r.title}".`); }} className="px-3 py-2 rounded-lg bg-brand-accent text-brand-950 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{existingOffer ? 'Update' : 'Offer'}</button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {showRequestComposer && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[10000] bg-slate-900/45 backdrop-blur-sm flex items-end">
                                <motion.form initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} onSubmit={submitRequest} className="w-full bg-white rounded-t-3xl p-5 space-y-3 max-h-[85vh] overflow-y-auto custom-scroll">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-black text-slate-900">Post a Request</h3>
                                        <button type="button" onClick={() => { setShowRequestComposer(false); setComposerError(''); }} className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><i className="ph ph-x"></i></button>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Quick Templates</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {REQUEST_TEMPLATES.map((t) => (
                                                <button
                                                    key={t.title}
                                                    type="button"
                                                    onClick={() => setRequestDraft({ ...requestDraft, title: t.title, category: t.category, budget: t.budget, dateNeeded: t.dateNeeded, details: t.details })}
                                                    className="text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-brand-300 transition-colors"
                                                >
                                                    <p className="text-[11px] font-bold text-slate-800 truncate">{t.title}</p>
                                                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">₱{t.budget}/day</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <input value={requestDraft.title} onChange={e => setRequestDraft({ ...requestDraft, title: e.target.value })} placeholder="What item do you need?" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <select value={requestDraft.category} onChange={e => setRequestDraft({ ...requestDraft, category: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold outline-none">
                                            {categoryOptions.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <input type="number" min="100" value={requestDraft.budget} onChange={e => setRequestDraft({ ...requestDraft, budget: e.target.value })} placeholder="Budget / day" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold outline-none" />
                                    </div>
                                    <div className="flex gap-2">
                                        {[300, 500, 800].map(v => (
                                            <button key={`quick-budget-${v}`} type="button" onClick={() => setRequestDraft({ ...requestDraft, budget: String(v) })} className="flex-1 py-2 rounded-lg bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600">
                                                ₱{v}/day
                                            </button>
                                        ))}
                                    </div>
                                    <input value={requestDraft.dateNeeded} onChange={e => setRequestDraft({ ...requestDraft, dateNeeded: e.target.value })} placeholder="Needed by (e.g. Tomorrow)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500" />
                                    <textarea rows="3" value={requestDraft.details} onChange={e => setRequestDraft({ ...requestDraft, details: e.target.value })} placeholder="Describe the requirement and condition expectations..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-brand-500"></textarea>
                                    {composerError && <p className="text-xs font-bold text-red-500">{composerError}</p>}
                                    <button type="submit" className="w-full bg-brand-900 text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-widest">Publish Request</button>
                                </motion.form>
                            </motion.div>
                        )}

                        {showListingComposer && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[10000] bg-slate-900/45 backdrop-blur-sm flex items-end">
                                <motion.form initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} onSubmit={submitListing} className="w-full bg-white rounded-t-3xl p-5 space-y-3 max-h-[88vh] overflow-y-auto custom-scroll">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-black text-slate-900">Create Listing</h3>
                                        <button type="button" onClick={() => { setShowListingComposer(false); setComposerError(''); }} className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><i className="ph ph-x"></i></button>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Student Audience Tip</p>
                                        <p className="text-xs font-medium text-blue-900 mt-1">Most campus rentals close faster between ₱250–₱900/day. Listings above ₱1,000/day are discouraged.</p>
                                    </div>
                                    <input value={listingDraft.name} onChange={e => setListingDraft({ ...listingDraft, name: e.target.value })} placeholder="Item name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <select value={listingDraft.category} onChange={e => setListingDraft({ ...listingDraft, category: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold outline-none">
                                            {categoryOptions.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <select value={listingDraft.condition} onChange={e => setListingDraft({ ...listingDraft, condition: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold outline-none">
                                            {['Pristine', 'Excellent', 'Good', 'Used'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="number" min="100" max="1000" value={listingDraft.priceDaily} onChange={e => setListingDraft({ ...listingDraft, priceDaily: e.target.value })} placeholder="Price / day" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold outline-none" />
                                        <input type="number" min="1000" value={listingDraft.value} onChange={e => setListingDraft({ ...listingDraft, value: e.target.value })} placeholder="Declared value" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold outline-none" />
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Suggested for {listingDraft.category}</p>
                                            <p className="text-xs font-semibold text-slate-700">₱{listingRateBand[0]} to ₱{listingRateBand[1]} / day</p>
                                        </div>
                                        <button type="button" onClick={() => setListingDraft({ ...listingDraft, priceDaily: String(suggestedRate) })} className="px-3 py-2 rounded-lg bg-white border border-brand-200 text-[10px] font-black uppercase tracking-widest text-brand-700">Use ₱{suggestedRate}</button>
                                    </div>
                                    <div className="flex gap-2">
                                        {[250, 500, 800].map(v => (
                                            <button key={`quick-rate-${v}`} type="button" onClick={() => setListingDraft({ ...listingDraft, priceDaily: String(v) })} className="flex-1 py-2 rounded-lg bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600">
                                                ₱{v}/day
                                            </button>
                                        ))}
                                    </div>
                                    <input value={listingDraft.location} onChange={e => setListingDraft({ ...listingDraft, location: e.target.value })} placeholder="Meetup location" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500" />
                                    <input value={listingDraft.image} onChange={e => setListingDraft({ ...listingDraft, image: e.target.value })} placeholder="Image URL (optional)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500" />
                                    <textarea rows="3" value={listingDraft.description} onChange={e => setListingDraft({ ...listingDraft, description: e.target.value })} placeholder="Description, inclusions, and reminders..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-brand-500"></textarea>
                                    <button type="button" onClick={() => setListingDraft({ ...listingDraft, insured: !listingDraft.insured })} className={`w-full border rounded-xl px-4 py-3 text-sm font-bold flex items-center justify-between ${listingDraft.insured ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                        <span>Enable Lendora Guard</span>
                                        <span>{listingDraft.insured ? 'ON' : 'OFF'}</span>
                                    </button>
                                    {composerError && <p className="text-xs font-bold text-red-500">{composerError}</p>}
                                    <button type="submit" className="w-full bg-brand-900 text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-widest">Publish Listing</button>
                                </motion.form>
                            </motion.div>
                        )}

                        {activeOfferReqId && activeOfferTarget && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[10000] bg-slate-900/45 backdrop-blur-sm flex items-end">
                                <motion.form initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} onSubmit={submitOffer} className="w-full bg-white rounded-t-3xl p-5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-black text-slate-900">Send Offer</h3>
                                        <button type="button" onClick={() => { setActiveOfferReqId(null); setComposerError(''); }} className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><i className="ph ph-x"></i></button>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{activeOfferTarget.category}</p>
                                        <p className="text-sm font-bold text-slate-900">{activeOfferTarget.title}</p>
                                        <p className="text-xs font-medium text-slate-500 mt-1">{activeOfferTarget.budget} • {activeOfferTarget.dateNeeded}</p>
                                    </div>
                                    <textarea rows="4" value={offerNote} onChange={e => setOfferNote(e.target.value)} placeholder="Write your offer details, availability, and meetup terms..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-brand-500"></textarea>
                                    {composerError && <p className="text-xs font-bold text-red-500">{composerError}</p>}
                                    <button type="submit" className="w-full bg-brand-accent text-brand-950 font-black py-3.5 rounded-xl text-sm uppercase tracking-widest">Send Offer</button>
                                </motion.form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    };

    const DetailView = ({ item, saved, onSave, onBack, onCheckout, isHourly, setIsHourly, duration, setDuration, onUser, rentals, ownerTrust }) => {
        const base = (isHourly ? item.priceHourly : item.priceDaily) * duration;
        const revenueShare = getRevenueShare(base, item.insured);
        const itemSignals = getItemSignals(item);
        const upcomingSlots = getUpcomingAvailabilitySlots(item, rentals, duration, isHourly, 4);
        const activeBookings = getItemBookings(item.id, rentals).slice(0, 2);
        const quickFacts = [
            { label: 'Daily Rate', value: `₱${item.priceDaily}`, icon: 'ph-coins' },
            { label: 'Condition', value: item.condition, icon: 'ph-sparkle' },
            { label: 'Meetup', value: item.location, icon: 'ph-map-pin' },
            { label: 'Protection', value: item.insured ? 'Lendora Guard' : 'Standard handoff', icon: 'ph-shield-check' }
        ];
        const itemTags = (item.tags || []).slice(0, 4).map(formatTagLabel);
        const ownerResponse = item.rating >= 4.8 ? 'Usually replies in under 15 minutes.' : 'Usually replies within the hour.';
        
        return (
            <div className="flex-1 min-h-0 flex flex-col bg-white relative">
                <div className="flex-1 min-h-0 overflow-y-auto custom-scroll pb-32">
                    <div className="relative h-[45vh] w-full shrink-0 bg-slate-100">
                        <motion.div layoutId={`card-${item.id}`} className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`url(${item.images[0]})`}}></motion.div>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"></div>
                        <div className="absolute top-12 left-4 right-4 z-50 flex justify-between">
                            <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform"><i className="ph ph-arrow-left text-xl"></i></button>
                            <div className="flex gap-2">
                                <button onClick={() => { navigator.share ? navigator.share({ title: item.name, text: item.description, url: window.location.href }) : alert('Share link copied!'); }} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform"><i className="ph ph-share-network text-xl"></i></button>
                                <button onClick={onSave} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform"><i className={`${saved ? 'ph-fill text-brand-alert' : 'ph'} ph-heart text-xl`}></i></button>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 -mt-8 relative z-20 bg-white rounded-t-3xl pt-6 pb-6 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
                        
                        <div className="mb-6">
                            <span className="bg-brand-50 text-brand-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest mb-2 inline-block border border-brand-100">{item.category}</span>
                            <h1 className="text-2xl font-black text-slate-900 leading-tight mb-2">{item.name}</h1>
                            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                                <span className="flex items-center gap-1 text-slate-900 font-bold"><i className="ph-fill ph-star text-brand-accent"></i> {item.rating > 0 ? item.rating : 'New'}</span>
                                <span>•</span><span className="flex items-center gap-1"><i className="ph-fill ph-map-pin text-brand-500"></i> {item.location}</span>
                            </div>
                            {itemSignals.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {itemSignals.map(sig => (
                                        <span key={`${item.id}-${sig.label}`} className="campus-chip soft">
                                            <i className={`ph ${sig.icon} text-sm normal-case`}></i>{sig.label}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div onClick={onUser} className="flex items-center justify-between py-4 border-y border-slate-100 mb-6 cursor-pointer hover:bg-slate-50 active:scale-[0.98] transition-all -mx-2 px-2 rounded-xl">
                            <div className="flex items-center gap-3">
                                <img src={item.owner.avatar} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                                <div><p className="font-bold text-slate-900 text-sm">Hosted by {item.owner.name}</p><p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest flex items-center gap-1 mt-0.5"><i className="ph-fill ph-seal-check"></i> Verified Student</p></div>
                            </div>
                            <i className="ph ph-caret-right text-slate-400 text-xl"></i>
                        </div>

                        <div className="campus-fact-card rounded-2xl p-4 mb-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-700">Campus Trust Note</p>
                                    <p className="text-sm font-semibold text-slate-700 mt-1">{ownerResponse}</p>
                                </div>
                                <span className="campus-chip soft"><i className="ph ph-handshake text-sm normal-case"></i>Safe Meetup</span>
                            </div>
                            {ownerTrust && (
                                <div className="grid grid-cols-3 gap-2 mt-3">
                                    <div className="chat-inline-card rounded-xl p-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-1">Trust</p>
                                        <p className="text-sm font-black text-slate-900">{ownerTrust.score}/100</p>
                                    </div>
                                    <div className="chat-inline-card rounded-xl p-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-1">Completed</p>
                                        <p className="text-sm font-black text-slate-900">{ownerTrust.completed}</p>
                                    </div>
                                    <div className="chat-inline-card rounded-xl p-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-1">Badge</p>
                                        <p className="text-xs font-black text-slate-900 leading-relaxed">{ownerTrust.badge}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {quickFacts.map(fact => (
                                <div key={fact.label} className="campus-fact-card rounded-2xl p-4">
                                    <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 mb-3">
                                        <i className={`ph ${fact.icon} text-lg`}></i>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{fact.label}</p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">{fact.value}</p>
                                </div>
                            ))}
                        </div>

                        {itemTags.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-bold text-slate-900 text-base mb-3">Best For</h3>
                                <div className="flex flex-wrap gap-2">
                                    {itemTags.map(tag => <span key={`${item.id}-${tag}`} className="campus-chip soft">{tag}</span>)}
                                </div>
                            </div>
                        )}

                        <div className="campus-fact-card rounded-2xl p-4 mb-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-700">Availability Calendar</p>
                                    <p className="text-sm font-semibold text-slate-700 mt-1">{upcomingSlots.length > 0 ? 'Conflict-aware meetup windows' : 'No open slots in the next few days'}</p>
                                </div>
                                <span className="campus-chip soft"><i className="ph ph-calendar-check text-sm normal-case"></i>{activeBookings.length} active bookings</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-3">
                                {upcomingSlots.length > 0 ? upcomingSlots.map((slot) => (
                                    <div key={`${item.id}-${slot.dateKey}-${slot.slotId}`} className="chat-inline-card rounded-xl p-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-1">{slot.dateLabel}</p>
                                        <p className="text-sm font-bold text-slate-900">{slot.slotLabel}</p>
                                        <p className="text-[11px] font-medium text-slate-500 mt-1">{isHourly ? `${duration} hour booking` : `${duration} day booking`}</p>
                                    </div>
                                )) : (
                                    <div className="col-span-2 rounded-xl bg-white border border-dashed border-slate-300 px-4 py-4">
                                        <p className="text-sm font-bold text-slate-900">All nearby slots are booked.</p>
                                        <p className="text-xs font-medium text-slate-500 mt-1">Try another duration or wait for the next open campus meetup window.</p>
                                    </div>
                                )}
                            </div>
                            {activeBookings.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                                    {activeBookings.map(({ rental, window }) => (
                                        <div key={`booking-${rental.id}`} className="flex items-center justify-between gap-3 text-xs">
                                            <span className="font-bold text-slate-700">{window.summary}</span>
                                            <span className="text-slate-500 font-semibold">{rental.status}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mb-8"><h3 className="font-bold text-slate-900 text-base mb-2">Description</h3><p className="text-sm text-slate-600 font-medium leading-relaxed">{item.description}</p></div>

                        <div className="bg-slate-50 p-5 rounded-2xl mb-6 border border-slate-200">
                            <div className="flex justify-between items-center mb-5"><span className="text-sm font-bold text-slate-700">Rental Type</span><div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm"><button onClick={()=>setIsHourly(false)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${!isHourly ? 'bg-brand-900 text-white' : 'text-slate-500'}`}>Daily</button><button onClick={()=>setIsHourly(true)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${isHourly ? 'bg-brand-900 text-white' : 'text-slate-500'}`}>Hourly</button></div></div>
                            <div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-700">{isHourly ? 'Hours' : 'Days'} Needed</span><div className="flex items-center gap-4"><button onClick={()=>setDuration(Math.max(1, duration-1))} className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 active:scale-90 transition-transform"><i className="ph ph-minus"></i></button><span className="text-lg font-black w-6 text-center text-slate-900">{duration}</span><button onClick={()=>setDuration(duration+1)} className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-900 active:scale-90 transition-transform"><i className="ph ph-plus"></i></button></div></div>
                        </div>

                        <div className="campus-fact-card rounded-2xl p-4 mb-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-700">Rental Profit Split</p>
                                    <p className="text-sm font-semibold text-slate-700 mt-1">{item.insured ? 'Protected rental share' : 'Standard rental share'}</p>
                                </div>
                                <span className="campus-chip soft"><i className="ph ph-chart-pie-slice text-sm normal-case"></i>{revenueShare.lenderPercent}% lender</span>
                            </div>
                            <div className={`grid gap-3 mt-3 text-sm ${item.insured ? 'grid-cols-3' : 'grid-cols-2'}`}>
                                <div>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Lender</p>
                                    <p className="text-slate-900 font-bold mt-1">{revenueShare.lenderPercent}%</p>
                                    <p className="text-[11px] font-medium text-slate-500 mt-1">₱{revenueShare.lenderAmount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Lendora</p>
                                    <p className="text-slate-900 font-bold mt-1">{revenueShare.lendoraPercent}%</p>
                                    <p className="text-[11px] font-medium text-slate-500 mt-1">₱{revenueShare.lendoraAmount.toLocaleString()}</p>
                                </div>
                                {item.insured && (
                                    <div>
                                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Guard</p>
                                        <p className="text-slate-900 font-bold mt-1">{revenueShare.guardPercent}%</p>
                                        <p className="text-[11px] font-medium text-slate-500 mt-1">₱{revenueShare.guardAmount.toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                            <p className="text-[11px] font-medium text-slate-500 mt-3">Applies to the rental fee only. Deposit stays separate.</p>
                        </div>

                        <div className="campus-fact-card rounded-2xl p-4 mb-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-2">Campus Handoff Plan</p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Meetup</p>
                                    <p className="text-slate-900 font-bold mt-1">{item.location}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Check</p>
                                    <p className="text-slate-900 font-bold mt-1">Photo + condition verify</p>
                                </div>
                            </div>
                        </div>

                        {item.insured && (
                            <div className="p-5 rounded-2xl border-2 border-brand-200 bg-brand-50">
                                <div className="flex items-center gap-2 mb-1"><div className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-600 text-white"><i className="ph-fill ph-shield-check text-lg"></i></div><h4 className="font-bold text-slate-900 text-sm">Protected by Lendora Guard™</h4></div>
                                <p className="text-xs text-slate-600 font-medium mt-2 pl-10">This item is fully insured. A visual condition check is required at handoff.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 glass-panel z-50 flex items-center justify-between">
                    <div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Total Due</p><p className="text-2xl font-black text-brand-900">₱{base.toLocaleString()}</p></div>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={onCheckout} className="bg-brand-accent text-brand-950 font-black py-3.5 px-8 rounded-xl shadow-accent text-base hover:bg-yellow-500 transition-colors">Reserve Gear</motion.button>
                </div>
            </div>
        );
    };

    const CheckoutView = ({ item, dur, isHr, wallet, paymentMethods, rentals, onCancel, onConfirm, onAddMethod }) => {
        const base = (isHr ? item.priceHourly : item.priceDaily) * dur;
        const revenueShare = getRevenueShare(base, item.insured);
        const deposit = Math.ceil(item.value * 0.05);
        const totalWithDeposit = base + deposit;
        const lateFeePerHour = Math.max(20, Math.ceil((isHr ? item.priceHourly : item.priceDaily) * 0.08));
        const [proc, setProc] = useState(false);
        const [selectedMethod, setSelectedMethod] = useState('wallet');
        const availableSlots = getUpcomingAvailabilitySlots(item, rentals, dur, isHr, 18);
        const scheduleDays = Array.from(new Set(availableSlots.map((slot) => slot.dateKey))).map((dateKey) => ({
            dateKey,
            dateLabel: availableSlots.find((slot) => slot.dateKey === dateKey)?.dateLabel || formatDateLabel(fromDateKey(dateKey))
        }));
        const [selectedDateKey, setSelectedDateKey] = useState(scheduleDays[0]?.dateKey || '');
        const daySlots = availableSlots.filter((slot) => slot.dateKey === selectedDateKey);
        const [selectedSlotId, setSelectedSlotId] = useState(daySlots[0]?.slotId || availableSlots[0]?.slotId || '');
        const selectedWindow = selectedDateKey && selectedSlotId
            ? buildBookingWindow({ dateKey: selectedDateKey, slotId: selectedSlotId, durationValue: dur, isHourly: isHr })
            : null;
        const hasConflict = selectedWindow ? hasBookingConflict(item.id, selectedWindow.startTs, selectedWindow.endTs, rentals) : true;
        const handoffNote = item.insured ? 'Protected handoff with photo verification at meetup.' : 'Standard meetup handoff with item condition check.';

        useEffect(() => {
            if (!scheduleDays.some((day) => day.dateKey === selectedDateKey)) {
                setSelectedDateKey(scheduleDays[0]?.dateKey || '');
            }
        }, [selectedDateKey, scheduleDays]);

        useEffect(() => {
            const nextDaySlots = availableSlots.filter((slot) => slot.dateKey === selectedDateKey);
            if (!nextDaySlots.some((slot) => slot.slotId === selectedSlotId)) {
                setSelectedSlotId(nextDaySlots[0]?.slotId || availableSlots[0]?.slotId || '');
            }
        }, [availableSlots, selectedDateKey, selectedSlotId]);

        const handleConfirm = () => {
            if (!selectedWindow || hasConflict) return;
            if (selectedMethod === 'wallet' && wallet < totalWithDeposit) return;
            setProc(true);
            setTimeout(() => onConfirm(totalWithDeposit, deposit, selectedMethod, selectedWindow, lateFeePerHour), 1200);
        };

        return (
            <div className="flex-1 min-h-0 flex flex-col bg-slate-50 relative">
                <header className="blur-header absolute top-0 left-0 right-0 pt-12 pb-4 px-6 z-50 flex items-center justify-between border-b border-slate-200 shrink-0"><button onClick={onCancel} className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-900 active:scale-90 transition-transform"><i className="ph ph-arrow-left text-lg"></i></button><h1 className="text-lg font-black text-slate-900">Checkout</h1><div className="w-10"></div></header>

                <div className="flex-1 min-h-0 overflow-y-auto custom-scroll px-6 pt-28 pb-32 space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex gap-4 pb-4 border-b border-slate-100 items-center"><img src={item.images[0]} className="w-16 h-16 rounded-xl object-cover border border-slate-100" /><div className="flex-1"><h4 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2 mb-1">{item.name}</h4><p className="text-[10px] font-bold text-slate-500 uppercase">{dur} {isHr ? 'hours' : 'days'}</p></div></div>
                        <div className="py-4 space-y-3">
                            <div className="flex justify-between text-sm font-medium"><span className="text-slate-500">Rental Fee</span><span className="font-bold text-slate-900">₱{base.toLocaleString()}</span></div>
                            <div className="flex justify-between text-sm font-medium"><span className="text-slate-500">Refundable Deposit</span><span className="font-bold text-slate-900">₱{deposit.toLocaleString()}</span></div>
                        </div>
                        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                            <div className="flex items-center justify-between gap-3 mb-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-700">Profit Split</p>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.insured ? 'Protected' : 'Standard'}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium"><span className="text-slate-500">Lender payout ({revenueShare.lenderPercent}%)</span><span className="font-bold text-slate-900">₱{revenueShare.lenderAmount.toLocaleString()}</span></div>
                                <div className="flex justify-between text-sm font-medium"><span className="text-slate-500">Lendora fee ({revenueShare.lendoraPercent}%)</span><span className="font-bold text-slate-900">₱{revenueShare.lendoraAmount.toLocaleString()}</span></div>
                                {item.insured && <div className="flex justify-between text-sm font-medium"><span className="text-slate-500">Guard pool ({revenueShare.guardPercent}%)</span><span className="font-bold text-slate-900">₱{revenueShare.guardAmount.toLocaleString()}</span></div>}
                            </div>
                            <p className="text-[11px] font-medium text-slate-500 mt-2">The split is taken from the rental fee only. The deposit stays separate.</p>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-end"><span className="font-bold text-slate-400 text-xs uppercase tracking-widest">Total Authorize</span><span className="text-2xl font-black text-brand-900">₱{totalWithDeposit.toLocaleString()}</span></div>
                    </div>

                    <div className="campus-fact-card rounded-2xl p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-2">Campus Handoff</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Meetup</p>
                                <p className="text-slate-900 font-bold mt-1">{item.location}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Protection</p>
                                <p className="text-slate-900 font-bold mt-1">{item.insured ? 'Guarded' : 'Standard'}</p>
                            </div>
                        </div>
                        <p className="text-xs font-medium text-slate-600 mt-3">{handoffNote}</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-700">Availability Calendar</p>
                                <p className="text-sm font-semibold text-slate-700 mt-1">Choose a conflict-free campus meetup slot.</p>
                            </div>
                            <span className="campus-chip soft"><i className="ph ph-calendar-check text-sm normal-case"></i>{availableSlots.length} open slots</span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {scheduleDays.map((day) => (
                                <button key={day.dateKey} type="button" onClick={() => setSelectedDateKey(day.dateKey)} className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap border transition-all ${selectedDateKey === day.dateKey ? 'bg-brand-900 text-white border-brand-900' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                    {day.dateLabel}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                            {daySlots.map((slot) => (
                                <button key={`${slot.dateKey}-${slot.slotId}`} type="button" onClick={() => setSelectedSlotId(slot.slotId)} className={`rounded-xl border px-3 py-3 text-left transition-all ${selectedSlotId === slot.slotId ? 'bg-brand-50 border-brand-300' : 'bg-white border-slate-200'}`}>
                                    <p className="text-sm font-black text-slate-900">{slot.slotLabel}</p>
                                    <p className="text-[10px] font-semibold text-slate-500 mt-1">{isHr ? `${dur} hour window` : `${dur} day handoff start`}</p>
                                </button>
                            ))}
                        </div>
                        {selectedWindow && (
                            <div className={`mt-4 rounded-xl border px-4 py-3 ${hasConflict ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${hasConflict ? 'text-red-600' : 'text-green-700'}`}>{hasConflict ? 'Conflict Found' : 'Schedule Ready'}</p>
                                <p className="text-sm font-bold text-slate-900 mt-1">{selectedWindow.windowLabel}</p>
                                <p className="text-xs font-medium text-slate-500 mt-1">{hasConflict ? 'Another active booking overlaps with this slot. Pick a different meetup window.' : 'This window has a 20-minute no-show grace period and a late fee of ₱' + lateFeePerHour + '/hour once overdue.'}</p>
                            </div>
                        )}
                        {availableSlots.length === 0 && (
                            <div className="mt-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 px-4 py-4">
                                <p className="text-sm font-bold text-slate-900">No upcoming slots available.</p>
                                <p className="text-xs font-medium text-slate-500 mt-1">Try a shorter duration or check back after the current bookings finish.</p>
                            </div>
                        )}
                    </div>

                    <SectionTitle>Payment Method</SectionTitle>
                    <div className="space-y-3 mt-2">
                        <div onClick={()=>setSelectedMethod('wallet')} className={`p-4 bg-white rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${selectedMethod==='wallet' ? 'border-brand-600 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                            <div className="flex items-center gap-3"><i className="ph-fill ph-wallet text-brand-600 text-2xl"></i><div><p className="text-sm font-bold text-slate-900">Lendora Wallet</p><p className={`text-xs font-medium ${wallet < totalWithDeposit ? 'text-brand-alert' : 'text-slate-500'}`}>Balance: ₱{wallet.toLocaleString()}</p></div></div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod==='wallet' ? 'border-brand-600 bg-brand-600' : 'border-slate-300'}`}>{selectedMethod==='wallet' && <i className="ph-bold ph-check text-white text-[10px]"></i>}</div>
                        </div>

                        <div onClick={()=>setSelectedMethod('cash')} className={`p-4 bg-white rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${selectedMethod==='cash' ? 'border-brand-600 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                            <div className="flex items-center gap-3"><i className="ph-fill ph-money text-green-600 text-2xl"></i><div><p className="text-sm font-bold text-slate-900">Cash on Meetup</p><p className="text-xs font-medium text-slate-500">Deposit required via card or wallet</p></div></div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod==='cash' ? 'border-brand-600 bg-brand-600' : 'border-slate-300'}`}>{selectedMethod==='cash' && <i className="ph-bold ph-check text-white text-[10px]"></i>}</div>
                        </div>

                        {paymentMethods.map(pm => (
                            <div key={pm.id} onClick={()=>setSelectedMethod(pm.id)} className={`p-4 bg-white rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${selectedMethod===pm.id ? 'border-brand-600 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                                <div className="flex items-center gap-3"><i className={`ph-fill ${pm.type === 'gcash' ? 'ph-device-mobile text-blue-500' : 'ph-credit-card text-slate-700'} text-2xl`}></i><div><p className="text-sm font-bold text-slate-900">{pm.name}</p><p className="text-xs font-medium text-slate-500">{pm.detail}</p></div></div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod===pm.id ? 'border-brand-600 bg-brand-600' : 'border-slate-300'}`}>{selectedMethod===pm.id && <i className="ph-bold ph-check text-white text-[10px]"></i>}</div>
                            </div>
                        ))}

                        <button onClick={onAddMethod} className="w-full py-4 rounded-xl border border-dashed border-slate-300 text-slate-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"><i className="ph-bold ph-plus"></i> Add Payment Method</button>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 glass-panel z-50">
                    <motion.button whileTap={(!hasConflict && (selectedMethod !== 'wallet' || wallet >= totalWithDeposit) && selectedWindow) ? { scale: 0.95 } : {}} onClick={handleConfirm} disabled={proc || hasConflict || !selectedWindow || (selectedMethod === 'wallet' && wallet < totalWithDeposit)} className={`w-full text-brand-950 font-black py-4 rounded-xl flex justify-center items-center gap-2 text-base transition-all ${ (!hasConflict && selectedWindow && (selectedMethod !== 'wallet' || wallet >= totalWithDeposit)) ? 'bg-brand-accent shadow-accent hover:bg-yellow-500' : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'}`}>{proc ? <i className="ph-bold ph-spinner animate-spin text-xl"></i> : 'Confirm Authorization'}</motion.button>
                </div>
            </div>
        );
    };

    const SuccessView = ({ onDone }) => (
        <div className="flex-1 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 flex flex-col items-center justify-center p-8 text-center text-white z-[9999] space-y-6">
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{type:'spring', stiffness: 200, damping: 20}} className="w-24 h-24 bg-brand-accent rounded-full flex items-center justify-center mb-2 text-brand-950 shadow-accent"><i className="ph-bold ph-check text-5xl"></i></motion.div>
            <div>
                <h2 className="text-3xl font-black mb-2 tracking-tight">Reservation Confirmed!</h2>
                <p className="font-medium text-brand-100 leading-relaxed">Your rental has been secured. Payment set in escrow and protected by Lendora Guard.</p>
            </div>
            <div className="w-full bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/20 space-y-3 text-left">
                <div className="flex items-center gap-3"><i className="ph-fill ph-check-circle text-green-300 text-xl flex-shrink-0"></i><div><p className="text-sm font-bold">Funds Secured</p><p className="text-xs text-brand-100">Payment escrowed until handoff</p></div></div>
                <div className="flex items-center gap-3"><i className="ph-fill ph-chat-circle text-blue-300 text-xl flex-shrink-0"></i><div><p className="text-sm font-bold">Chat with Owner</p><p className="text-xs text-brand-100">Coordinate pickup time & location</p></div></div>
                <div className="flex items-center gap-3"><i className="ph-fill ph-shield text-yellow-300 text-xl flex-shrink-0"></i><div><p className="text-sm font-bold">48-Hour Cancellation</p><p className="text-xs text-brand-100">Free cancellation before handoff</p></div></div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={onDone} className="w-full bg-white text-brand-900 font-black py-4 rounded-xl shadow-lg text-lg hover:bg-slate-50 transition-colors active:scale-95">View Activity</motion.button>
        </div>
    );

    const DirectionsView = ({ rental, onBack, userLocation }) => {
        const mapRef = useRef(null);
        const mapInstance = useRef(null);
        const tileLayerRef = useRef(null);
        const campusLayerRef = useRef(null);
        const pointsLayerRef = useRef(null);
        const routeLayerRef = useRef(null);
        const [mapNotice, setMapNotice] = useState('');
        const originCoords = clampToCampus(userLocation?.coords || getCampusCoordsForLocation('Student Center', rental?.id || 0));
        const destinationCoords = clampToCampus(rental?.coords || USTP_CDO_CENTER);
        const routeSummary = rental ? getRouteSummary(originCoords, destinationCoords) : null;
        const showMapFallback = /failed|issue|unavailable/i.test(mapNotice);
        const handleDirectionsZoom = (delta) => {
            const map = mapInstance.current;
            if (!map) return;
            const nextZoom = Math.max(CAMPUS_MAP_MIN_ZOOM, Math.min(CAMPUS_MAP_MAX_ZOOM, (map.getZoom() || CAMPUS_MAP_DEFAULT_ZOOM) + delta));
            map.setZoom(nextZoom, { animate: true });
        };
        const handleFitRoute = () => {
            const map = mapInstance.current;
            const Leaflet = window.L;
            if (!map || !Leaflet || !routeSummary) return;
            map.fitBounds(Leaflet.latLngBounds(toLeafletPath(routeSummary.points)), {
                paddingTopLeft: [40, 120],
                paddingBottomRight: [40, 240],
                animate: true,
                maxZoom: CAMPUS_MAP_FIT_MAX_ZOOM
            });
        };

        useEffect(() => {
            const container = mapRef.current;
            if (!container || !rental) return;

            if (!container.offsetWidth || !container.offsetHeight) {
                setMapNotice('Map container not ready. Please try again.');
                const retryTimer = setTimeout(() => {
                    if (container.offsetWidth > 0 && container.offsetHeight > 0) {
                        setMapNotice('');
                    }
                }, 600);
                return () => clearTimeout(retryTimer);
            }

            const Leaflet = window.L;
            if (!Leaflet) {
                setMapNotice('Map library failed to load. Please refresh the page.');
                return;
            }

            try {
                const map = Leaflet.map(container, {
                    zoomControl: false,
                    attributionControl: true,
                    preferCanvas: true,
                    maxBounds: LEAFLET_CAMPUS_BOUNDS,
                    maxBoundsViscosity: 0.75,
                    minZoom: CAMPUS_MAP_MIN_ZOOM,
                    maxZoom: CAMPUS_MAP_MAX_ZOOM,
                    zoomSnap: 0.05,
                    zoomDelta: 0.5,
                    scrollWheelZoom: true,
                    doubleClickZoom: true,
                    touchZoom: true,
                    dragging: true,
                    keyboard: true,
                    wheelPxPerZoomLevel: 60
                });

                map.setView(toLeafletLatLng(originCoords), CAMPUS_MAP_DEFAULT_ZOOM);
                map.attributionControl.setPrefix('');

                mapInstance.current = map;
                pointsLayerRef.current = Leaflet.layerGroup().addTo(map);
                routeLayerRef.current = Leaflet.layerGroup().addTo(map);

                requestAnimationFrame(() => map.invalidateSize());
                setMapNotice('');
            } catch (error) {
                console.error('Directions map initialization failed:', error);
                setMapNotice('Map loading issue. Please refresh the page.');
            }

            return () => {
                if (mapInstance.current) {
                    mapInstance.current.remove();
                    mapInstance.current = null;
                }
                tileLayerRef.current = null;
                campusLayerRef.current = null;
                pointsLayerRef.current = null;
                routeLayerRef.current = null;
            };
        }, [rental]);

        useEffect(() => {
            const map = mapInstance.current;
            const Leaflet = window.L;
            if (!map || !Leaflet || !routeSummary || !rental) return;

            const theme = getLeafletTheme('default');

            if (tileLayerRef.current) {
                map.removeLayer(tileLayerRef.current);
            }
            tileLayerRef.current = Leaflet.tileLayer(theme.url, theme.options).addTo(map);

            if (campusLayerRef.current) {
                map.removeLayer(campusLayerRef.current);
            }
            campusLayerRef.current = createLeafletCampusOverlay(Leaflet, 'default').addTo(map);

            if (!pointsLayerRef.current) {
                pointsLayerRef.current = Leaflet.layerGroup().addTo(map);
            }
            pointsLayerRef.current.clearLayers();

            addLeafletFocusZone(Leaflet, pointsLayerRef.current, originCoords, 'blue', 18);
            Leaflet.marker(toLeafletLatLng(originCoords), {
                icon: createLeafletPulseIcon(Leaflet, 'live'),
                keyboard: false
            }).addTo(pointsLayerRef.current);

            addLeafletFocusZone(Leaflet, pointsLayerRef.current, destinationCoords, 'red', 24);
            Leaflet.marker(toLeafletLatLng(destinationCoords), {
                icon: createLeafletPulseIcon(Leaflet, 'destination'),
                keyboard: false
            }).addTo(pointsLayerRef.current);
            Leaflet.marker(toLeafletLatLng(destinationCoords), {
                icon: createLeafletChipIcon(Leaflet, 'Safe Zone', 'red'),
                keyboard: false,
                interactive: false
            }).addTo(pointsLayerRef.current);

            if (!routeLayerRef.current) {
                routeLayerRef.current = Leaflet.layerGroup().addTo(map);
            }
            routeLayerRef.current.clearLayers();
            addLeafletRouteLayer(Leaflet, routeLayerRef.current, routeSummary.points, { showArrows: true });

            map.fitBounds(Leaflet.latLngBounds(toLeafletPath(routeSummary.points)), {
                paddingTopLeft: [40, 120],
                paddingBottomRight: [40, 240],
                animate: true,
                maxZoom: CAMPUS_MAP_FIT_MAX_ZOOM
            });

            requestAnimationFrame(() => map.invalidateSize());
        }, [rental, originCoords[0], originCoords[1], destinationCoords[0], destinationCoords[1]]);

        return (
            <div className="flex-1 min-h-0 flex flex-col relative z-[100]">
                <header className="absolute top-0 left-0 right-0 pt-12 pb-4 px-6 z-50 blur-header flex items-center justify-between">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-900 active:scale-90 transition-transform"><i className="ph ph-arrow-left text-lg"></i></button>
                    <div className="bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-2"><i className="ph-fill ph-navigation-arrow text-brand-600"></i><span className="text-xs font-bold text-slate-900">Live Route</span></div>
                    <div className="w-10"></div>
                </header>
                <div className="flex-1 w-full relative">
                    <div id="map-container" ref={mapRef} className="w-full h-full"></div>
                    <div className="map-ui-stack above-sheet">
                        <button type="button" onClick={() => handleDirectionsZoom(CAMPUS_MAP_ZOOM_STEP)} className="map-ui-btn active:scale-90 transition-transform">
                            <i className="ph ph-plus text-lg"></i>
                        </button>
                        <button type="button" onClick={() => handleDirectionsZoom(-CAMPUS_MAP_ZOOM_STEP)} className="map-ui-btn active:scale-90 transition-transform">
                            <i className="ph ph-minus text-lg"></i>
                        </button>
                        <button type="button" onClick={handleFitRoute} className="map-ui-btn wide active:scale-95 transition-transform">
                            <i className="ph ph-navigation-arrow text-base"></i>
                            <span>Route</span>
                        </button>
                    </div>
                    <div className="map-ui-hint above-sheet">Pinch to zoom and drag the route</div>
                    {mapNotice && (
                        <div className="absolute top-20 left-4 right-4 z-[60] bg-white/95 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-semibold text-slate-600 shadow-sm">
                            {mapNotice}
                        </div>
                    )}
                    {showMapFallback && (
                        <div className="absolute inset-0 bg-slate-50 flex items-center justify-center p-6">
                            <div className="text-center max-w-sm">
                                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i className="ph ph-navigation-arrow text-2xl text-slate-500"></i>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-2">Directions Unavailable</h3>
                                <p className="text-sm text-slate-600 mb-4">The interactive map couldn't load. You can still proceed to the location.</p>
                                <div className="bg-white rounded-lg p-3 text-left">
                                    <p className="text-xs font-semibold text-slate-700 mb-2">Location Details:</p>
                                    <div className="text-xs text-slate-600 space-y-1">
                                        <div>• Destination: {rental.location}</div>
                                        <div>• Item: {rental.name}</div>
                                        <div>• Owner: {rental.owner.name}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 glass-panel border-t border-slate-200 z-50 pb-8 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-black text-slate-900 text-lg leading-none">{rental.location} Safe Zone</h3>
                            <p className="text-xs font-medium text-slate-500 mt-1">{routeSummary?.etaLabel || '2 mins'} walk ({routeSummary?.distanceLabel || '150m'})</p>
                        </div>
                        <img src={rental.images[0]} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-200" />
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Coordinates</p>
                        <p className="text-xs font-semibold text-slate-700">Start {formatCoordinatePair(originCoords)}</p>
                        <p className="text-xs font-semibold text-slate-700 mt-1">Destination {formatCoordinatePair(destinationCoords)}</p>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded text-[10px] leading-relaxed text-blue-900 font-medium"><i className="ph-fill ph-info mr-1"></i> Meet at the safe zone. Contact owner on arrival.</div>
                    <button onClick={() => { alert('✓ Arrived confirmed - Proceed to handoff'); onBack(); }} className="w-full bg-brand-900 text-white font-black py-4 rounded-xl shadow-float hover:bg-brand-950 transition-all active:scale-95">Arrived at Location</button>
                </div>
            </div>
        );
    };

    const HandoffFlow = ({ rental, onSuccess, onCancel, isReturn }) => {
        const [step, setStep] = useState(0);
        const [proofImage, setProofImage] = useState('');
        const [proofName, setProofName] = useState('');
        const [proofNotes, setProofNotes] = useState('');
        const [submitting, setSubmitting] = useState(false);
        const [checklist, setChecklist] = useState(() => ({
            bodyChecked: false,
            accessoriesChecked: false,
            powerTested: false
        }));
        const uploadRef = useRef(null);
        const checklistItems = [
            { key: 'bodyChecked', label: 'Body and ports inspected' },
            { key: 'accessoriesChecked', label: 'Accessories counted' },
            { key: 'powerTested', label: isReturn ? 'Return condition confirmed' : 'Power-on test confirmed' }
        ];

        useEffect(() => {
            if (step === 0) {
                const timer = setTimeout(() => setStep(1), 1800);
                return () => clearTimeout(timer);
            }
        }, [step]);

        const handleSelectProof = async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
                const preview = await readImageFileAsPreview(file);
                setProofImage(preview);
                setProofName(file.name);
            } catch (error) {
                console.warn('Failed to read proof image', error);
            }
            event.target.value = '';
        };

        const completeProof = () => {
            const proof = {
                id: `proof_${Date.now()}`,
                kind: isReturn ? 'return' : 'pickup',
                timestamp: Date.now(),
                readableTime: formatDateTimeLabel(Date.now()),
                photo: proofImage || rental?.images?.[0] || '',
                photoName: proofName || 'Listing preview',
                notes: proofNotes.trim() || (isReturn ? 'Return completed with documented condition.' : 'Pickup verified at campus safe zone.'),
                checklist: checklistItems.filter((item) => checklist[item.key]).map((item) => item.label),
                meetupZone: getMeetupZone(rental)
            };
            setSubmitting(true);
            setStep(2);
            setTimeout(() => onSuccess(rental, proof), 1200);
        };

        return (
            <div className="flex-1 bg-slate-900 flex flex-col relative z-[100]">
                <header className="px-6 pt-12 pb-4 flex items-center justify-between z-10"><button onClick={onCancel} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur hover:bg-white/20 transition-colors"><i className="ph ph-x text-lg"></i></button><span className="text-white text-xs font-bold uppercase tracking-widest">{isReturn ? "Return Item" : "Scan Owner's QR"}</span><div className="w-10"></div></header>
                <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center opacity-30 blur-md"></div><div className="absolute inset-0 bg-black/60"></div>

                    {step === 0 && <> <div className="qr-viewfinder z-10"><div className="scanner-line"></div></div><p className="text-white font-medium text-sm mt-40 z-10">{isReturn ? "Verifying Return Code..." : "Align QR code within frame"}</p> </>}

                    {step === 1 && (
                        <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="z-10 w-full px-6">
                            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/15 p-5">
                                <h2 className="text-2xl font-black text-white mb-2">{isReturn ? 'Return Proof' : 'Pickup Proof'}</h2>
                                <p className="text-slate-300 text-sm mb-5">Upload a quick condition photo, mark the checklist, and log meetup notes for claims and trust scoring.</p>

                                <input ref={uploadRef} type="file" accept="image/*" onChange={handleSelectProof} className="hidden" />
                                <button type="button" onClick={() => uploadRef.current?.click()} className="w-full h-48 bg-black/40 border-2 border-dashed border-slate-400 rounded-3xl flex items-center justify-center mb-4 overflow-hidden">
                                    {proofImage ? <img src={proofImage} className="w-full h-full object-cover" /> : <div className="text-center"><i className="ph-fill ph-camera text-5xl text-slate-300"></i><p className="text-xs font-black uppercase tracking-widest text-slate-300 mt-3">Upload proof photo</p></div>}
                                </button>

                                <div className="space-y-2 mb-4">
                                    {checklistItems.map((item) => (
                                        <button key={item.key} type="button" onClick={() => setChecklist((prev) => ({ ...prev, [item.key]: !prev[item.key] }))} className={`w-full rounded-2xl px-4 py-3 text-left border transition-all ${checklist[item.key] ? 'bg-green-50/95 border-green-300 text-green-900' : 'bg-white/5 border-white/10 text-slate-200'}`}>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-sm font-bold">{item.label}</span>
                                                <i className={`ph ${checklist[item.key] ? 'ph-check-circle text-green-600' : 'ph-circle text-slate-400'} text-lg`}></i>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <textarea value={proofNotes} onChange={(event) => setProofNotes(event.target.value)} rows="3" placeholder="Add meetup notes, visible defects, or accessory reminders..." className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white placeholder:text-slate-400 outline-none resize-none focus:ring-2 focus:ring-brand-400"></textarea>
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <button type="button" onClick={() => { setProofImage(rental?.images?.[0] || ''); setProofName('Listing preview'); }} className="w-full bg-white/10 text-white font-black py-3 rounded-xl border border-white/10 text-xs uppercase tracking-widest">Use Preview</button>
                                    <button type="button" onClick={completeProof} disabled={!Object.values(checklist).some(Boolean)} className={`w-full font-black py-3 rounded-xl text-xs uppercase tracking-widest ${Object.values(checklist).some(Boolean) ? 'bg-brand-accent text-brand-950 shadow-accent' : 'bg-white/10 text-slate-400 cursor-not-allowed'}`}>Log Proof</button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} className="z-10 text-center bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20">
                            <i className="ph-fill ph-check-circle text-brand-accent text-6xl mb-3"></i>
                            <h2 className="text-2xl font-black text-white mb-2">{isReturn ? "Return Completed!" : "Handoff Verified!"}</h2>
                            <p className="text-slate-300 text-sm font-medium">{isReturn ? "Deposit release and late-fee review are being finalized." : `Pickup proof is logged and escrow is ready for ${rental.owner.name}.`}</p>
                            {submitting && <p className="text-[10px] font-black uppercase tracking-widest text-brand-100 mt-4">Saving proof record...</p>}
                        </motion.div>
                    )}
                </div>
            </div>
        );
    };

    const ChatView = ({ thread, onBack, onSyncThread }) => {
        const partner = thread?.owner;
        const item = thread?.item;
        const meetupZone = thread?.meetupZone || getMeetupZone(item);
        const scheduleSummary = thread?.schedule ? `${thread.schedule.dateLabel} • ${thread.schedule.slotLabel}` : 'Schedule to confirm';
        const proofCount = Array.isArray(item?.handoffProofs) ? item.handoffProofs.length : 0;
        const [msg, setMsg] = useState('');
        const [isTyping, setIsTyping] = useState(false);
        const [pendingPhoto, setPendingPhoto] = useState('');
        const [pendingPhotoName, setPendingPhotoName] = useState('');
        const [showCallTools, setShowCallTools] = useState(false);
        const [showRentalInfo, setShowRentalInfo] = useState(false);
        const [activePhoto, setActivePhoto] = useState('');
        const [chat, setChat] = useState(() => thread?.messages || createDefaultChatMessages(item));
        const messagesEndRef = useRef(null);
        const photoInputRef = useRef(null);

        const quickActions = [
            {
                id: 'eta',
                label: 'ETA 5 mins',
                outgoing: `I'm 5 minutes away from the ${meetupZone}.`,
                reply: { text: `Noted. I'll wait by the ${meetupZone} entrance.` }
            },
            {
                id: 'arrived',
                label: 'At Safe Zone',
                outgoing: `I'm already at the ${meetupZone}.`,
                reply: {
                    text: 'Perfect. I am heading there now.',
                    card: {
                        title: 'Arrival Checklist',
                        rows: [
                            { label: 'Bring', value: 'Student ID + phone' },
                            { label: 'Proof', value: 'Capture handoff photo' },
                            { label: 'Next', value: 'Confirm item condition' }
                        ],
                        note: 'Both sides should inspect the item before completing pickup.'
                    }
                }
            },
            {
                id: 'extension',
                label: 'Need Extension',
                outgoing: 'Can I extend this rental by one more day if needed?',
                reply: { text: 'Possible if there is no next booking. Please confirm before 6:00 PM so I can lock the schedule.' }
            },
            {
                id: 'confirm-slot',
                label: 'Confirm Slot',
                outgoing: `Confirming our meetup for ${scheduleSummary}.`,
                reply: {
                    text: 'Confirmed. I will keep that schedule locked in the app.',
                    card: buildScheduleCard(thread?.schedule, item)
                }
            },
            {
                id: 'reschedule',
                label: 'Move 30 mins',
                outgoing: 'Can we move the meetup 30 minutes later and keep the same safe zone?',
                reply: { text: 'That should work. Please keep the same safe zone so the handoff record stays clean.' }
            },
            {
                id: 'condition',
                label: 'Request Photo',
                outgoing: 'Can you send a fresh condition photo before meetup?',
                reply: {
                    text: 'Sure. Sending a fresh proof photo before I leave.',
                    card: {
                        title: 'Photo Request Logged',
                        rows: [
                            { label: 'Purpose', value: 'Pre-meetup proof' },
                            { label: 'Best angle', value: 'Front, sides, included accessories' },
                            { label: 'Use', value: 'Handoff comparison' }
                        ],
                        note: 'Keep photo evidence in this chat for claims and dispute review.'
                    }
                }
            }
        ];

        const composerShortcuts = [
            { id: 'confirm', label: 'Confirm Spot', text: `Can you confirm the exact meetup point at the ${meetupZone}?` },
            { id: 'id', label: 'Bring ID', text: 'I will bring my student ID and phone for the handoff.' },
            { id: 'return', label: 'Return Plan', text: 'Let us confirm the return time before the rental ends.' }
        ];

        const callActions = [
            {
                id: 'call-now',
                label: 'Request quick call',
                note: 'Ask for a short confirmation call now.',
                outgoing: 'Can we hop on a quick call to confirm the meetup?',
                reply: { text: 'Yes. I can do a quick two-minute call now.' }
            },
            {
                id: 'call-later',
                label: 'Call after class',
                note: 'Let them know you will ring after class.',
                outgoing: 'I will call after class around 4:30 PM if that works for you.',
                reply: { text: 'That works. Send a message first before you ring.' }
            },
            {
                id: 'text-only',
                label: 'Stay on chat',
                note: 'Keep everything documented here instead.',
                outgoing: 'Let us keep updates here in chat so everything stays documented.',
                reply: { text: 'Agreed. Chat is better for meetup and claim records.' }
            }
        ];

        useEffect(() => {
            setChat(thread?.messages || createDefaultChatMessages(item));
            setShowCallTools(false);
            setShowRentalInfo(false);
            setPendingPhoto('');
            setPendingPhotoName('');
        }, [thread?.id]);

        useEffect(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, [chat, isTyping, pendingPhoto]);

        useEffect(() => {
            if (!thread?.id) return;
            const lastMessage = chat[chat.length - 1];
            onSyncThread(thread.id, {
                messages: chat,
                lastMsg: getChatPreviewText(lastMessage),
                time: lastMessage?.time || thread.time || 'Just now',
                unread: 0
            });
        }, [chat, thread?.id]);

        const pushChat = (payload) => {
            setChat(prev => [...prev, { time: 'Just now', status: payload.type === 'sent' ? 'Delivered' : undefined, ...payload }]);
        };

        const scheduleReply = (payload, delay = 1000) => {
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
                setChat(prev => {
                    const next = [...prev];
                    for (let i = next.length - 1; i >= 0; i -= 1) {
                        if (next[i].type === 'sent') {
                            next[i] = { ...next[i], status: 'Seen' };
                            break;
                        }
                    }
                    return [...next, { time: 'Just now', type: 'received', ...payload }];
                });
            }, delay);
        };

        const runConversationAction = (action) => {
            const outgoing = action.outgoing || '';
            const reply = action.reply || null;
            pushChat({ text: outgoing, type: 'sent' });

            // if this is a call action, attempt to initiate a phone call
            if (action.id === 'call-now') {
                // try partner phone first
                const phoneNumber = partner?.phone || partner?.phoneNumber || partner?.mobile;
                if (phoneNumber) {
                    try {
                        // open device dialer
                        window.location.href = `tel:${phoneNumber}`;
                    } catch (e) {
                        console.warn('Failed to open dialer', e);
                    }
                } else {
                    // fallback: log message in chat
                    pushChat({ text: 'No phone number is available for this user.', type: 'received' });
                }
            }

            // schedule simulated reply and mark sent message seen
            if (reply) scheduleReply(reply);
            setShowCallTools(false);
            setShowRentalInfo(false);
        };

        const handleSelectPhoto = (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
                setPendingPhoto(reader.result);
                setPendingPhotoName(file.name);
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        };

        const send = (e) => {
            e.preventDefault();
            const text = msg.trim();
            const image = pendingPhoto;
            if (!text && !image) return;

            pushChat({ text, image, type: 'sent' });
            setMsg('');
            setPendingPhoto('');
            setPendingPhotoName('');
            scheduleReply(image ? {
                text: 'Photo received. Condition looks clear from this angle.',
                card: {
                    title: 'Photo Review',
                    rows: [
                        { label: 'Status', value: 'Logged in thread' },
                        { label: 'Use', value: 'Pickup and return comparison' },
                        { label: 'Meetup', value: meetupZone }
                    ],
                    note: 'You can send more angles here if you want a complete condition record.'
                }
            } : {
                text: 'Got it. I saved that update in our meetup thread.'
            });
        };

        if (!thread) {
            return (
                <div className="flex-1 min-h-0 flex flex-col bg-slate-50 relative z-[100]">
                    <header className="absolute top-0 left-0 right-0 pt-12 pb-3 px-4 z-50 blur-header flex items-center gap-3 border-b border-slate-200/50 shrink-0">
                        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-900 active:scale-90 transition-transform"><i className="ph ph-arrow-left text-lg"></i></button>
                        <h3 className="font-bold text-sm text-slate-900">Messages</h3>
                    </header>
                    <div className="flex-1 flex items-center justify-center p-6 text-center">
                        <div>
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <i className="ph ph-chat-circle text-2xl text-slate-500"></i>
                            </div>
                            <p className="text-sm font-bold text-slate-900 mb-1">No active thread</p>
                            <p className="text-xs font-medium text-slate-500">Open a message from the inbox or rental activity.</p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex-1 min-h-0 flex flex-col bg-gradient-to-b from-slate-50 to-white relative z-[100]">
                <header className="absolute top-0 left-0 right-0 pt-12 pb-3 px-4 z-50 blur-header flex items-center gap-3 border-b border-slate-200/50 shrink-0">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-900 active:scale-90 transition-transform"><i className="ph ph-arrow-left text-lg"></i></button>
                    <div className="relative">
                        <img src={partner?.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm leading-none text-slate-900 truncate">{partner?.name || 'Owner'}</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{thread.status || 'Active now'}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { setShowCallTools(prev => !prev); setShowRentalInfo(false); }} className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"><i className="ph ph-phone text-lg"></i></button>
                        <button onClick={() => { setShowRentalInfo(prev => !prev); setShowCallTools(false); }} className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"><i className="ph ph-info text-lg"></i></button>
                    </div>
                </header>
                <div className="flex-1 min-h-0 overflow-y-auto p-4 pt-28 flex flex-col gap-3 custom-scroll">
                    {item && (
                        <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="chat-surface-card p-3 rounded-2xl flex gap-3 items-center shrink-0 shadow-sm mx-auto w-max mb-1">
                            <img src={item.images[0]} className="w-10 h-10 rounded-lg object-cover border border-brand-100" />
                            <div className="pr-3">
                                <p className="text-xs font-bold text-slate-900">{item.name}</p>
                                <p className="text-[9px] text-brand-600 font-bold uppercase tracking-widest mt-0.5">Thread linked to active rental</p>
                            </div>
                        </motion.div>
                    )}

                    <div className="campus-fact-card rounded-2xl p-3 mb-1">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-700">Thread Overview</p>
                                <p className="text-xs font-medium text-slate-600 mt-1">Use this thread for meetup timing, condition proof, call requests, and extension approvals.</p>
                            </div>
                            <span className="campus-chip soft"><i className="ph ph-camera text-sm normal-case"></i>Documented</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                            <div className="chat-inline-card rounded-xl p-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-1">Status</p>
                                <p className="text-xs font-bold text-slate-900 leading-relaxed">{thread.status}</p>
                            </div>
                            <div className="chat-inline-card rounded-xl p-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-1">Meetup</p>
                                <p className="text-xs font-bold text-slate-900 leading-relaxed">{meetupZone}</p>
                            </div>
                            <div className="chat-inline-card rounded-xl p-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-1">Protection</p>
                                <p className="text-xs font-bold text-slate-900 leading-relaxed">{thread.protectionLabel}</p>
                            </div>
                            <div className="chat-inline-card rounded-xl p-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-1">Schedule</p>
                                <p className="text-xs font-bold text-slate-900 leading-relaxed">{scheduleSummary}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 shrink-0">
                        {quickActions.map(action => (
                            <button key={action.id} type="button" onClick={() => runConversationAction(action)} className="chat-action-btn rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap shrink-0">
                                {action.label}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence>
                        {showCallTools && (
                            <motion.div initial={{opacity:0, y:-8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-8}} className="chat-surface-card rounded-2xl p-4 mb-1">
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-700">Call Options</p>
                                        <p className="text-xs font-medium text-slate-500 mt-1">These actions keep the call request documented in the thread.</p>
                                    </div>
                                    <button type="button" onClick={() => setShowCallTools(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><i className="ph ph-x text-lg"></i></button>
                                </div>
                                <div className="space-y-2">
                                    {callActions.map(action => (
                                        <button key={action.id} type="button" onClick={() => runConversationAction(action)} className="w-full text-left chat-action-btn rounded-xl px-3 py-3">
                                            <p className="text-xs font-black text-slate-900">{action.label}</p>
                                            <p className="text-[11px] chat-meta-text mt-1">{action.note}</p>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {showRentalInfo && (
                            <motion.div initial={{opacity:0, y:-8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-8}} className="chat-surface-card rounded-2xl p-4 mb-1">
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-700">Rental Info</p>
                                        <p className="text-sm font-bold text-slate-900 mt-1">{item?.name || 'Current rental'}</p>
                                    </div>
                                    <button type="button" onClick={() => setShowRentalInfo(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><i className="ph ph-x text-lg"></i></button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {[
                                        { label: 'Meetup', value: meetupZone },
                                        { label: 'Escrow', value: 'Secured' },
                                        { label: 'Pickup', value: 'Photo check required' },
                                        { label: 'Protection', value: item?.insured ? 'Lendora Guard' : 'Standard' },
                                        { label: 'Schedule', value: scheduleSummary },
                                        { label: 'Proofs', value: `${proofCount} logged` }
                                    ].map((row, idx) => (
                                        <div key={idx} className="chat-inline-card rounded-xl p-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-1">{row.label}</p>
                                            <p className="text-xs font-bold text-slate-900 leading-relaxed">{row.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <button type="button" onClick={() => runConversationAction({ outgoing: `Can you confirm the exact meetup point at the ${meetupZone}?`, reply: { text: `Confirmed. Meet me at the ${meetupZone} beside the main entrance.` } })} className="w-full chat-action-btn rounded-xl px-3 py-3 text-left">
                                        <p className="text-xs font-black text-slate-900">Send meetup plan request</p>
                                        <p className="text-[11px] chat-meta-text mt-1">Ask for the exact handoff spot and arrival instructions.</p>
                                    </button>
                                    <button type="button" onClick={() => runConversationAction({ outgoing: 'Can you break down the protection coverage for this rental?', reply: { text: 'Yes. Escrow stays held until handoff, and Lendora Guard only applies to approved accidental damage.', card: { title: 'Protection Summary', rows: [ { label: 'Escrow', value: 'Held until verified handoff' }, { label: 'Guard', value: item?.insured ? 'Active for this rental' : 'Not enabled' }, { label: 'Claims', value: 'File within 48 hours' } ], note: 'Coverage does not include normal wear, missing consumables, or undocumented issues.' } } })} className="w-full chat-action-btn rounded-xl px-3 py-3 text-left">
                                        <p className="text-xs font-black text-slate-900">Send protection details</p>
                                        <p className="text-[11px] chat-meta-text mt-1">Keep the exact coverage notes recorded in the thread.</p>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mx-auto px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Thread secured for meetup records
                    </div>

                    <AnimatePresence>
                        {chat.map((c, i) => (
                            <motion.div key={i} initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} className={`flex ${c.type==='sent' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 max-w-[78%] rounded-2xl shadow-sm ${c.type==='sent' ? 'bg-brand-900 text-white rounded-br-none' : 'chat-bubble-received rounded-bl-none'}`}>
                                    {c.image && <button type="button" onClick={() => setActivePhoto(c.image)} className="block"><img src={c.image} className="w-full max-w-[220px] rounded-xl object-cover mb-2 border border-white/10" /></button>}
                                    {c.text && <p className="text-sm font-medium break-words">{c.text}</p>}
                                    {c.card && (
                                        <div className={`chat-inline-card rounded-xl p-3 ${c.text ? 'mt-2' : ''}`}>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-2">{c.card.title}</p>
                                            <div className="space-y-1.5">
                                                {c.card.rows.map((row, idx) => (
                                                    <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
                                                        <span className="chat-meta-text font-semibold">{row.label}</span>
                                                        <span className="font-bold text-slate-900 text-right">{row.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {c.card.note && <p className="chat-meta-text text-[11px] leading-relaxed mt-2">{c.card.note}</p>}
                                        </div>
                                    )}
                                    <p className={`text-[11px] mt-1 ${c.type==='sent' ? 'text-brand-100' : 'chat-meta-text'}`}>{c.time}{c.type === 'sent' && c.status ? ` • ${c.status}` : ''}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isTyping && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex justify-start">
                            <div className="chat-bubble-received rounded-2xl rounded-bl-none p-3 flex gap-1 items-center">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 glass-panel border-t border-slate-200 pb-8 shrink-0 chat-input-shell">
                    <input ref={photoInputRef} type="file" accept="image/*" onChange={handleSelectPhoto} className="hidden" />
                    {pendingPhoto && (
                        <div className="mb-3 chat-surface-card rounded-2xl p-2.5 flex items-center gap-3">
                            <img src={pendingPhoto} className="w-14 h-14 rounded-xl object-cover border border-slate-200" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black uppercase tracking-widest text-brand-700">Photo Ready</p>
                                <p className="text-xs font-medium text-slate-500 truncate">{pendingPhotoName || 'Image selected'}</p>
                            </div>
                            <button type="button" onClick={() => { setPendingPhoto(''); setPendingPhotoName(''); }} className="chat-icon-btn w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center active:scale-90">
                                <i className="ph ph-x text-lg"></i>
                            </button>
                        </div>
                    )}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
                        {composerShortcuts.map(shortcut => (
                            <button key={shortcut.id} type="button" onClick={() => setMsg(shortcut.text)} className="chat-action-btn rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap shrink-0">
                                {shortcut.label}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={send} className="flex gap-2">
                        <button type="button" onClick={() => photoInputRef.current?.click()} className="chat-icon-btn w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0"><i className="ph ph-image-square text-lg"></i></button>
                        <input value={msg} onChange={e=>setMsg(e.target.value)} type="text" placeholder="Type a message..." className="chat-input-field flex-1 min-h-0 bg-white border border-slate-200 rounded-full px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-sm text-slate-900" />
                        <button type="submit" className="w-11 h-11 rounded-full bg-brand-900 hover:bg-brand-800 text-white flex items-center justify-center shrink-0 transition-colors shadow-md active:scale-90"><i className="ph-bold ph-paper-plane-right text-lg"></i></button>
                    </form>
                </div>

                <AnimatePresence>
                    {activePhoto && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setActivePhoto('')} className="fixed inset-0 bg-black/80 z-[140] flex items-center justify-center p-6">
                            <motion.img initial={{scale:0.92}} animate={{scale:1}} exit={{scale:0.92}} src={activePhoto} onClick={(e) => e.stopPropagation()} className="max-w-full max-h-full rounded-3xl object-contain shadow-2xl" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const ActivityView = ({ rentals, onChat, onClaim, onScan, onReturn, onDirections, onReview, onExtend, onReportNoShow, onBack }) => {
        const [filter, setFilter] = useState('all');
        const filtered = filter === 'all'
            ? rentals
            : filter === 'Completed'
                ? rentals.filter(r => r.status === 'Completed' || r.status === 'No-Show')
                : rentals.filter(r => r.status === filter);
        const pendingCount = rentals.filter(r => r.status === 'Authorized').length;
        const activeCount = rentals.filter(r => r.status === 'Active').length;
        const completedCount = rentals.filter(r => r.status === 'Completed' || r.status === 'No-Show').length;
        return (
            <div className="flex-1 min-h-0 flex flex-col bg-slate-50">
                <header className="px-6 pt-14 pb-4 bg-white border-b border-slate-100 shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Rental Activity</h1>
                            <p className="text-xs font-medium text-slate-500 mt-1">Track pending, active, and completed rentals here.</p>
                        </div>
                        {onBack && (
                            <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 active:scale-90 transition-transform"><i className="ph ph-arrow-left text-lg"></i></button>
                        )}
                    </div>
                </header>
                <div className="px-6 pt-4 pb-2 flex gap-2 overflow-x-auto shrink-0"><button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${filter==='all'?'bg-brand-900 text-white shadow-md':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>All</button><button onClick={() => setFilter('Authorized')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${filter==='Authorized'?'bg-brand-500 text-white shadow-md':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Pending</button><button onClick={() => setFilter('Active')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${filter==='Active'?'bg-green-600 text-white shadow-md':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Active</button><button onClick={() => setFilter('Completed')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${filter==='Completed'?'bg-slate-600 text-white shadow-md':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Completed</button></div>
                <div className="flex-1 min-h-0 overflow-y-auto custom-scroll px-6 pb-28 pt-4 space-y-4">
                    <div className="campus-hero rounded-[24px] p-4">
                        <div className="relative z-10 grid grid-cols-3 gap-2">
                            <div className="campus-mini-stat rounded-2xl p-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-100/80">Pending</p>
                                <p className="text-lg font-black mt-1">{pendingCount}</p>
                                <p className="text-[10px] text-blue-100/80">awaiting meetup</p>
                            </div>
                            <div className="campus-mini-stat rounded-2xl p-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-100/80">Active</p>
                                <p className="text-lg font-black mt-1">{activeCount}</p>
                                <p className="text-[10px] text-blue-100/80">currently borrowed</p>
                            </div>
                            <div className="campus-mini-stat rounded-2xl p-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-100/80">Done</p>
                                <p className="text-lg font-black mt-1">{completedCount}</p>
                                <p className="text-[10px] text-blue-100/80">completed rentals</p>
                            </div>
                        </div>
                    </div>
                    {filtered.length === 0 ? <p className="text-center text-slate-400 py-10 font-medium">No {filter !== 'all' ? filter.toLowerCase() : ''} rentals.</p> : filtered.map((r, i) => (
                        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:i*0.05}} key={r.id} className={`premium-card p-5 rounded-2xl transition-all ${r.status === 'Active' ? 'ring-2 ring-green-500/20' : ''}`}>
                            {(() => {
                                const bookingWindow = getRentalWindow(r);
                                const proofCount = Array.isArray(r.handoffProofs) ? r.handoffProofs.length : 0;
                                const lateFeePreview = r.status === 'Active' ? getLateFeeEstimate(r) : 0;
                                return (
                                    <>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4">
                                    <img src={r.images[0]} className="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-sm" />
                                    <div>
                                        <p className="font-black text-sm text-slate-900 leading-tight mb-1">{r.name}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{bookingWindow ? bookingWindow.summary : `${r.dur} ${r.type}`} • {r.owner?.name || r.lender?.name || 'Owner'}</p>
                                        <div className="flex items-center gap-3">
                                            <p className="text-[9px] font-medium text-slate-400">{r.date}</p>
                                            {r.status === 'Active' && r.endTime && <Countdown endTime={r.endTime} />}
                                        </div>
                                    </div>
                                </div>
                                {r.status === 'Authorized' && <span className="bg-brand-50 border border-brand-300 text-brand-700 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest">⏳ Awaiting Handoff</span>}
                                {r.status === 'Active' && <span className="bg-green-50 border border-green-300 text-green-700 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1"><i className="ph-bold ph-spinner animate-spin"></i> Active</span>}
                                {r.status === 'Completed' && <span className="bg-slate-100 border border-slate-300 text-slate-600 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest">✓ Completed</span>}
                                {r.status === 'No-Show' && <span className="bg-red-50 border border-red-300 text-red-700 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest">No-show logged</span>}
                            </div>
                            {(() => {
                                const progress = getRentalProgressMeta(r.status);
                                return (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{progress.label}</p>
                                            <p className="text-[10px] font-bold text-brand-700">{progress.progress}%</p>
                                        </div>
                                        <div className="campus-progress-track"><div className="campus-progress-fill" style={{width: `${progress.progress}%`}}></div></div>
                                        <p className="text-xs font-medium text-slate-500 mt-2">{progress.note}</p>
                                    </div>
                                );
                            })()}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="chat-inline-card rounded-xl p-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-1">Meetup</p>
                                    <p className="text-xs font-bold text-slate-900 leading-relaxed">{bookingWindow ? `${bookingWindow.dateLabel}` : 'Flexible'}</p>
                                </div>
                                <div className="chat-inline-card rounded-xl p-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-1">Deposit</p>
                                    <p className="text-xs font-bold text-slate-900 leading-relaxed">₱{Number(r.depositHold || 0).toLocaleString()}</p>
                                </div>
                                <div className="chat-inline-card rounded-xl p-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-1">Proofs</p>
                                    <p className="text-xs font-bold text-slate-900 leading-relaxed">{proofCount} logged</p>
                                </div>
                            </div>
                            {lateFeePreview > 0 && (
                                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Late Fee Running</p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">₱{lateFeePreview.toLocaleString()} so far</p>
                                </div>
                            )}
                                    {r.status !== 'Completed' && r.status !== 'No-Show' && (
                                        <div className="flex gap-2 mb-3">
                                            <button onClick={() => onDirections(r)} className="flex-1 bg-brand-50 text-brand-700 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border border-brand-200 flex items-center justify-center gap-1 hover:bg-brand-100 active:scale-95"><i className="ph-bold ph-navigation-arrow"></i> Map</button>
                                            <button onClick={() => onChat(r)} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border border-slate-200 flex items-center justify-center gap-1 hover:bg-slate-200 active:scale-95"><i className="ph-bold ph-chat-circle"></i> Chat</button>
                                            <button onClick={() => onClaim(r)} className="flex-1 bg-amber-50 text-amber-700 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border border-amber-200 flex items-center justify-center gap-1 hover:bg-amber-100 active:scale-95"><i className="ph-bold ph-shield"></i> Claim</button>
                                        </div>
                                    )}
                            {r.status !== 'Completed' && r.status !== 'No-Show' && (
                                <div className="flex gap-2">
                                    {r.status === 'Authorized' ? <button onClick={() => onScan(r, false)} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg text-xs font-black uppercase tracking-widest shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"><i className="ph ph-qr-code text-base"></i> Start</button> : <button onClick={() => onReturn(r)} className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-lg text-xs font-black uppercase tracking-widest shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"><i className="ph-fill ph-arrow-u-right-from-bracket"></i> Return</button>}
                                </div>
                            )}
                            {/* Small extend control */}
                            {r.status === 'Active' && (
                                <div className="mt-3">
                                    <button onClick={() => onExtend(r)} className="w-full bg-white border border-slate-200 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50">Extend rental</button>
                                </div>
                            )}
                            {r.status === 'Authorized' && (
                                <div className="mt-3">
                                    <button onClick={() => onReportNoShow(r)} className="w-full bg-red-50 border border-red-200 py-2 rounded-lg text-sm font-bold text-red-700 hover:bg-red-100">Report no-show</button>
                                </div>
                            )}
                            {r.status === 'Completed' && (
                                <button onClick={() => onReview(r)} className="w-full bg-gradient-to-r from-brand-500 to-brand-700 text-white py-3 rounded-lg text-xs font-black uppercase tracking-widest shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"><i className="ph ph-star text-base"></i> Leave Review</button>
                            )}
                                    </>
                                );
                            })()}
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    };

    const SavedView = ({ saved, savedSearches, items, onSelect, onRemoveSearch }) => {
        const [search, setSearch] = useState('');
        const filtered = saved.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
        const watchlist = savedSearches.map((searchConfig) => ({
            ...searchConfig,
            matches: items.filter((item) => doesSavedSearchMatchItem(searchConfig, item))
        }));
        return (
            <div className="flex-1 min-h-0 flex flex-col bg-slate-50">
                <header className="px-6 pt-14 pb-4 bg-white border-b border-slate-100 shrink-0"><h1 className="text-3xl font-black text-slate-900 tracking-tight">Saved</h1><div className="mt-4 flex gap-2"><input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search saves..." className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500" /><button onClick={() => setSearch('')} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${search ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-400'}`}><i className="ph ph-x text-lg"></i></button></div></header>
                <div className="flex-1 min-h-0 overflow-y-auto custom-scroll px-6 pb-28 pt-4">
                    <div className="space-y-3 mb-5">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Saved Searches</h2>
                        {watchlist.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-slate-300 px-4 py-5">
                                <p className="text-sm font-bold text-slate-900">No saved searches yet.</p>
                                <p className="text-xs text-slate-500 font-medium mt-1">Save a filtered search from Explore to start getting price-drop and new-match alerts.</p>
                            </div>
                        ) : (
                            watchlist.map((searchConfig) => (
                                <div key={searchConfig.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-slate-900 truncate">{searchConfig.label}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mt-1">{searchConfig.matches.length} live matches</p>
                                        </div>
                                        <button type="button" onClick={() => onRemoveSearch(searchConfig.id)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><i className="ph ph-x text-lg"></i></button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {searchConfig.matches.slice(0, 3).map((item) => (
                                            <button key={`saved-match-${searchConfig.id}-${item.id}`} type="button" onClick={() => onSelect(item)} className="px-3 py-2 rounded-full bg-brand-50 border border-brand-100 text-[10px] font-black uppercase tracking-widest text-brand-700">
                                                {item.name}
                                            </button>
                                        ))}
                                        {searchConfig.matches.length === 0 && <span className="text-xs font-medium text-slate-500">No items match right now.</span>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Saved Items</h2>
                    <div className="grid grid-cols-2 gap-4 content-start">
                        {filtered.length===0 ? <p className="col-span-2 text-center text-slate-400 py-10 font-medium">{search ? 'No matches found' : 'No saved items yet'}</p> : filtered.map(item => (
                            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} key={item.id} onClick={()=>onSelect(item)} className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer shadow-sm hover:shadow-md active:scale-95 transition-all">
                                <div className="h-32 bg-cover bg-center relative" style={{backgroundImage: `url(${item.images[0]})`}}><div className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-xs font-black text-brand-600"><i className="ph-fill ph-heart"></i></div></div>
                                <div className="p-3"><p className="font-bold text-xs text-slate-900 truncate mb-1">{item.name}</p><p className="font-black text-brand-600 text-sm">₱{item.priceDaily}</p></div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const InboxView = ({ chats, onOpen }) => {
        const [search, setSearch] = useState('');
        const [filter, setFilter] = useState('all');
        const normalizedSearch = search.trim().toLowerCase();
        const unreadCount = chats.filter(c => c.unread > 0).length;
        const activeCount = chats.filter(c => c.status !== 'Completed').length;
        const guardedCount = chats.filter(c => c.item?.insured).length;
        const filtered = chats.filter(c => {
            const corpus = `${c.owner?.name || ''} ${c.item?.name || ''} ${c.lastMsg || ''} ${c.meetupZone || ''} ${c.status || ''}`.toLowerCase();
            const matchesSearch = normalizedSearch === '' || corpus.includes(normalizedSearch);
            const matchesFilter =
                filter === 'all' ? true :
                filter === 'unread' ? c.unread > 0 :
                filter === 'active' ? c.status !== 'Completed' :
                c.item?.insured;
            return matchesSearch && matchesFilter;
        });
        return (
            <div className="flex-1 min-h-0 flex flex-col bg-white">
                <header className="px-6 pt-14 pb-4 bg-white border-b border-slate-100 shrink-0">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Messages</h1>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unread</p>
                            <p className="text-lg font-black text-slate-900 mt-1">{unreadCount}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active</p>
                            <p className="text-lg font-black text-slate-900 mt-1">{activeCount}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Guarded</p>
                            <p className="text-lg font-black text-slate-900 mt-1">{guardedCount}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search chats..." className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500" />
                        <button onClick={() => setSearch('')} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${search ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-400'}`}><i className="ph ph-x text-lg"></i></button>
                    </div>
                    <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'unread', label: 'Unread' },
                            { id: 'active', label: 'Active' },
                            { id: 'guarded', label: 'Guarded' }
                        ].map(option => (
                            <button key={option.id} type="button" onClick={() => setFilter(option.id)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === option.id ? 'bg-brand-900 text-white shadow-sm' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}>
                                {option.label}
                            </button>
                        ))}
                    </div>
                </header>
                <div className="flex-1 min-h-0 overflow-y-auto custom-scroll pb-28">
                    {filtered.length === 0 ? <p className="text-center text-slate-400 py-10 font-medium">{search ? 'No chats found' : 'No messages yet'}</p> : filtered.map(c => (
                        <motion.div key={c.id} initial={{opacity:0}} animate={{opacity:1}} onClick={() => onOpen(c)} className="flex items-center gap-4 p-5 border-b border-slate-100 cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition-all">
                            <div className="relative shrink-0"><img src={c.owner.avatar} className="w-14 h-14 rounded-full object-cover border border-slate-200" />{c.unread > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-alert rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] font-black">{c.unread}</div>}</div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1 gap-2">
                                    <h4 className="font-bold text-slate-900 text-base truncate">{c.owner.name}</h4>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">{c.time}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-1.5 min-w-0">
                                    <p className="text-[11px] font-black text-slate-600 truncate">{c.item?.name || 'General thread'}</p>
                                    <span className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200 text-[8px] font-black uppercase tracking-widest text-slate-600 shrink-0">{c.status}</span>
                                </div>
                                <p className={`text-sm truncate ${c.unread > 0 ? 'font-bold text-slate-900' : 'font-medium text-slate-500'}`}>{c.lastMsg}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${c.item?.insured ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{c.item?.insured ? 'Guarded' : 'Standard'}</span>
                                    <span className="text-[10px] font-bold text-slate-400 truncate">{c.priority}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    };

    // --- SECONDARY VIEWS ---

    const WalletHub = ({ wallet, ledger, paymentMethods, onTopUp, onWithdraw, onAddGcash, onAddCard, onBack }) => {
        const [mode, setMode] = useState('main'); 
        const [amount, setAmount] = useState('');
        const [phone, setPhone] = useState('');
        const [cardInfo, setCardInfo] = useState('');

        const handleProcess = (e) => {
            e.preventDefault();
            if (mode === 'topup' && amount) onTopUp(Number(amount));
            else if (mode === 'withdraw' && amount && Number(amount) <= wallet) onWithdraw(Number(amount));
            else if (mode === 'add-gcash' && phone) onAddGcash(phone);
            else if (mode === 'add-card' && cardInfo) onAddCard(cardInfo);
            setMode('main');
            setAmount(''); setPhone(''); setCardInfo('');
        };

        return (
            <div className="flex-1 min-h-0 flex flex-col bg-slate-50 relative z-[100]">
                <header className="absolute top-0 left-0 right-0 pt-12 pb-4 px-4 z-50 blur-header flex items-center"><button onClick={() => mode === 'main' ? onBack() : setMode('main')} className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-900 active:scale-90 transition-transform"><i className="ph ph-arrow-left text-lg"></i></button><h1 className="text-lg font-black text-slate-900 ml-3">{mode === 'main' ? 'Wallet Hub' : mode === 'topup' ? 'Top Up' : mode === 'withdraw' ? 'Withdraw' : 'Add Method'}</h1></header>
                
                {mode === 'main' ? (
                    <div className="flex-1 min-h-0 overflow-y-auto custom-scroll px-6 pt-28 pb-8">
                        <div className="bg-brand-900 text-white p-8 rounded-[2rem] mb-6 text-center shadow-float relative overflow-hidden">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Available Balance</p>
                            <p className="text-4xl font-black mb-6 relative z-10">₱{wallet.toLocaleString()}</p>
                            <div className="flex gap-3 relative z-10"><button onClick={() => setMode('topup')} className="flex-1 min-h-0 bg-brand-accent text-brand-950 font-bold py-3.5 rounded-xl text-sm hover:bg-yellow-500 shadow-accent active:scale-95 transition-transform">Top Up</button><button onClick={() => setMode('withdraw')} className="flex-1 min-h-0 bg-white/10 text-white font-bold py-3.5 rounded-xl text-sm border border-white/20 hover:bg-white/20 transition-colors">Withdraw</button></div>
                        </div>

                        <SectionTitle>Payment Methods</SectionTitle>
                        <div className="space-y-3 mt-2 mb-6">
                            {paymentMethods.map((pm, idx) => (
                                <div key={pm.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"><div className="flex items-center gap-3"><i className={`ph-fill ${pm.type === 'gcash' ? 'ph-device-mobile text-blue-500' : 'ph-credit-card text-slate-700'} text-2xl`}></i><div><p className="text-sm font-bold text-slate-900">{pm.name}{idx === 0 ? <span className="ml-2 text-[10px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded font-black uppercase">Default</span> : ''}</p><p className="text-[10px] font-medium text-slate-500">{pm.detail}</p></div></div><button onClick={() => { if(paymentMethods.length > 1) { alert('✓ Method removed'); } else alert('Keep at least one method'); }} className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"><i className="ph-fill ph-trash text-sm"></i></button></div>
                            ))}
                            <div className="flex gap-2">
                                <button onClick={()=>setMode('add-gcash')} className="flex-1 py-3 bg-white border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-1 hover:bg-slate-50"><i className="ph ph-plus"></i> Link GCash</button>
                                <button onClick={()=>setMode('add-card')} className="flex-1 py-3 bg-white border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-1 hover:bg-slate-50"><i className="ph ph-plus"></i> Add Card</button>
                            </div>
                        </div>

                        <SectionTitle>Recent Transactions</SectionTitle>
                        <div className="space-y-3 mt-2">
                            {ledger.map((tx, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-600'}`}><i className={`ph-bold text-lg ${tx.amount > 0 ? 'ph-arrow-down-left' : 'ph-arrow-up-right'}`}></i></div><div><p className="font-bold text-sm text-slate-900 mb-0.5">{tx.ref}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tx.date}</p></div></div><p className={`font-black text-sm ${tx.amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}</p></div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 min-h-0 flex flex-col px-6 pt-28 pb-8">
                        <form onSubmit={handleProcess} className="flex-1 flex flex-col">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                {(mode === 'topup' || mode === 'withdraw') && (
                                    <>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xl">₱</span>
                                            <input type="number" required min="50" max={mode === 'withdraw' ? wallet : 100000} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-10 pr-4 text-xl font-black outline-none focus:ring-2 focus:ring-brand-500" />
                                        </div>
                                        {mode === 'withdraw' && <p className="text-xs text-slate-500 text-center">Available to withdraw: ₱{wallet.toLocaleString()}</p>}
                                        <div className="space-y-2">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">Select Method</p>
                                            <select required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm text-slate-900">
                                                {paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name} ({pm.detail})</option>)}
                                                {mode === 'topup' && <option value="otc">Over-the-Counter (Campus Cashier)</option>}
                                            </select>
                                        </div>
                                    </>
                                )}
                                {mode === 'add-gcash' && (
                                    <div className="space-y-2"><p className="text-xs font-bold text-slate-500 uppercase tracking-widest">GCash Number</p><input type="tel" required value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="09XX XXX XXXX" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-base text-slate-900 focus:ring-2 focus:ring-brand-500" /></div>
                                )}
                                {mode === 'add-card' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2"><p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Card Number</p><input type="text" required value={cardInfo} onChange={(e)=>setCardInfo(e.target.value)} placeholder="XXXX XXXX XXXX XXXX" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-base text-slate-900 focus:ring-2 focus:ring-brand-500" /></div>
                                        <div className="flex gap-4"><input type="text" required placeholder="MM/YY" className="w-1/2 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm" /><input type="text" required placeholder="CVV" className="w-1/2 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm" /></div>
                                    </div>
                                )}
                            </div>
                            <div className="mt-auto pt-6">
                                <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-md text-base hover:bg-slate-800 transition-colors">
                                    {mode === 'topup' ? 'Confirm Top Up' : mode === 'withdraw' ? 'Process Withdrawal' : 'Save Method'}
                                </motion.button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        );
    };

    const IdentityVault = ({ onBack, user, setUser, onVerified }) => {
        const fileInputRef = useRef(null);
        const [phone, setPhone] = useState(user.phone || '');
        const [studentEmail, setStudentEmail] = useState(user.campusEmail || user.email || '');
        const [studentNumber, setStudentNumber] = useState(user.studentNumber || '');
        const [idFileName, setIdFileName] = useState(user.idFileName || '');
        const [notice, setNotice] = useState('');
        const [isSubmitting, setIsSubmitting] = useState(false);

        const normalizedPhone = phone.replace(/\D/g, '').slice(0, 11);
        const normalizedEmail = studentEmail.trim().toLowerCase();
        const marketplaceUnlocked = true;
        const verificationRows = [
            { label: 'Mobile number', value: user.phoneVerified ? `${user.phone || normalizedPhone} verified` : 'Not verified yet', done: user.phoneVerified },
            { label: 'Campus email', value: user.campusEmail || user.email || 'No school email saved', done: !!(user.campusEmail || user.email) },
            { label: 'Student ID', value: user.idUploaded ? (user.idFileName || 'Uploaded') : 'Upload required', done: user.idUploaded },
            { label: 'Marketplace access', value: marketplaceUnlocked ? 'Unlocked' : 'Locked until approval', done: marketplaceUnlocked }
        ];
        const completedChecks = verificationRows.filter(row => row.done).length;
        const completionPercent = Math.round((completedChecks / verificationRows.length) * 100);
        const nextAction = user.studentVerified && user.idUploaded
            ? 'All core account checks are complete. You can keep your records updated here.'
            : !normalizedPhone
                ? 'Add your mobile number so meetup coordination stays visible in your profile.'
                : !idFileName && !user.idUploaded
                    ? 'Upload your student ID to finish the identity review.'
                    : !normalizedEmail.includes('ustp.edu.ph')
                        ? 'Use your official USTP email to submit student verification.'
                        : 'Submit your verification bundle to complete your account record.';
        const savePhoneNumber = () => {
            if (normalizedPhone.length < 10) {
                setNotice('Enter a valid mobile number first.');
                return;
            }
            setUser(prev => ({
                ...prev,
                phone: normalizedPhone,
                phoneVerified: true,
                verificationStatus: prev.studentVerified && prev.idUploaded ? 'Approved' : 'Contact Saved'
            }));
            setNotice('Mobile number saved to your profile. No verification code needed.');
        };

        const handleIdSelect = (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setIdFileName(file.name);
            setNotice(`Student ID selected: ${file.name}`);
            e.target.value = '';
        };

        const submitStudentVerification = () => {
            if (!normalizedEmail.includes('ustp.edu.ph')) {
                setNotice('Use your USTP email for student verification.');
                return;
            }
            if (!studentNumber.trim()) {
                setNotice('Enter your student number.');
                return;
            }
            if (!idFileName) {
                setNotice('Upload your student ID before submitting.');
                return;
            }

            setIsSubmitting(true);
            setNotice('');
            setTimeout(() => {
                setIsSubmitting(false);
                setUser(prev => ({
                    ...prev,
                    email: prev.email || normalizedEmail,
                    campusEmail: normalizedEmail,
                    emailVerified: prev.emailVerified || prev.email?.toLowerCase() === normalizedEmail,
                    studentNumber: studentNumber.trim(),
                    idUploaded: true,
                    idFileName,
                    studentVerified: true,
                    verified: true,
                    verificationStatus: 'Approved'
                }));
                setNotice('Student verification approved. Lending and renting are now unlocked.');
            }, 1300);
        };

        return (
            <div className="flex-1 min-h-0 bg-slate-50 flex flex-col relative z-[100]">
                <header className="bg-white px-6 pt-12 pb-4 border-b border-slate-100 flex items-center sticky top-0 z-50">
                    <button onClick={onBack} className="mr-3 text-slate-900 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center active:scale-90 transition-transform"><i className="ph ph-arrow-left text-lg"></i></button>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-900">Verification Center</h1>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">Student access and profile security</p>
                    </div>
                </header>
                <div className="flex-1 min-h-0 p-6 overflow-y-auto custom-scroll space-y-5">
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-700 mb-2">Account Status</p>
                                <h2 className="text-xl font-black text-slate-900">{marketplaceUnlocked ? 'Marketplace unlocked' : 'Verification still required'}</h2>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed mt-2">Use this space to complete your student record, strengthen trust markers, and keep your campus account ready for lending and borrowing.</p>
                            </div>
                            <span className="campus-chip soft"><i className="ph ph-fingerprint text-sm normal-case"></i>{user.verificationStatus || 'Pending'}</span>
                        </div>
                        <div className="campus-fact-card rounded-2xl p-4 mb-4">
                            <div className="flex items-center justify-between gap-3 mb-2">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-700">Completion</p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">{completionPercent}% profile readiness</p>
                                </div>
                                <span className="text-xl font-black text-brand-900">{completedChecks}/{verificationRows.length}</span>
                            </div>
                            <div className="campus-progress-track"><div className="campus-progress-fill" style={{width: `${completionPercent}%`}}></div></div>
                            <p className="text-xs font-medium text-slate-500 mt-3">{nextAction}</p>
                        </div>
                        <div className="space-y-2">
                            {verificationRows.map(row => (
                                <div key={row.label} className="campus-fact-card rounded-2xl p-4 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{row.label}</p>
                                        <p className="text-sm font-bold text-slate-900 mt-1 leading-relaxed">{row.value}</p>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${row.done ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>{row.done ? 'Complete' : 'Pending'}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-700 mb-2">Mobile Number</p>
                            <h3 className="text-lg font-black text-slate-900">Add a contact number to your profile</h3>
                            <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">Your phone badge appears on profile and helps with meetup coordination. This is now a direct save with no code step.</p>
                        </div>
                        <div className="space-y-3">
                            <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} type="tel" placeholder="09XXXXXXXXX" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-medium text-slate-900" />
                            <button type="button" onClick={savePhoneNumber} className="w-full py-3 rounded-xl bg-brand-900 text-white font-black text-sm">{user.phoneVerified ? 'Update Mobile Number' : 'Save Mobile Number'}</button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-700 mb-2">Student Verification</p>
                            <h3 className="text-lg font-black text-slate-900">Confirm you are a verified USTP CDO student</h3>
                            <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">This unlocks marketplace access for lending, renting, posting requests, and listing items.</p>
                        </div>
                        <input value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} type="email" placeholder="student@ustp.edu.ph" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-medium text-slate-900" />
                        <input value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} type="text" placeholder="Student number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-medium text-slate-900" />
                        <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleIdSelect} className="hidden" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full p-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50 text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-1">Upload Student ID</p>
                            <p className="text-sm font-bold text-slate-900">{idFileName || 'Tap to attach your current school ID'}</p>
                            <p className="text-xs text-slate-500 font-medium mt-2">Accepted for prototype: image or PDF capture of your ID.</p>
                        </button>
                        <button type="button" onClick={submitStudentVerification} disabled={isSubmitting} className="w-full py-4 rounded-xl bg-brand-accent text-brand-950 font-black shadow-accent flex items-center justify-center gap-2 disabled:opacity-60">
                            {isSubmitting ? <><i className="ph-bold ph-spinner animate-spin"></i> Verifying Student Record</> : <>Submit Student Verification</>}
                        </button>
                    </div>

                    {notice && (
                        <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-xs font-bold text-brand-900 leading-relaxed">
                            {notice}
                        </div>
                    )}

                    {marketplaceUnlocked && (
                        <button onClick={onVerified} className="w-full py-4 rounded-2xl bg-brand-900 text-white font-black text-sm uppercase tracking-widest shadow-md">Continue to Marketplace</button>
                    )}
                </div>
            </div>
        );
    };

    const HelpCenterView = ({ onBack }) => {
        const [chatOpen, setChatOpen] = useState(false);
        const [showFaq, setShowFaq] = useState(false);
        const [msg, setMsg] = useState('');
        const [chat, setChat] = useState([
            {
                text: "Hi. I'm the Lendora support assistant. Ask about claims, refunds, payout timing, or account safety.",
                type: 'received',
                time: 'Just now',
                card: {
                    title: 'Support Shortcuts',
                    rows: [
                        { label: 'Claims', value: 'File within 48 hours' },
                        { label: 'Refunds', value: 'Escrow reviewed first' },
                        { label: 'Payouts', value: 'Released after handoff proof' }
                    ],
                    note: 'Type a concern below and the bot will route you with a ticket summary.'
                }
            }
        ]);
        const messagesEndRef = useRef(null);

        const faqs = [
            {
                question: 'How do I file a Lendora Guard claim?',
                answer: 'Open Claims Hub, choose the rental, upload evidence, and submit within 48 hours after return or discovery of damage. Claims are matched against handoff photos and meetup records.'
            },
            {
                question: 'When does the lender get paid?',
                answer: 'Rental fees stay in escrow until the pickup handoff is verified. Active rentals remain protected until return, then final payout is released after the return check or claim review.'
            },
            {
                question: 'What happens if a rental is cancelled?',
                answer: 'If the lender cancels before handoff, the borrower gets a full refund. If the borrower cancels late or fails to appear, the case is reviewed against chat logs and meetup proof before fees are assigned.'
            },
            {
                question: 'Does Lendora Guard cover theft or normal wear?',
                answer: 'No. Guard is for approved accidental damage supported by evidence. Normal wear, missing consumables, undocumented pre-existing issues, and unsupported theft cases are excluded.'
            }
        ];

        useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat]);

        const buildSupportReply = (input) => {
            const normalized = input.toLowerCase();
            if (normalized.includes('claim') || normalized.includes('damage') || normalized.includes('broken')) {
                return {
                    text: 'Claim guidance prepared. File the case as soon as possible so the evidence window stays valid.',
                    card: {
                        title: 'Claim Checklist',
                        rows: [
                            { label: 'Deadline', value: 'Within 48 hours' },
                            { label: 'Needed', value: 'Photos, meetup context, issue summary' },
                            { label: 'Review', value: 'Evidence + manual validation' }
                        ],
                        note: 'Use Claims Hub if the rental is already in Activity.'
                    }
                };
            }
            if (normalized.includes('refund') || normalized.includes('cancel')) {
                return {
                    text: 'Refund flow opened. Escrow status and cancellation timing determine the final adjustment.',
                    card: {
                        title: 'Refund Rules',
                        rows: [
                            { label: 'Before handoff', value: 'Usually full refund' },
                            { label: 'After handoff', value: 'Reviewed case-by-case' },
                            { label: 'No-show', value: 'Needs chat + meetup proof' }
                        ],
                        note: 'If you want a human review, reply with your rental concern and support will log it.'
                    }
                };
            }
            return {
                text: 'A support ticket was prepared for review. A human agent can continue from the context already in this chat.',
                card: {
                    title: 'Ticket Summary',
                    rows: [
                        { label: 'Ticket', value: '#4992' },
                        { label: 'Priority', value: 'Standard' },
                        { label: 'Next step', value: 'Agent review queued' }
                    ],
                    note: 'Keep this thread open so follow-up questions stay attached to the same case.'
                }
            };
        };

        const send = (e) => {
            e.preventDefault();
            const text = msg.trim();
            if (!text) return;
            setChat(prev => [...prev, { text, type: 'sent', time: 'Just now' }]);
            setMsg('');
            const reply = buildSupportReply(text);
            setTimeout(() => setChat(prev => [...prev, { ...reply, type: 'received', time: 'Just now' }]), 900);
        };

        return (
            <div className="flex-1 min-h-0 bg-slate-50 flex flex-col relative z-[100]">
                <header className="absolute top-0 left-0 right-0 pt-12 pb-4 px-4 z-50 blur-header flex items-center"><button onClick={() => chatOpen ? setChatOpen(false) : onBack()} className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-900 active:scale-90 transition-transform"><i className="ph ph-arrow-left text-lg"></i></button><h1 className="text-lg font-black ml-3 text-slate-900">{chatOpen ? 'Live Support' : 'Help Center'}</h1></header>

                {!chatOpen ? (
                    <div className="flex-1 min-h-0 overflow-y-auto pt-28 p-6 space-y-6 custom-scroll">
                        <div className="chat-surface-card p-6 rounded-3xl text-center mb-4"><i className="ph-fill ph-headset text-5xl text-brand-600 mb-3"></i><h3 className="text-xl font-black text-slate-900 mb-1">We're here to help</h3><p className="text-xs font-medium text-slate-500 px-2">Support is available for rentals, claims, refunds, and payout issues.</p></div>
                        <div className="space-y-3">
                            <button onClick={() => setChatOpen(true)} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"><i className="ph-fill ph-chat-circle-dots text-lg"></i> Live Chat Support</button>
                            <button onClick={() => setShowFaq(prev => !prev)} className="w-full chat-action-btn font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"><i className="ph-fill ph-book-open text-lg"></i>{showFaq ? 'Hide FAQ' : 'Read FAQ'}</button>
                        </div>
                        {showFaq && (
                            <div className="space-y-3">
                                {faqs.map((faq, idx) => (
                                    <div key={idx} className="chat-surface-card p-4 rounded-2xl">
                                        <p className="text-sm font-black text-slate-900 mb-1">{faq.question}</p>
                                        <p className="text-xs font-medium text-slate-500 leading-relaxed">{faq.answer}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 min-h-0 flex flex-col pt-24 bg-slate-50">
                        <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3 custom-scroll">
                            <AnimatePresence>
                                {chat.map((c, i) => (
                                    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} key={i} className={`flex ${c.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-3 max-w-[80%] text-sm font-medium shadow-sm rounded-2xl ${c.type === 'sent' ? 'msg-bubble-sent rounded-br-none' : 'chat-bubble-received rounded-bl-none'}`}>
                                            {c.text && <p className="break-words">{c.text}</p>}
                                            {c.card && (
                                                <div className="chat-inline-card rounded-xl p-3 mt-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-2">{c.card.title}</p>
                                                    <div className="space-y-1.5">
                                                        {c.card.rows.map((row, idx) => (
                                                            <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
                                                                <span className="chat-meta-text font-semibold">{row.label}</span>
                                                                <span className="font-bold text-slate-900">{row.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {c.card.note && <p className="chat-meta-text text-[11px] leading-relaxed mt-2">{c.card.note}</p>}
                                                </div>
                                            )}
                                            <p className={`text-[11px] mt-1 ${c.type === 'sent' ? 'text-brand-100' : 'chat-meta-text'}`}>{c.time}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 glass-panel border-t border-slate-200 pb-8"><form onSubmit={send} className="flex gap-2"><input value={msg} onChange={e=>setMsg(e.target.value)} type="text" placeholder="Type your issue..." className="flex-1 min-h-0 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-sm text-slate-900" /><button type="submit" className="w-11 h-11 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shrink-0 transition-colors shadow-sm active:scale-90"><i className="ph-bold ph-paper-plane-right text-lg"></i></button></form></div>
                    </div>
                )}
            </div>
        );
    };

    const ScannerView = ({ onDone, onCancel }) => {
        const [step, setStep] = useState(0);
        const [optInsurance, setOptInsurance] = useState(true);
        const handlePublish = () => onDone({ id: Date.now(), name: "Multimeter Pro", priceDaily: 80, priceHourly: 20, category: "Academic", condition: "Good", location: "Engineering Bldg", value: 1200, images: ["https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800"], owner: CURRENT_USER, rating: 0, coords: getCampusCoordsForLocation('Engineering Bldg', Date.now()), description: "Fully functional digital multimeter. Includes test leads.", insured: optInsurance });

        return (
            <div className="flex-1 min-h-0 bg-slate-900 flex flex-col text-white relative z-[100]">
                <header className="px-6 pt-12 pb-4 flex items-center justify-between z-10"><button onClick={onCancel} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur"><i className="ph ph-x text-lg"></i></button><span className="text-[10px] font-bold uppercase tracking-widest bg-brand-accent text-brand-950 px-3 py-1 rounded-full shadow-sm">Quick Listing</span></header>
                <div className="flex-1 min-h-0 flex flex-col justify-center items-center p-6 relative">
                    {step === 0 && (
                        <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="w-full text-center">
                            <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-700"><i className="ph ph-scan text-5xl text-brand-400"></i></div>
                            <h2 className="text-3xl font-black mb-3 tracking-tight">Scan your item</h2>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 px-6">Point your camera at your gear. Lendora will prefill the basics and suggest student-friendly pricing.</p>
                            <button onClick={()=>{setStep(1); setTimeout(()=>setStep(2), 2500);}} className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl text-lg shadow-float active:scale-95 transition-transform hover:bg-brand-700">Start Scanner</button>
                        </motion.div>
                    )}
                    {step === 1 && (
                        <div className="w-full aspect-[3/4] bg-[url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center rounded-3xl border-4 border-brand-500 relative overflow-hidden shadow-glow">
                            <div className="scanner-line"></div><div className="absolute inset-0 bg-black/50 flex items-center justify-center"><p className="text-white font-bold text-xs uppercase tracking-widest animate-pulse">Reading item details...</p></div>
                        </div>
                    )}
                    {step === 2 && (
                        <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} className="w-full bg-white p-6 rounded-3xl text-slate-900 shadow-xl">
                            <div className="flex items-center justify-center w-14 h-14 bg-brand-50 text-brand-600 rounded-full mb-4 mx-auto"><i className="ph-bold ph-check text-2xl"></i></div>
                            <h3 className="font-black text-xl mb-4 text-center">Digital Multimeter Detected</h3>
                            <div className="space-y-3 mb-6">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Est. Value</span><span className="font-black text-base">₱1,200</span></div>
                                <div className="flex gap-3"><div className="flex-1 bg-brand-50 p-4 rounded-xl border border-brand-100 text-center"><p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1">Suggested Daily</p><p className="font-black text-xl text-brand-700">₱80</p></div><div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Suggested Hourly</p><p className="font-black text-xl text-slate-900">₱20</p></div></div>
                                
                                <div className="p-4 rounded-xl border-2 border-brand-200 bg-brand-50 mt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-slate-900 text-sm">Lendora Guard Protection</h4>
                                        <div onClick={()=>setOptInsurance(!optInsurance)} className={`w-12 h-6 rounded-full relative transition-colors duration-300 cursor-pointer ${optInsurance ? 'bg-brand-600' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${optInsurance ? 'translate-x-7' : 'translate-x-1'}`}></div></div>
                                    </div>
                                    <p className="text-[10px] text-slate-600 leading-relaxed font-medium">Opt-in to protect this item up to ₱1,200 for accidental damage. (Deducts 5% from payout).</p>
                                </div>
                            </div>
                            <button onClick={handlePublish} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-lg active:scale-95 transition-transform hover:bg-slate-800">Publish Listing</button>
                        </motion.div>
                    )}
                </div>
            </div>
        );
    };

    // Remaining basic views (MyListings, Policy, Claims, Settings, Terms) wrapped tightly to save space
    const MyListingsView = ({ items, rentals, onBack, onAdjustPrice, onTogglePause, onOpenAnalytics }) => {
        const [editId, setEditId] = useState(null);
        const [editPrice, setEditPrice] = useState('');
        const myItems = items.filter(i => i.owner.id === CURRENT_USER.id);
        const startEdit = (item) => { setEditId(item.id); setEditPrice(String(item.priceDaily)); };
        const saveEdit = (item) => {
            const nextValue = Math.max(50, Number(editPrice) || item.priceDaily);
            onAdjustPrice(item.id, nextValue - item.priceDaily);
            setEditId(null);
        };
        return (
            <div className="flex-1 min-h-0 bg-slate-50 flex flex-col overflow-hidden relative z-[100]">
                <header className="bg-white px-6 pt-12 pb-4 border-b border-slate-100 flex items-center sticky top-0 z-10"><button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 mr-3 active:scale-90 transition-transform"><i className="ph ph-arrow-left text-lg"></i></button><h1 className="text-xl font-black text-slate-900">My Listings</h1><button onClick={onOpenAnalytics} className="ml-auto px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-[10px] font-black uppercase tracking-widest text-amber-800">Analytics</button></header>
                <div className="flex-1 min-h-0 overflow-y-auto custom-scroll px-6 py-6 space-y-4 pb-28">
                    {myItems.length === 0 ? <p className="text-center text-slate-400 py-10 font-bold">No listings yet.</p> : myItems.map(item => {
                        const isPaused = !!item.paused;
                        const activeBookings = getItemBookings(item.id, rentals).length;
                        const nextSlot = getUpcomingAvailabilitySlots(item, rentals, 1, false, 1)[0];
                        return (
                            <motion.div key={item.id} initial={{opacity:0}} animate={{opacity:1}} className={`bg-white p-4 rounded-2xl border shadow-sm flex gap-4 items-start transition-all ${isPaused ? 'border-amber-200 opacity-60' : 'border-slate-200'}`}>
                                <div className="w-20 h-20 rounded-xl bg-cover bg-center shrink-0 border border-slate-100 relative" style={{backgroundImage: `url(${item.images[0]})`}}>
                                    {isPaused && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl"><i className="ph-fill ph-pause text-yellow-400 text-2xl"></i></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-900 text-sm mb-1 truncate">{item.name}</h4>
                                    {editId === item.id ? (
                                        <div className="flex gap-2 mb-2 items-center">
                                            <span className="text-[10px] font-bold text-slate-500">₱</span>
                                            <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-16 px-2 py-1 text-sm bg-slate-50 border border-brand-300 rounded outline-none focus:ring-1 focus:ring-brand-500" />
                                            <span className="text-[10px] font-bold text-slate-500">/day</span>
                                        </div>
                                    ) : (
                                        <p className="text-brand-600 font-black text-sm mb-2">₱{item.priceDaily}<span className="text-[10px] font-medium text-slate-400">/day</span></p>
                                    )}
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bookings</p>
                                            <p className="text-xs font-bold text-slate-900 mt-1">{activeBookings}</p>
                                        </div>
                                        <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Open</p>
                                            <p className="text-xs font-bold text-slate-900 mt-1">{nextSlot ? nextSlot.slotLabel : 'Booked out'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {editId === item.id ? (
                                            <> <button onClick={() => saveEdit(item)} className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-green-200 hover:bg-green-100">Save</button>
                                            <button onClick={() => setEditId(null)} className="flex-1 bg-slate-50 text-slate-700 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-200">Cancel</button> </>
                                        ) : (
                                            <> <button onClick={() => startEdit(item)} className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-blue-200 hover:bg-blue-100">Edit</button>
                                            <button onClick={() => onTogglePause(item.id)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${isPaused ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{isPaused ? 'Resume' : 'Pause'}</button> </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const PolicyView = ({ onBack }) => {
        const coverageIncluded = [
            'Accidental drops, cracked screens, broken hinges, and similar physical damage that happens during normal approved rental use.',
            'Liquid spills or classroom mishaps when the event is documented quickly and the item was handed over in working condition.',
            'Missing bundled accessories only when those accessories were listed, photographed, and included in the verified handoff record.',
            'Repair reimbursement up to the approved repair quote or the declared item value, whichever is lower.'
        ];

        const exclusions = [
            'Normal wear and tear, battery aging, cosmetic scratches, dirt buildup, and reduced performance caused by age or prior use.',
            'Pre-existing issues that were visible before handoff or not disclosed in the listing and photo record.',
            'Intentional damage, reckless misuse, jailbreaking or unauthorized modification, and off-campus use outside the agreed rental purpose.',
            'Theft, unexplained loss, or missing items without credible incident proof such as campus security reports, witness statements, or clear meetup documentation.',
            'Consumables, data loss, account lockouts, software corruption, or revenue loss from a delayed project.'
        ];

        const claimSteps = [
            { title: '1. Report fast', copy: 'Claims must be started within 48 hours after return, failed meetup completion, or the moment the lender discovers the damage.' },
            { title: '2. Upload evidence', copy: 'The strongest claims include pickup and return photos, a short written timeline, and a description of what stopped working.' },
            { title: '3. Validate against handoff records', copy: 'Lendora compares your evidence with the item listing, meetup chat, timestamps, and condition checks captured during handoff.' },
            { title: '4. Review and payout', copy: 'Approved claims are paid to the lender wallet after review. If repair is possible, payout may be capped at the repair estimate instead of the full declared value.' }
        ];

        return (
            <div className="flex-1 min-h-0 bg-slate-50 flex flex-col relative z-[100]">
                <header className="absolute top-0 left-0 right-0 pt-12 pb-4 px-4 z-50 blur-header flex items-center"><button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-900 active:scale-90 transition-transform"><i className="ph ph-arrow-left text-lg"></i></button><h1 className="text-lg font-black text-slate-900 ml-3">Trust & Policies</h1></header>
                <div className="flex-1 min-h-0 overflow-y-auto pt-28 p-6 space-y-5 custom-scroll">
                    <div className="campus-hero rounded-[2rem] p-6">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand-100 mb-2">Lendora Guard™</p>
                            <h2 className="text-2xl font-black mb-2">Detailed protection for student-owned gear.</h2>
                            <p className="text-sm font-medium text-blue-100/90 leading-relaxed">Lendora Guard is an opt-in protection layer funded by a 5% rental deduction. It exists to cover approved accidental damage after documented campus handoff verification.</p>
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                <div className="campus-mini-stat rounded-2xl p-3"><p className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-100/80">Coverage</p><p className="text-lg font-black mt-1">Up to</p><p className="text-[10px] text-blue-100/80">declared item value</p></div>
                                <div className="campus-mini-stat rounded-2xl p-3"><p className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-100/80">Deadline</p><p className="text-lg font-black mt-1">48h</p><p className="text-[10px] text-blue-100/80">to file a claim</p></div>
                                <div className="campus-mini-stat rounded-2xl p-3"><p className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-100/80">Pool Fee</p><p className="text-lg font-black mt-1">5%</p><p className="text-[10px] text-blue-100/80">from protected rentals</p></div>
                            </div>
                        </div>
                    </div>

                    <div className="campus-fact-card rounded-2xl p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-2">How It Works</p>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed">Protection only activates when the rental stays on-platform, payment remains in escrow, and the handoff plus return condition checks are completed inside Lendora. This keeps every claim tied to a verified item record, a campus meetup trail, and photo evidence.</p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">Covered Incidents</p>
                        {coverageIncluded.map((line, idx) => (
                            <div key={idx} className="campus-fact-card rounded-2xl p-4 flex gap-3 items-start">
                                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0"><i className="ph ph-check-circle text-lg"></i></div>
                                <p className="text-sm font-medium text-slate-600 leading-relaxed">{line}</p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">Not Covered</p>
                        {exclusions.map((line, idx) => (
                            <div key={idx} className="chat-surface-card rounded-2xl p-4 flex gap-3 items-start">
                                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0"><i className="ph ph-warning-circle text-lg"></i></div>
                                <p className="text-sm font-medium text-slate-600 leading-relaxed">{line}</p>
                            </div>
                        ))}
                    </div>

                    <div className="campus-fact-card rounded-2xl p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-3">Claim Flow</p>
                        <div className="space-y-3">
                            {claimSteps.map((step, idx) => (
                                <div key={idx} className="border-b border-slate-200 last:border-b-0 pb-3 last:pb-0">
                                    <p className="text-sm font-black text-slate-900 mb-1">{step.title}</p>
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed">{step.copy}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="campus-fact-card rounded-2xl p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-3">Evidence Required</p>
                        <ul className="text-xs space-y-2 list-disc pl-4 text-slate-500 font-bold">
                            <li><strong className="text-slate-700">Before-and-after proof:</strong> Pickup and return photos should clearly show the item body, screen, ports, and included accessories.</li>
                            <li><strong className="text-slate-700">Short incident narrative:</strong> State what happened, where it happened, and when the issue was first observed.</li>
                            <li><strong className="text-slate-700">Meetup context:</strong> The strongest cases have chat updates, ETA confirmation, and the verified campus handoff record.</li>
                            <li><strong className="text-slate-700">Repair support:</strong> Lendora may request a repair quote, diagnosis note, or test video before finalizing reimbursement.</li>
                        </ul>
                    </div>

                    <div className="campus-fact-card rounded-2xl p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-3">Payout Limits and Abuse Controls</p>
                        <ul className="text-xs space-y-2 list-disc pl-4 text-slate-500 font-bold">
                            <li><strong className="text-slate-700">Payout cap:</strong> Approved payout never exceeds the lesser of the declared item value, the verified repair quote, or the approved loss amount.</li>
                            <li><strong className="text-slate-700">One incident, one review:</strong> Repeated reports for the same damage event may be consolidated into a single decision.</li>
                            <li><strong className="text-slate-700">Fraud prevention:</strong> False evidence, staged incidents, edited screenshots, or off-platform side deals can suspend the account and void coverage.</li>
                            <li><strong className="text-slate-700">Appeals:</strong> If a claim is denied, the lender may submit additional evidence for a second review within seven days of the decision notice.</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    };

    const ClaimsCenter = ({ rentals, onBack }) => {
        const [claimStep, setClaimStep] = useState(0); 
        const [selectedRental, setSelectedRental] = useState(null);
        const [isProcessing, setIsProcessing] = useState(false);
        const submitClaim = () => { setIsProcessing(true); setTimeout(() => { setIsProcessing(false); setClaimStep(3); }, 2500); };
        return (
            <div className="flex-1 min-h-0 bg-slate-50 flex flex-col overflow-hidden z-[100] relative">
                <header className="bg-white px-6 pt-12 pb-4 border-b border-slate-100 flex items-center sticky top-0 z-50"><button onClick={() => claimStep > 0 ? setClaimStep(claimStep - 1) : onBack()} className="mr-3 text-slate-900 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center active:scale-90 transition-transform"><i className="ph ph-arrow-left text-lg"></i></button><h1 className="text-xl font-black tracking-tight">Claims Hub</h1></header>
                <div className="flex-1 min-h-0 overflow-y-auto custom-scroll p-6 pb-20">
                    {claimStep === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-md"><h2 className="text-2xl font-black mb-2 tracking-tight">File a protection claim.</h2><p className="text-slate-400 text-xs font-medium leading-relaxed">Start within 48 hours after return. We review handoff photos, chat updates, and condition checks before payout.</p></div>
                            <SectionTitle>Select Rental</SectionTitle>
                            {rentals.length === 0 ? <p className="text-slate-400 text-sm font-bold text-center py-10">No recent eligible rentals.</p> : rentals.map((r, i) => (
                                <div key={i} onClick={() => {setSelectedRental(r); setClaimStep(1);}} className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50 active:scale-95 transition-all shadow-sm mb-3">
                                    <div className="flex gap-4 items-center"><div className="w-14 h-14 rounded-xl bg-cover bg-center border border-slate-100 shrink-0" style={{backgroundImage: `url(${r.images[0]})`}}></div><div className="min-w-0"><p className="font-black text-slate-900 text-sm leading-tight mb-1 truncate">{r.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ended {r.date || 'Recently'}</p></div></div><div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center"><i className="ph ph-caret-right text-base text-slate-400"></i></div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                    {claimStep === 1 && (
                        <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center"><div className="w-20 h-20 mx-auto rounded-2xl bg-cover bg-center shadow-inner mb-4" style={{backgroundImage: `url(${selectedRental.images[0]})`}}></div><h3 className="font-black text-lg text-slate-900">{selectedRental.name}</h3></div>
                            <div className="space-y-3"><label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Upload evidence</label><div onClick={() => setClaimStep(2)} className="w-full h-40 border-2 border-dashed border-brand-300 rounded-3xl bg-brand-50 flex flex-col items-center justify-center text-brand-600 cursor-pointer hover:bg-brand-100 active:scale-95 transition-all"><i className="ph-fill ph-camera-plus text-4xl mb-2"></i><span className="font-bold text-sm">Add Photos</span></div></div>
                        </motion.div>
                    )}
                    {claimStep === 2 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 flex flex-col items-center justify-center pt-8">
                            <div className="relative w-48 h-48 rounded-3xl overflow-hidden border-4 border-slate-900 shadow-xl bg-cover bg-center" style={{backgroundImage: `url(${selectedRental.images[0]})`}}><div className="scanner-line"></div></div>
                            <h3 className="text-xl font-black text-slate-900 mt-4">Reviewing evidence</h3><p className="text-xs text-slate-500 font-medium text-center px-6">Comparing this upload with the listing, handoff photos, and condition notes.</p>
                            <button onClick={submitClaim} disabled={isProcessing} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-md mt-6 flex items-center justify-center text-base hover:bg-slate-800">{isProcessing ? <i className="ph-bold ph-circle-notch animate-spin text-2xl"></i> : 'Submit Claim'}</button>
                        </motion.div>
                    )}
                    {claimStep === 3 && (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center pt-10">
                            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100"><i className="ph-fill ph-check-circle text-5xl"></i></div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Claim submitted.</h2><p className="text-slate-500 font-medium text-sm leading-relaxed mb-10 px-4">Your report is now in review. We'll update the claim status and wallet after assessment.</p>
                            <button onClick={onBack} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-md hover:bg-slate-800 transition-colors">Return to Dashboard</button>
                        </motion.div>
                    )}
                </div>
            </div>
        );
    };

    const TermsView = ({ onBack }) => {
        const payoutExamples = [
            { label: '₱500 standard rental', rentalFee: 500, insured: false },
            { label: '₱500 protected rental', rentalFee: 500, insured: true },
            { label: '₱900 protected rental', rentalFee: 900, insured: true }
        ].map((example) => {
            const share = getRevenueShare(example.rentalFee, example.insured);
            return {
                label: example.label,
                lender: `₱${share.lenderAmount}`,
                lendora: `₱${share.lendoraAmount}`,
                guard: share.guardAmount > 0 ? `₱${share.guardAmount}` : '—'
            };
        });

        return (
            <div className="flex-1 min-h-0 bg-white flex flex-col relative z-[100]">
                <header className="absolute top-0 left-0 right-0 pt-12 pb-4 px-4 z-50 blur-header flex items-center"><button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 active:scale-90 transition-transform"><i className="ph ph-arrow-left text-lg"></i></button></header>
                <div className="flex-1 min-h-0 overflow-y-auto pt-28 p-6 space-y-6 custom-scroll text-slate-600 font-medium">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 mb-1">Terms & Conditions</h1>
                        <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em]">Effective 2026</p>
                    </div>

                    <div className="campus-fact-card rounded-2xl p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-2">Lendora and Lender Profit Share</p>
                        <p className="text-sm leading-relaxed">Every completed rental is processed through Lendora escrow. The borrower pays the full rental charge upfront, but payout is not released to the lender until the pickup handoff is verified and the transaction is cleared for release. Revenue share only applies to the rental fee itself. Security deposits, if any, are held separately and are not treated as lender earnings or platform profit unless a claim decision authorizes a deduction.</p>
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            {payoutExamples.map((example, idx) => (
                                <div key={idx} className="chat-inline-card rounded-xl p-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-2">{example.label}</p>
                                    <p className="text-[11px] font-semibold text-slate-500">Lender</p>
                                    <p className="text-sm font-black text-slate-900">{example.lender}</p>
                                    <p className="text-[11px] font-semibold text-slate-500 mt-2">Lendora</p>
                                    <p className="text-sm font-black text-slate-900">{example.lendora}</p>
                                    <p className="text-[11px] font-semibold text-slate-500 mt-2">Guard Pool</p>
                                    <p className="text-sm font-black text-slate-900">{example.guard}</p>
                                </div>
                            ))}
                        </div>
                        <ul className="text-xs space-y-2 list-disc pl-4 text-slate-500 font-bold mt-4">
                            <li><strong className="text-slate-700">Standard rentals:</strong> {STANDARD_LENDER_PERCENT}% of the rental fee is payable to the lender and {LENDORA_PLATFORM_PERCENT}% is retained by Lendora as the platform fee.</li>
                            <li><strong className="text-slate-700">Protected rentals:</strong> {PROTECTED_LENDER_PERCENT}% of the rental fee is payable to the lender, {LENDORA_PLATFORM_PERCENT}% remains the platform fee, and {LENDORA_GUARD_PERCENT}% funds the Lendora Guard pool.</li>
                            <li><strong className="text-slate-700">Why the platform fee exists:</strong> It supports escrow operations, messaging, campus moderation, claim review tooling, and student safety features.</li>
                        </ul>
                    </div>

                    <section className="campus-fact-card rounded-2xl p-5">
                        <h3 className="font-black text-slate-900 text-base mb-2">1. Escrow, handoff, and payout timing</h3>
                        <p className="text-sm leading-relaxed mb-3">Borrower payments are collected before the rental begins and held in escrow. Escrow exists to protect both parties: the lender can see that funds are reserved, while the borrower knows payout is only released after pickup verification and later return review if required.</p>
                        <ul className="text-xs space-y-2 list-disc pl-4 text-slate-500 font-bold">
                            <li><strong className="text-slate-700">Pickup release:</strong> Escrow may move from reserved to authorized once the pickup QR and condition check are completed.</li>
                            <li><strong className="text-slate-700">Final release:</strong> For active rentals, final status is locked after return validation or after any open claim is resolved.</li>
                            <li><strong className="text-slate-700">Manual hold:</strong> Lendora may pause payout if there is an unresolved dispute, suspicious activity, missing handoff proof, or contradictory evidence.</li>
                        </ul>
                    </section>

                    <section className="campus-fact-card rounded-2xl p-5">
                        <h3 className="font-black text-slate-900 text-base mb-2">2. Borrower obligations</h3>
                        <ul className="text-xs space-y-2 list-disc pl-4 text-slate-500 font-bold">
                            <li><strong className="text-slate-700">Use as agreed:</strong> Borrowers must use the item only for the declared academic, org, or campus activity discussed in-app.</li>
                            <li><strong className="text-slate-700">Document condition:</strong> Borrowers must participate in pickup and return photo checks. Skipping these weakens refund or damage defenses.</li>
                            <li><strong className="text-slate-700">Respect return time:</strong> Late returns may trigger account review, reduced trust score, temporary holds, or reimbursement for verified disruption.</li>
                            <li><strong className="text-slate-700">Do not transfer possession:</strong> A borrower may not sub-rent, lend to another person, or let an unverified third party handle the item without lender approval.</li>
                        </ul>
                    </section>

                    <section className="campus-fact-card rounded-2xl p-5">
                        <h3 className="font-black text-slate-900 text-base mb-2">3. Lender obligations</h3>
                        <ul className="text-xs space-y-2 list-disc pl-4 text-slate-500 font-bold">
                            <li><strong className="text-slate-700">Accurate listings:</strong> Lenders must disclose working condition, missing parts, battery health issues, and any known limitations before pickup.</li>
                            <li><strong className="text-slate-700">Fair pricing:</strong> Listings should stay reasonable for campus rentals. Excessive pricing, misleading hourly conversions, or bait-and-switch pricing may result in moderation.</li>
                            <li><strong className="text-slate-700">Campus-safe meetup:</strong> Handoffs should happen in visible campus zones or other approved safe areas discussed in the thread.</li>
                            <li><strong className="text-slate-700">Evidence retention:</strong> The lender should keep listing photos, add-on notes, and return proof in the chat until the rental is fully completed.</li>
                        </ul>
                    </section>

                    <section className="campus-fact-card rounded-2xl p-5">
                        <h3 className="font-black text-slate-900 text-base mb-2">4. Cancellation, refunds, and no-show handling</h3>
                        <p className="text-sm leading-relaxed mb-3">Refund decisions depend on when the cancellation happened and whether pickup already occurred. Lendora does not use a one-size-fits-all refund for post-handoff incidents because active rentals can involve real usage, wear, or claim exposure.</p>
                        <ul className="text-xs space-y-2 list-disc pl-4 text-slate-500 font-bold">
                            <li><strong className="text-slate-700">Lender cancels before pickup:</strong> Borrower generally receives a full refund because the rental never started.</li>
                            <li><strong className="text-slate-700">Borrower cancels early:</strong> Refund is usually granted if the lender was not already on-site or actively preparing the handoff.</li>
                            <li><strong className="text-slate-700">Late cancellation or no-show:</strong> Lendora may review chat timestamps, ETA records, and meetup proof before deciding whether any fee should be retained.</li>
                            <li><strong className="text-slate-700">Post-pickup disputes:</strong> These are reviewed through support or claims and may not qualify for a full refund if the item was already handed over.</li>
                        </ul>
                    </section>

                    <section className="campus-fact-card rounded-2xl p-5">
                        <h3 className="font-black text-slate-900 text-base mb-2">5. Lendora Guard, claims, and liability limits</h3>
                        <p className="text-sm leading-relaxed mb-3">Lendora Guard is a limited protection feature, not a blanket warranty. It is designed for accidental damage supported by platform evidence. It does not replace careful listing, careful use, or responsible handoff behavior.</p>
                        <ul className="text-xs space-y-2 list-disc pl-4 text-slate-500 font-bold">
                            <li><strong className="text-slate-700">Claims window:</strong> File within 48 hours of return or damage discovery.</li>
                            <li><strong className="text-slate-700">Liability limit:</strong> Payout is capped at the declared item value, approved repair cost, or verified loss amount, whichever is lower.</li>
                            <li><strong className="text-slate-700">Excluded events:</strong> Normal wear, unsupported theft, off-platform side deals, and undocumented pre-existing issues are outside Guard coverage.</li>
                            <li><strong className="text-slate-700">Fraud response:</strong> Misrepresentation, fake evidence, or manipulated chats can result in payout reversal, suspension, and permanent account loss.</li>
                        </ul>
                    </section>

                    <div className="w-full h-px bg-slate-200 my-1"></div>

                    <div>
                        <h1 className="text-2xl font-black text-slate-900 mb-1">Data Privacy Policy</h1>
                        <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em]">RA 10173 Compliant</p>
                    </div>

                    <section className="campus-fact-card rounded-2xl p-5">
                        <p className="text-sm leading-relaxed mb-3">In compliance with the Data Privacy Act of 2012 (Republic Act No. 10173), Lendora collects, processes, and stores personal information strictly to support secure campus rentals, identity verification, payments, support, and claims review.</p>
                        <ul className="text-xs space-y-2 list-disc pl-4 text-slate-500 font-bold">
                            <li><strong className="text-slate-700">Identity data:</strong> Basic account details, profile photo, school identity indicators, and trust or verification markers may be used to reduce fraud and unsafe transactions.</li>
                            <li><strong className="text-slate-700">Transaction data:</strong> Listings, chat messages, rental history, payout records, and meetup-related evidence may be retained for audits, disputes, compliance, and claims decisions.</li>
                            <li><strong className="text-slate-700">Security purpose:</strong> Limited access logs and device signals may be processed to detect abuse, prevent unauthorized access, and protect wallets.</li>
                            <li><strong className="text-slate-700">Retention:</strong> Data may be retained as long as necessary for active accounts, unresolved disputes, applicable legal obligations, or anti-fraud review.</li>
                            <li><strong className="text-slate-700">User rights:</strong> Users may request correction, access, account closure, or deletion review through Help Center subject to legal and security retention requirements.</li>
                        </ul>
                    </section>

                    <section className="campus-fact-card rounded-2xl p-5">
                        <h3 className="font-black text-slate-900 text-base mb-2">6. Consent and platform use</h3>
                        <p className="text-sm leading-relaxed">By using Lendora, the user agrees to keep rentals on-platform, use the in-app thread for important updates, respect verified campus handoff procedures, and accept that platform decisions may rely on escrow status, timestamps, evidence, and moderation review. Continued use after policy updates means the user accepts the revised terms for future transactions.</p>
                    </section>

                    <div className="h-10"></div>
                </div>
            </div>
        );
    };

    const PublicProfileView = ({ user, items, rentals, reviews, onBack, onSelect, following, setFollowing }) => {
        const userItems = items.filter(i => i.owner.id === user.id);
        const isFollowing = following.some(f => f.id === user.id);
        const trustSnapshot = getTrustSnapshot(user, rentals, items, reviews);
        return (
            <div className="flex-1 min-h-0 flex flex-col bg-slate-50 relative z-[100]">
                <header className="absolute top-0 left-0 right-0 pt-12 pb-4 px-4 z-50 blur-header flex items-center"><button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-900 active:scale-90 transition-transform"><i className="ph ph-arrow-left text-lg"></i></button><h1 className="text-lg font-black text-slate-900 ml-3">{user.name}'s Profile</h1></header>
                <div className="flex-1 min-h-0 overflow-y-auto pt-28 p-6 space-y-6 custom-scroll">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
                        <img src={user.avatar} className="w-20 h-20 rounded-full border-4 border-white shadow-md mx-auto mb-4 object-cover" />
                        <h2 className="text-xl font-black text-slate-900 mb-1">{user.name}</h2>
                        <p className="text-xs font-bold text-slate-500 mb-3">{user.title}</p>
                        <div className={`inline-flex ${user.verified ? 'bg-brand-50 border-brand-100' : 'bg-slate-100 border-slate-200'} px-3 py-1 rounded-full items-center justify-center gap-1.5 border`}>
                            <i className={`ph-fill ${user.verified ? 'ph-seal-check text-brand-600' : 'ph-warning-circle text-slate-500'} text-sm`}></i>
                            <p className={`text-[9px] font-black ${user.verified ? 'text-brand-600' : 'text-slate-500'} uppercase tracking-widest mt-0.5`}>{user.verified ? 'Verified Student' : 'Unverified'}</p>
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            <div className="text-center"><p className="text-lg font-black text-brand-900">{user.rating}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rating</p></div>
                            <div className="text-center"><p className="text-lg font-black text-brand-900">{userItems.length}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Listings</p></div>
                            <div className="text-center"><p className="text-lg font-black text-brand-900">{user.joined}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined</p></div>
                        </div>
                        <button onClick={() => { if (isFollowing) setFollowing(following.filter(f => f.id !== user.id)); else setFollowing([...following, user]); }} className={`w-full mt-4 py-3 rounded-xl font-bold text-sm transition-colors ${isFollowing ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-brand-900 text-white hover:bg-brand-950'}`}>
                            {isFollowing ? 'Unfollow' : 'Follow'} {user.name}
                        </button>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-700">Trust Score</p>
                                <p className="text-sm font-semibold text-slate-600 mt-1">{trustSnapshot.label}</p>
                            </div>
                            <span className="px-3 py-2 rounded-full bg-brand-50 border border-brand-100 text-xs font-black text-brand-700">{trustSnapshot.score}/100</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            <div className="chat-inline-card rounded-xl p-3"><p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-1">Badge</p><p className="text-xs font-bold text-slate-900">{trustSnapshot.badge}</p></div>
                            <div className="chat-inline-card rounded-xl p-3"><p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-1">Completed</p><p className="text-xs font-bold text-slate-900">{trustSnapshot.completed}</p></div>
                            <div className="chat-inline-card rounded-xl p-3"><p className="text-[10px] font-black uppercase tracking-widest text-brand-700 mb-1">No-shows</p><p className="text-xs font-bold text-slate-900">{trustSnapshot.noShows}</p></div>
                        </div>
                    </div>
                    <SectionTitle>Their Gear</SectionTitle>
                    <div className="grid grid-cols-2 gap-4">
                        {userItems.map(item => (
                            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} key={item.id} onClick={() => onSelect(item)} className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer shadow-sm hover:shadow-md active:scale-95 transition-all">
                                <div className="h-32 bg-cover bg-center" style={{backgroundImage: `url(${item.images[0]})`}}></div>
                                <div className="p-3"><p className="font-bold text-xs text-slate-900 truncate mb-1">{item.name}</p><p className="font-black text-brand-600 text-sm">₱{item.priceDaily}</p></div>
                            </motion.div>
                        ))}
                    </div>
                    {userItems.length === 0 && <p className="text-center text-slate-400 py-10 font-medium">No items listed yet.</p>}
                </div>
            </div>
        );
    };

    const SettingsView = ({ settings, setSettings, blockedUsers, setBlockedUsers, onBack, onOpenTerms, onOpenHelp }) => {
        const [activeSection, setActiveSection] = useState('security');
        const [expandedCard, setExpandedCard] = useState('password');
        const [oldPass, setOldPass] = useState('');
        const [newPass, setNewPass] = useState('');
        const [confirmPass, setConfirmPass] = useState('');
        const [settingsNotice, setSettingsNotice] = useState('');
        const [deleteConfirm, setDeleteConfirm] = useState(false);

        const passwordStrength = newPass.length >= 12 ? 'Strong' : newPass.length >= 8 ? 'Solid' : newPass.length >= 6 ? 'Basic' : 'Too short';
        const securityScore = Math.min(100, 35 + (settings.biometric ? 20 : 0) + (settings.twoFactor ? 25 : 0) + (settings.sessionLock ? 10 : 0) + (settings.profileVisibility === 'private' ? 10 : 0));
        const profileVisibilityMeta = PROFILE_VISIBILITY_OPTIONS.find(option => option.id === settings.profileVisibility) || PROFILE_VISIBILITY_OPTIONS[0];
        const messagePrivacyMeta = MESSAGE_PRIVACY_OPTIONS.find(option => option.id === settings.messagePrivacy) || MESSAGE_PRIVACY_OPTIONS[0];
        const blockSuggestions = Object.values(USERS).filter(candidate => !blockedUsers.some(user => user.id === candidate.id)).slice(0, 3);
        const sections = [
            { id: 'security', label: 'Security' },
            { id: 'notifications', label: 'Alerts' },
            { id: 'privacy', label: 'Privacy' },
            { id: 'safety', label: 'Safety' },
            { id: 'data', label: 'Data' }
        ];

        const toggleSetting = (key) => {
            setSettings(prev => {
                const next = { ...prev, [key]: !prev[key] };
                return next;
            });
            // handle push subscription toggle specifically
            if (key === 'push') {
                // when enabling, attempt subscription; when disabling, unsubscribe
                setTimeout(() => {
                    if (!settings.push) registerServiceWorkerAndSubscribe();
                    else unsubscribePush();
                }, 200);
            }
        };
        const updateSettings = (patch) => setSettings(prev => ({ ...prev, ...patch }));

        const handlePasswordChange = () => {
            if (!oldPass.trim()) {
                setSettingsNotice('Enter your current password before updating it.');
                return;
            }
            if (newPass !== confirmPass) {
                setSettingsNotice('New password and confirmation do not match.');
                return;
            }
            if (newPass.length < 6) {
                setSettingsNotice('Use at least 6 characters for your new password.');
                return;
            }
            setSettingsNotice('Password updated successfully. Your account security record has been refreshed.');
            setOldPass('');
            setNewPass('');
            setConfirmPass('');
            setExpandedCard('');
        };

        const handleExportRequest = () => {
            setSettingsNotice('A downloadable account package has been queued. Include wallet, chats, rentals, and profile data in one export.');
        };

        const handleQuickBlock = (candidate) => {
            setBlockedUsers(prev => [...prev, candidate]);
            setSettingsNotice(`${candidate.name} has been added to your blocked list.`);
        };

        const handleUnblock = (userId) => {
            const blocked = blockedUsers.find(entry => entry.id === userId);
            setBlockedUsers(prev => prev.filter(entry => entry.id !== userId));
            setSettingsNotice(`${blocked?.name || 'User'} has been removed from your blocked list.`);
        };

        const SettingToggleRow = ({ option }) => (
            <div className="px-4 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm">{option.title}</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{option.note}</p>
                </div>
                <button type="button" onClick={() => toggleSetting(option.key)} className={`w-12 h-6 rounded-full relative transition-colors duration-300 shrink-0 mt-1 ${settings[option.key] ? 'bg-brand-600' : 'bg-slate-300'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${settings[option.key] ? 'translate-x-7' : 'translate-x-1'}`}></span>
                </button>
            </div>
        );

        return (
            <div className="flex-1 min-h-0 bg-slate-50 flex flex-col relative z-[100]">
                <header className="absolute top-0 left-0 right-0 pt-12 pb-4 px-4 z-50 blur-header flex items-center">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-900 active:scale-90 transition-transform"><i className="ph ph-arrow-left text-lg"></i></button>
                    <div className="ml-3">
                        <h1 className="text-lg font-black text-slate-900">Settings</h1>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Privacy, alerts, and account security</p>
                    </div>
                </header>
                <div className="flex-1 min-h-0 overflow-y-auto pt-28 p-6 space-y-5 custom-scroll">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Protection</p>
                                <p className="text-base font-black text-slate-900 mt-1">Security score {securityScore}%</p>
                                <p className="text-xs text-slate-500 font-medium mt-2">Visibility, inbox controls, and safety settings are grouped here in a simpler layout.</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${settings.twoFactor ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>{settings.twoFactor ? '2FA Ready' : '2FA Off'}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600">{profileVisibilityMeta.label}</span>
                            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600">{messagePrivacyMeta.label}</span>
                            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600">{blockedUsers.length} blocked</span>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {sections.map(section => (
                            <button key={section.id} type="button" onClick={() => setActiveSection(section.id)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeSection === section.id ? 'bg-brand-900 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600'}`}>
                                {section.label}
                            </button>
                        ))}
                    </div>

                    {activeSection === 'security' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-4 border-b border-slate-100">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Password and sign-in protection</p>
                                        <p className="text-xs text-slate-500 mt-1">Keep credentials updated and lock the account down when needed.</p>
                                    </div>
                                    <button type="button" onClick={() => setExpandedCard(expandedCard === 'password' ? '' : 'password')} className="px-3 py-2 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-700">{expandedCard === 'password' ? 'Hide' : 'Change Password'}</button>
                                </div>
                                {expandedCard === 'password' && (
                                    <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
                                        <input type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} placeholder="Current password" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium text-slate-900" />
                                        <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="New password" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium text-slate-900" />
                                        <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Confirm new password" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium text-slate-900" />
                                        <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password strength</p>
                                                <p className="text-sm font-bold text-slate-900 mt-1">{passwordStrength}</p>
                                            </div>
                                            <button type="button" onClick={handlePasswordChange} className="px-4 py-2 rounded-xl bg-brand-900 text-white text-xs font-black uppercase tracking-widest">Update</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="divide-y divide-slate-100">
                                {[
                                    { key: 'biometric', title: 'Biometric unlock', note: 'Protect quick app access with fingerprint or face unlock.' },
                                    { key: 'twoFactor', title: 'Two-factor authentication', note: 'Add a second layer of protection for sign-in and wallet actions.' },
                                    { key: 'sessionLock', title: 'Session auto-lock', note: 'Require account unlock after inactivity or long background time.' }
                                ].map(option => <SettingToggleRow key={option.key} option={option} />)}
                            </div>
                        </div>
                    )}

                    {activeSection === 'notifications' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-4 border-b border-slate-100">
                                <p className="font-bold text-slate-900 text-sm">Alert delivery</p>
                                <p className="text-xs text-slate-500 mt-1">Choose which updates deserve your attention first.</p>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {[
                                    { key: 'push', title: 'Push notifications', note: 'Receive immediate alerts for confirmations, returns, and claims.' },
                                    { key: 'rentalAlerts', title: 'Rental status updates', note: 'Get notified when escrow, pickup, or return status changes.' },
                                    { key: 'messageAlerts', title: 'Message alerts', note: 'Surface new inbox replies and meetup chat activity.' },
                                    { key: 'campusAlerts', title: 'Campus announcements', note: 'Receive safety and platform notices relevant to USTP CDO.' },
                                    { key: 'marketingEmails', title: 'Product updates', note: 'Occasional feature updates, promos, and platform improvements.' }
                                ].map(option => <SettingToggleRow key={option.key} option={option} />)}
                            </div>
                            <div className="p-4">
                                <button onClick={async () => {
                                    addToast('Testing notifications', 'Attempting to send a test notification...');
                                    try {
                                        await registerServiceWorkerAndSubscribe();
                                    } catch (e) { console.warn(e); }
                                    try {
                                        await fetch('/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Lendora test', body: 'This is a test notification.' }) });
                                        addToast('Push server', 'Sent test notify request to server');
                                    } catch (e) {
                                        addToast('Push server', 'Could not reach push-server. Server may be offline.');
                                    }
                                }} className="w-full bg-white border border-slate-200 py-3 rounded-xl text-sm font-bold">Send test notification</button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'privacy' && (
                        <div className="space-y-3">
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                <p className="font-bold text-slate-900 text-sm">Profile visibility</p>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{profileVisibilityMeta.note}</p>
                                <select value={settings.profileVisibility} onChange={(e) => updateSettings({ profileVisibility: e.target.value })} className="w-full mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm text-slate-900 focus:ring-2 focus:ring-brand-500">
                                    {PROFILE_VISIBILITY_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                                </select>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                <p className="font-bold text-slate-900 text-sm">Who can start a message thread</p>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{messagePrivacyMeta.note}</p>
                                <select value={settings.messagePrivacy} onChange={(e) => updateSettings({ messagePrivacy: e.target.value })} className="w-full mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm text-slate-900 focus:ring-2 focus:ring-brand-500">
                                    {MESSAGE_PRIVACY_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                                </select>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-4 py-4 border-b border-slate-100">
                                    <p className="font-bold text-slate-900 text-sm">Live visibility</p>
                                    <p className="text-xs text-slate-500 mt-1">These controls affect how available and responsive your account looks to others.</p>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {[
                                        { key: 'showOnlineStatus', title: 'Show online status', note: 'Let other users know when you are active and available to reply.' },
                                        { key: 'readReceipts', title: 'Send read receipts', note: 'Tell chat partners when you have already read their latest update.' },
                                        { key: 'locationSharing', title: 'Show live meetup readiness', note: 'Use profile and thread hints to indicate when location access is enabled.' }
                                    ].map(option => <SettingToggleRow key={option.key} option={option} />)}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'safety' && (
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">Blocked users</p>
                                    <p className="text-xs text-slate-500 mt-1">Muted accounts cannot message you or appear in quick discovery paths.</p>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{blockedUsers.length} blocked</span>
                            </div>
                            {blockedUsers.length === 0 ? (
                                <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                                    <p className="text-sm font-bold text-slate-900">No blocked users</p>
                                    <p className="text-xs text-slate-500 mt-1">Your inbox is currently controlled by your message privacy rules.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {blockedUsers.map(blocked => (
                                        <div key={blocked.id} className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <img src={blocked.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{blocked.name}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Blocked from messages</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => handleUnblock(blocked.id)} className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600">Unblock</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {blockSuggestions.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Quick safety actions</p>
                                    <div className="flex flex-wrap gap-2">
                                        {blockSuggestions.map(candidate => (
                                            <button key={candidate.id} type="button" onClick={() => handleQuickBlock(candidate)} className="px-3 py-2 rounded-full bg-brand-50 border border-brand-200 text-[10px] font-black uppercase tracking-widest text-brand-700">
                                                Block {candidate.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'data' && (
                        <div className="space-y-3">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <button type="button" onClick={handleExportRequest} className="w-full px-4 py-4 text-left flex justify-between items-center gap-3 hover:bg-slate-50 active:scale-[0.99] transition-all border-b border-slate-100">
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Download account data</p>
                                        <p className="text-xs text-slate-500 mt-1">Bundle rentals, wallet history, chat logs, and profile details.</p>
                                    </div>
                                    <i className="ph ph-download-simple text-slate-400 text-lg"></i>
                                </button>
                                <button type="button" onClick={onOpenTerms} className="w-full px-4 py-4 text-left flex justify-between items-center gap-3 hover:bg-slate-50 active:scale-[0.99] transition-all border-b border-slate-100">
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Terms and privacy rules</p>
                                        <p className="text-xs text-slate-500 mt-1">Review platform fees, privacy handling, and safety policy details.</p>
                                    </div>
                                    <i className="ph ph-file-text text-slate-400 text-lg"></i>
                                </button>
                                <button type="button" onClick={onOpenHelp} className="w-full px-4 py-4 text-left flex justify-between items-center gap-3 hover:bg-slate-50 active:scale-[0.99] transition-all">
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Support and recovery help</p>
                                        <p className="text-xs text-slate-500 mt-1">Get help with claims, access issues, wallet actions, or disputes.</p>
                                    </div>
                                    <i className="ph ph-lifebuoy text-slate-400 text-lg"></i>
                                </button>
                            </div>
                            <div className="bg-red-50 p-4 rounded-2xl border border-red-200 shadow-sm">
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <div>
                                        <p className="font-bold text-red-600 text-sm">Delete account</p>
                                        <p className="text-xs text-red-500 mt-1">Start a permanent deletion review for your account and platform data.</p>
                                    </div>
                                    <button type="button" onClick={() => setDeleteConfirm(prev => !prev)} className="px-3 py-2 rounded-xl bg-white border border-red-200 text-[10px] font-black uppercase tracking-widest text-red-500">{deleteConfirm ? 'Hide' : 'Review'}</button>
                                </div>
                                {deleteConfirm && (
                                    <div className="mt-4 pt-4 border-t border-red-200 flex gap-2">
                                        <button type="button" onClick={() => setDeleteConfirm(false)} className="flex-1 py-3 rounded-xl bg-white text-red-600 font-bold text-sm border border-red-200">Cancel</button>
                                        <button type="button" onClick={() => { setDeleteConfirm(false); setSettingsNotice('Account deletion review has been queued. Support will require a final confirmation before removal.'); }} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm">Request Deletion</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {settingsNotice && (
                        <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-xs font-bold text-brand-900 leading-relaxed">
                            {settingsNotice}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const NavBtn = ({ active, icon, label, onClick, badge }) => (
        <button onClick={onClick} className={`nav-btn relative active:scale-90 ${active ? 'active' : ''}`}>
            <i className={`ph ${icon} ${active ? 'ph-fill' : ''} text-lg leading-none`}></i>
            <span className={`text-[8px] font-black uppercase tracking-widest leading-none whitespace-nowrap ${active ? 'text-brand-900' : 'text-slate-500'}`}>{label}</span>
            {badge && <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-alert rounded-full"></div>}
        </button>
    );

    const NotificationsView = ({ notifications, setNotifications, onBack }) => {
        const [filter, setFilter] = useState('all');
        const unreadCount = notifications.filter(n => !n.read).length;
        const rentalCount = notifications.filter(n => n.type === 'rental').length;
        const messageCount = notifications.filter(n => n.type === 'message').length;
        const visibleNotifications = notifications.filter(notification => filter === 'all' ? true : filter === 'unread' ? !notification.read : notification.type === filter);

        const markAllRead = () => setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
        const clearVisible = () => setNotifications(prev => prev.filter(notification => !(filter === 'all' ? true : filter === 'unread' ? !notification.read : notification.type === filter)));

        return (
            <div className="flex-1 min-h-0 flex flex-col bg-slate-50">
                <header className="px-6 pt-14 pb-4 bg-white border-b border-slate-100 shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
                            <p className="text-xs font-medium text-slate-500 mt-1">{unreadCount} unread update{unreadCount === 1 ? '' : 's'} in one account feed.</p>
                        </div>
                        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 active:scale-90 transition-transform"><i className="ph ph-arrow-left text-lg"></i></button>
                    </div>
                    <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'all', label: `All (${notifications.length})` },
                            { id: 'unread', label: `Unread (${unreadCount})` },
                            { id: 'rental', label: `Rentals (${rentalCount})` },
                            { id: 'message', label: `Messages (${messageCount})` },
                            { id: 'system', label: 'System' }
                        ].map(option => (
                            <button key={option.id} type="button" onClick={() => setFilter(option.id)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === option.id ? 'bg-brand-900 text-white shadow-sm' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}>
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                        <button onClick={markAllRead} className="flex-1 py-3 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-700">Mark All Read</button>
                        <button onClick={clearVisible} className="flex-1 py-3 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-700">Clear Visible</button>
                    </div>
                </header>
                <div className="flex-1 min-h-0 overflow-y-auto custom-scroll px-6 pb-28 pt-6 space-y-3">
                    {visibleNotifications.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center">
                            <p className="text-sm font-bold text-slate-900 mb-1">No matching notifications</p>
                            <p className="text-xs text-slate-500 font-medium">Try another filter or wait for the next account update.</p>
                        </div>
                    ) : visibleNotifications.map(n => {
                        const iconMeta = n.type === 'rental'
                            ? { tone: 'bg-brand-100 text-brand-600', icon: 'ph-bag', badge: 'Rental' }
                            : n.type === 'message'
                                ? { tone: 'bg-blue-100 text-blue-600', icon: 'ph-chat-circle', badge: 'Message' }
                                : { tone: 'bg-slate-100 text-slate-600', icon: 'ph-info', badge: 'System' };

                        return (
                            <motion.button initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} key={n.id} onClick={() => setNotifications(prev => prev.map(entry => entry.id === n.id ? { ...entry, read: true } : entry))} className={`w-full p-4 rounded-2xl cursor-pointer transition-all active:scale-95 text-left ${!n.read ? 'bg-brand-50 border-2 border-brand-300 shadow-sm' : 'bg-white border border-slate-200'}`}>
                                <div className="flex gap-3 items-start">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconMeta.tone}`}>
                                        <i className={`ph-fill text-lg ${iconMeta.icon}`}></i>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-3">
                                            <div>
                                                <h4 className="font-black text-sm text-slate-900">{n.title}</h4>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{iconMeta.badge} • {n.time}</p>
                                            </div>
                                            {!n.read && <span className="px-2 py-1 rounded-full bg-brand-900 text-white text-[8px] font-black uppercase tracking-widest flex-shrink-0">New</span>}
                                        </div>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed mt-2">{n.message}</p>
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const ReviewView = ({ rental, onSubmit, onBack }) => {
        const [rating, setRating] = useState(5);
        const [comment, setComment] = useState('');
        const [isSubmitting, setIsSubmitting] = useState(false);
        const handleSubmit = () => {
            setIsSubmitting(true);
            setTimeout(() => {
                onSubmit({ itemId: rental.itemId || rental.id, reviewer: CURRENT_USER, rating, comment, date: 'Just now' });
                setIsSubmitting(false);
            }, 1500);
        };
        const ratingTexts = ['Poor', 'Fair', 'Good', 'Excellent', 'Amazing', 'Perfect'];
        return (
            <div className="flex-1 min-h-0 flex flex-col bg-slate-50 relative z-[100]">
                <header className="absolute top-0 left-0 right-0 pt-12 pb-4 px-4 z-50 blur-header flex items-center"><button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-900 active:scale-90 transition-transform"><i className="ph ph-arrow-left text-lg"></i></button><h1 className="text-lg font-black text-slate-900 ml-3">Leave a Review</h1></header>
                <div className="flex-1 min-h-0 overflow-y-auto pt-28 p-6 space-y-6 custom-scroll">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex gap-4 items-center mb-6">
                            <img src={rental.images[0]} className="w-16 h-16 rounded-xl object-cover border border-slate-100" />
                            <div><h3 className="font-bold text-slate-900 text-lg">{rental.name}</h3><p className="text-sm text-slate-500">How was your experience?</p></div>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <div className="flex justify-between items-center mb-3"><p className="text-sm font-bold text-slate-700">Rating</p><p className="text-sm font-black text-brand-600">{ratingTexts[rating-1]}</p></div>
                                <div className="flex gap-2">
                                    {[1,2,3,4,5].map(s => <button key={s} onClick={() => setRating(s)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all text-lg ${rating >= s ? 'bg-brand-accent text-brand-950 scale-110 shadow-md' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`}><i className="ph-fill ph-star"></i></button>)}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700 mb-2">Comment (Optional)</p>
                                <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your thoughts about the experience..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 resize-none text-sm" rows="4"></textarea>
                            </div>
                        </div>
                    </div>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-brand-900 text-white font-black py-4 rounded-xl shadow-md text-base hover:bg-brand-950 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">{isSubmitting ? <><i className="ph-bold ph-spinner animate-spin"></i> Submitting...</> : <>✓ Submit Review</>}</motion.button>
                </div>
            </div>
        );
    };

    const AnalyticsView = ({ user, items, rentals, reqs, savedSearches, onBack, onSelectItem }) => {
        const analytics = getLenderAnalytics(user, items, rentals, reqs, savedSearches);
        return (
            <div className="flex-1 min-h-0 flex flex-col bg-slate-50">
                <header className="px-6 pt-14 pb-4 bg-white border-b border-slate-100 shrink-0 flex items-center gap-3">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 active:scale-90 transition-transform"><i className="ph ph-arrow-left text-lg"></i></button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lender Analytics</h1>
                        <p className="text-xs font-medium text-slate-500 mt-1">Demand, pricing, trust, and watchlist signals in one place.</p>
                    </div>
                </header>
                <div className="flex-1 min-h-0 overflow-y-auto custom-scroll px-6 pb-28 pt-5 space-y-5">
                    <div className="campus-hero rounded-[26px] p-5">
                        <div className="relative z-10 grid grid-cols-2 gap-3">
                            <div className="campus-mini-stat rounded-2xl p-3"><p className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-100/80">Live Listings</p><p className="text-2xl font-black mt-1">{analytics.liveListings}</p></div>
                            <div className="campus-mini-stat rounded-2xl p-3"><p className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-100/80">Completion</p><p className="text-2xl font-black mt-1">{analytics.completionRate}%</p></div>
                            <div className="campus-mini-stat rounded-2xl p-3"><p className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-100/80">Revenue</p><p className="text-xl font-black mt-1">₱{analytics.totalRevenue.toLocaleString()}</p></div>
                            <div className="campus-mini-stat rounded-2xl p-3"><p className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-100/80">Watch Hits</p><p className="text-2xl font-black mt-1">{analytics.watchHits}</p></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-700">Pricing Health</p>
                                <p className="text-sm font-semibold text-slate-600 mt-1">Average live rate is ₱{analytics.avgRate || 0}/day.</p>
                            </div>
                            <span className="px-3 py-2 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-black uppercase tracking-widest text-amber-800">{analytics.overpricedListings} above guide</span>
                        </div>
                        <div className="space-y-3 mt-4">
                            {analytics.myItems.slice(0, 4).map((item) => {
                                const rateBand = CATEGORY_RATE_GUIDE[item.category] || CATEGORY_RATE_GUIDE.General;
                                const isHigh = item.priceDaily > rateBand[1];
                                return (
                                    <button key={`analytics-${item.id}`} type="button" onClick={() => onSelectItem(item)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                                                <p className="text-[10px] font-semibold text-slate-500 mt-1">{item.category} • Guide ₱{rateBand[0]}-₱{rateBand[1]}/day</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isHigh ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>₱{item.priceDaily}/day</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-700">Demand You Can Win</p>
                        <div className="space-y-3 mt-4">
                            {analytics.demandMatches.length === 0 ? (
                                <p className="text-sm font-medium text-slate-500">No request matches yet. Better category coverage or student pricing will surface more demand here.</p>
                            ) : analytics.demandMatches.slice(0, 4).map(({ request, matches }) => (
                                <div key={`analytics-demand-${request.id}`} className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
                                    <p className="text-sm font-bold text-slate-900">{request.title}</p>
                                    <p className="text-[10px] font-semibold text-slate-500 mt-1">{request.dateNeeded} • {request.budget}</p>
                                    <p className="text-xs font-medium text-brand-700 mt-2">Best fit: {matches[0]?.item?.name} at {matches[0]?.score}% match</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ProfileView = ({ user, wallet, setView, onLogout, notifications, rentals, items, settings, chats, savedSearches, reviews }) => {
        const listedItems = items.filter(item => item.owner.id === user.id);
        const completed = rentals.filter(r => r.status === 'Completed').length;
        const activeRentals = rentals.filter(r => r.status === 'Active' || r.status === 'Authorized').length;
        const unreadNotifications = notifications.filter(n => !n.read).length;
        const unreadChats = chats.filter(thread => thread.unread > 0).length;
        const trustSnapshot = getTrustSnapshot(user, rentals, items, reviews);
        const verificationSteps = [
            user.phoneVerified,
            !!(user.campusEmail || user.email),
            user.idUploaded,
            user.studentVerified
        ];
        const accountCompletion = Math.round((verificationSteps.filter(Boolean).length / verificationSteps.length) * 100);
        const primaryEmail = user.campusEmail || user.email || 'Add your USTP email';
        const maskedPhone = user.phone ? `${user.phone.slice(0, 4)} ••• ${user.phone.slice(-3)}` : 'Add your mobile number';
        const profileVisibilityMeta = PROFILE_VISIBILITY_OPTIONS.find(option => option.id === settings.profileVisibility) || PROFILE_VISIBILITY_OPTIONS[0];
        const quickStats = [
            { label: 'Listings', value: listedItems.length },
            { label: 'Active', value: activeRentals },
            { label: 'Done', value: completed }
        ];
        const primaryActions = [
            { label: 'My Rentals', action: () => setView('activity'), tone: 'bg-brand-900 text-white border-brand-900' },
            { label: 'My Listings', action: () => setView('my-listings'), tone: 'bg-white text-slate-700 border-slate-200' },
            { label: 'Wallet', action: () => setView('payments'), tone: 'bg-amber-50 text-amber-800 border-amber-200' }
        ];
        const accountLinks = [
            { icon: 'ph-fingerprint', label: 'Verification Center', note: user.studentVerified ? 'Your student account is verified.' : 'Finish your student verification.', action: () => setView('identity') },
            { icon: 'ph-bell', label: 'Notifications', note: unreadNotifications > 0 ? `${unreadNotifications} unread update${unreadNotifications === 1 ? '' : 's'}.` : 'Nothing important waiting.', action: () => setView('notifications') },
            { icon: 'ph-chart-line-up', label: 'Lender Analytics', note: `${listedItems.length} listings • ${trustSnapshot.score}/100 trust`, action: () => setView('analytics') },
            { icon: 'ph-bookmark-simple', label: 'Saved Searches', note: `${savedSearches.length} watchlist${savedSearches.length === 1 ? '' : 's'} active.`, action: () => setView('saved') },
            { icon: 'ph-gear', label: 'Settings', note: profileVisibilityMeta.label, action: () => setView('settings') }
        ];
        const detailRows = [
            { icon: 'ph-envelope-simple', label: 'School email', value: primaryEmail },
            { icon: 'ph-device-mobile-camera', label: 'Phone', value: maskedPhone },
            { icon: 'ph-wallet', label: 'Wallet', value: `₱${wallet.toLocaleString()}` },
            { icon: 'ph-chat-circle', label: 'Chats', value: `${unreadChats} unread` }
        ];

        return (
            <div className="flex-1 min-h-0 flex flex-col bg-slate-50">
                <div className="flex-1 min-h-0 overflow-y-auto custom-scroll px-4 pt-14 pb-28 space-y-4">
                    <div className="bg-white rounded-[28px] border border-brand-100 shadow-[0_18px_40px_-30px_rgba(30,58,138,0.35)] overflow-hidden">
                        <div className="px-5 pt-5 pb-4 bg-gradient-to-br from-brand-100 via-white to-amber-50">
                            <div className="flex items-start gap-4">
                                <img src={user.avatar} className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand-700">USTP Student Profile</p>
                                    <h1 className="text-2xl font-black text-slate-900 leading-tight mt-1">{user.name}</h1>
                                    <p className="text-sm font-medium text-slate-500 mt-1">{user.title}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.studentVerified ? 'bg-brand-50 text-brand-700 border-brand-100' : 'bg-white text-slate-500 border-slate-200'}`}>
                                    {user.studentVerified ? 'Verified student' : 'Verification pending'}
                                </span>
                                <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600">
                                    {accountCompletion}% complete
                                </span>
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="grid grid-cols-3 gap-2">
                                {quickStats.map(stat => (
                                    <div key={stat.label} className="rounded-2xl bg-slate-50 border border-slate-200 px-3 py-3 text-center">
                                        <p className={`text-lg font-black ${stat.label === 'Active' ? 'text-amber-700' : 'text-brand-900'}`}>{stat.value}</p>
                                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-3 gap-2 mt-3">
                                {primaryActions.map(action => (
                                    <button key={action.label} onClick={action.action} className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest ${action.tone}`}>
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4">
                        <h2 className="text-base font-black text-slate-900">Essentials</h2>
                        <div className="space-y-3 mt-3">
                            {detailRows.map((row) => (
                                <div key={row.label} className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200 px-3 py-3">
                                    <div className="w-9 h-9 rounded-full bg-white border border-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                                        <i className={`ph ${row.icon} text-base`}></i>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{row.label}</p>
                                        <p className="text-sm font-medium text-slate-900 truncate mt-1">{row.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-base font-black text-slate-900">Trust & Reliability</h2>
                                <p className="text-xs font-medium text-slate-500 mt-1">{trustSnapshot.label}</p>
                            </div>
                            <span className="px-3 py-2 rounded-full bg-brand-50 border border-brand-100 text-sm font-black text-brand-700">{trustSnapshot.score}/100</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-3 py-3 text-center">
                                <p className="text-lg font-black text-brand-900">{trustSnapshot.completed}</p>
                                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mt-1">Completed</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-3 py-3 text-center">
                                <p className="text-lg font-black text-brand-900">{trustSnapshot.noShows}</p>
                                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mt-1">No-shows</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-3 py-3 text-center">
                                <p className="text-lg font-black text-brand-900">{trustSnapshot.lateReturns}</p>
                                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mt-1">Late</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
                        {accountLinks.map((link, index) => (
                            <button
                                key={link.label}
                                onClick={link.action}
                                className={`w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 hover:bg-slate-50 active:scale-[0.99] transition-all ${index !== accountLinks.length - 1 ? 'border-b border-slate-100' : ''}`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                                        <i className={`ph ${link.icon} text-base`}></i>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-900 text-sm">{link.label}</p>
                                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{link.note}</p>
                                    </div>
                                </div>
                                <i className="ph ph-caret-right text-slate-300 text-lg shrink-0"></i>
                            </button>
                        ))}
                    </div>

                    <button onClick={onLogout} className="w-full py-3.5 text-[10px] font-black text-red-500 uppercase tracking-[0.22em] bg-white rounded-2xl border border-red-100 shadow-sm transition-colors hover:bg-red-50 active:bg-red-100">
                        Sign Out
                    </button>
                </div>
            </div>
        );
    };

    // --- MAIN APP COMPONENT ---
    const App = () => {
        const [view, setView] = useState('onboarding'); 
        const [history, setHistory] = useState([]); 
        const [userMode, setUserMode] = useState('renter'); // 'renter' or 'lender'
        
        const [user, setUser] = useState(CURRENT_USER);
        const [wallet, setWallet] = useState(5000);
        const [items, setItems] = useState(INITIAL_ITEMS);
        const [reqs, setReqs] = useState(INITIAL_REQUESTS);
        const [savedItems, setSavedItems] = useState([]);
        const [savedSearches, setSavedSearches] = usePersistentState('saved-searches', []);
        const [rentals, setRentals] = usePersistentState('rentals', []);
        const notificationTimersRef = useRef({});
        const [chats, setChats] = useState(() => INBOX_MOCK.map(createChatThread));
        const [ledger, setLedger] = useState([{ id: 1, ref: 'Initial Deposit', amount: 5000, date: 'Today' }]);
        const [settings, setSettings] = useState({
            push: true,
            biometric: true,
            darkMode: false,
            rentalAlerts: true,
            messageAlerts: true,
            campusAlerts: true,
            marketingEmails: false,
            twoFactor: false,
            sessionLock: true,
            readReceipts: true,
            showOnlineStatus: true,
            locationSharing: true,
            profileVisibility: 'students',
            messagePrivacy: 'linked-only'
        });
        const [blockedUsers, setBlockedUsers] = useState([]);

        useEffect(() => {
            markLendoraBooted();
        }, []);

        useEffect(() => {
            document.body.classList.toggle('dark', settings.darkMode);
            return () => document.body.classList.remove('dark');
        }, [settings.darkMode]);

        useEffect(() => {
            Object.assign(CURRENT_USER, user);
        }, [user]);

        useEffect(() => {
            const handleOnline = () => setIsOnline(true);
            const handleOffline = () => setIsOnline(false);
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('sw.js').catch((error) => {
                    console.warn('Service worker registration failed', error);
                });
            }

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }, []);
        
        const [paymentMethods, setPaymentMethods] = useState([
            { id: 'gcash_1', type: 'gcash', name: 'GCash', detail: '0917 ••• 4321' },
            { id: 'card_1', type: 'card', name: 'BPI Debit', detail: '•••• 1234' }
        ]);
        
        const [selectedItem, setSelectedItem] = useState(null);
        const [selectedUser, setSelectedUser] = useState(null);
        const [activeChatId, setActiveChatId] = useState(null);
        const [chatPartner, setChatPartner] = useState(null);
        const [chatItem, setChatItem] = useState(null);
        const [flowIsReturn, setFlowIsReturn] = useState(false);
        
        const [isHourly, setIsHourly] = useState(false);
        const [duration, setDuration] = useState(1);
        const [ins, setIns] = useState(false);

        const [notifications, setNotifications] = usePersistentState('notifications', [
            { id: 1, type: 'rental', title: 'Rental Confirmed', message: 'Your rental of Sony A7 IV has been confirmed.', time: '2 hours ago', read: false },
            { id: 2, type: 'message', title: 'New Message', message: 'Dave C. sent you a message.', time: '1 hour ago', read: false },
            { id: 3, type: 'system', title: 'Welcome to Lendora', message: 'Complete your profile to start lending and borrowing.', time: '1 day ago', read: true }
        ]);
        const [following, setFollowing] = useState([]);
        const [isOnline, setIsOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
        const [reviews, setReviews] = usePersistentState('reviews', [
            { id: 1, itemId: 1, reviewer: CURRENT_USER, rating: 5, comment: 'Amazing camera! Worked perfectly for my project.', date: '2 days ago' },
            { id: 2, itemId: 2, reviewer: USERS['elena'], rating: 4, comment: 'Good gimbal, but needs better instructions.', date: '1 week ago' }
        ]);

        // Toasts (temporary in-app toasts)
        const [toasts, setToasts] = useState([]);
        const addToast = (title, body, ttl = 4500) => {
            const id = Date.now() + Math.random();
            setToasts(prev => [{ id, title, body }, ...prev]);
            // auto remove
            setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), ttl);
            // play simple beep
            try { playBeep(); } catch (e) {}
        };

        const playBeep = () => {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine'; o.frequency.value = 880;
                g.gain.value = 0.05;
                o.connect(g); g.connect(ctx.destination);
                o.start();
                setTimeout(() => { o.stop(); ctx.close(); }, 180);
            } catch (e) { /* ignore */ }
        };
        const [locationEnabled, setLocationEnabled] = usePersistentState('location-enabled', true);
        const [userLocation, setUserLocation] = useState(DEFAULT_USER_LOCATION);
        const [locationRefreshNonce, setLocationRefreshNonce] = useState(0);

        const navigateTo = (newView) => { setHistory(prev => [...prev, view]); setView(newView); };
        const goBack = () => {
            if (history.length > 0) {
                const prev = history[history.length - 1];
                setHistory(history.slice(0, -1));
                setView(prev);
            } else { setView('explore'); }
        };

        useEffect(() => {
            if (!locationEnabled) {
                setUserLocation({
                    ...DEFAULT_USER_LOCATION,
                    loading: false,
                    error: 'Location turned off. Using USTP CDO campus center.',
                    updatedAt: Date.now()
                });
                return;
            }

            if (typeof navigator === 'undefined' || !navigator.geolocation) {
                setUserLocation({
                    ...DEFAULT_USER_LOCATION,
                    loading: false,
                    source: 'unsupported',
                    error: 'Location is not supported on this browser. Using USTP CDO campus center.',
                    updatedAt: Date.now()
                });
                return;
            }

            let cancelled = false;
            setUserLocation(prev => ({ ...prev, loading: true, error: '' }));

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    if (cancelled) return;

                    const gpsCoords = [position.coords.latitude, position.coords.longitude];
                    const distanceFromCampus = getDistanceMeters(gpsCoords, USTP_CDO_CENTER);
                    const sharedAccuracy = Number.isFinite(position.coords.accuracy) ? Math.round(position.coords.accuracy) : null;

                    if (distanceFromCampus > 1500) {
                        setUserLocation({
                            ...DEFAULT_USER_LOCATION,
                            loading: false,
                            source: 'off-campus',
                            accuracy: sharedAccuracy,
                            error: 'Outside USTP CDO. Showing the campus map instead.',
                            updatedAt: Date.now()
                        });
                        return;
                    }

                    setUserLocation({
                        coords: clampToCampus(gpsCoords),
                        source: 'gps',
                        accuracy: sharedAccuracy,
                        error: '',
                        loading: false,
                        updatedAt: Date.now()
                    });
                },
                () => {
                    if (cancelled) return;
                    setUserLocation({
                        ...DEFAULT_USER_LOCATION,
                        loading: false,
                        source: 'permission-denied',
                        error: 'Location permission blocked. Using USTP CDO campus center.',
                        updatedAt: Date.now()
                    });
                },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
            );

            return () => {
                cancelled = true;
            };
        }, [locationEnabled, locationRefreshNonce]);

        const marketplaceUnlocked = true;
        const refreshLocation = () => setLocationRefreshNonce(prev => prev + 1);
        const toggleLocation = () => setLocationEnabled(prev => !prev);

        const handleLogin = ({ method, identifier }) => {
            const normalizedIdentifier = method === 'phone'
                ? identifier.replace(/\D/g, '').slice(0, 11)
                : identifier.trim().toLowerCase();

            setUser(prev => ({
                ...prev,
                ...(method === 'email'
                    ? {
                        email: normalizedIdentifier,
                        campusEmail: normalizedIdentifier.includes('ustp.edu.ph') ? normalizedIdentifier : prev.campusEmail,
                        emailVerified: true,
                        verificationStatus: prev.studentVerified && prev.idUploaded ? 'Approved' : 'Login Verified'
                    }
                    : {
                        phone: normalizedIdentifier,
                        phoneVerified: true,
                        verificationStatus: prev.studentVerified && prev.idUploaded ? 'Approved' : 'Signed In'
                    })
            }));
            setView('explore');
        };

        const handleSave = (item) => {
            if (savedItems.find(s => s.id === item.id)) setSavedItems(savedItems.filter(s => s.id !== item.id));
            else setSavedItems([...savedItems, item]);
        };

        const handleSaveSearch = (searchConfig) => {
            const queryKey = `${searchConfig.query || ''}|${searchConfig.category || 'All'}|${searchConfig.needFilter || 'all'}|${searchConfig.maxPrice || ''}|${searchConfig.minRating || 0}`;
            const exists = savedSearches.some((entry) => `${entry.query || ''}|${entry.category || 'All'}|${entry.needFilter || 'all'}|${entry.maxPrice || ''}|${entry.minRating || 0}` === queryKey);
            if (exists) {
                addToast('Search already saved', 'That watchlist is already active.');
                return;
            }
            setSavedSearches((prev) => [{ id: `search_${Date.now()}`, ...searchConfig }, ...prev]);
            addToast('Saved search added', 'You will see matching items and price-drop alerts here.');
        };

        const handleRemoveSavedSearch = (searchId) => {
            setSavedSearches((prev) => prev.filter((entry) => entry.id !== searchId));
        };

        const upsertChatThread = (seed) => {
            let resolvedThread = null;
            setChats(prev => {
                const existing = prev.find(c => c.id === seed.id || (seed.rentalId && c.rentalId === seed.rentalId) || (seed.item?.id && c.item?.id === seed.item.id && c.owner?.id === seed.owner?.id));
                resolvedThread = createChatThread(existing ? { ...existing, ...seed, unread: seed.unread ?? existing.unread } : { ...seed, id: seed.id || `c_${Date.now()}` });
                return [resolvedThread, ...prev.filter(c => c.id !== resolvedThread.id)];
            });
            return resolvedThread || createChatThread(seed);
        };

        const syncChatThread = (chatId, updates) => {
            setChats(prev => {
                const currentThread = prev.find(thread => thread.id === chatId);
                if (!currentThread) return prev;
                const nextThread = createChatThread({ ...currentThread, ...updates, unread: 0 });
                return [nextThread, ...prev.filter(thread => thread.id !== chatId)];
            });
        };

        const openChatThread = (seed) => {
            const thread = upsertChatThread({ ...seed, unread: 0 });
            setActiveChatId(thread.id);
            setChatPartner(thread.owner);
            setChatItem(thread.item);
            navigateTo('chat');
        };

        const handleSubmitReview = (review) => {
            const nextId = Date.now();
            const newReview = { id: nextId, ...review, date: 'Just now' };
            setReviews(prev => [newReview, ...prev]);

            // update item average rating (if item exists in items list)
            setItems(prevItems => {
                const itemsCopy = prevItems.map(it => ({ ...it }));
                const targetIndex = itemsCopy.findIndex(it => it.id === review.itemId);
                if (targetIndex === -1) return prevItems;
                const target = itemsCopy[targetIndex];
                // compute average from existing reviews plus this one
                const existing = reviews.filter(r => r.itemId === review.itemId).map(r => r.rating);
                const allRatings = [...existing, review.rating];
                const avg = allRatings.reduce((s, v) => s + v, 0) / allRatings.length;
                itemsCopy[targetIndex] = { ...target, rating: Math.round(avg * 10) / 10 };
                return itemsCopy;
            });
        };

        const handleCheckoutConfirm = (total, deposit, method, scheduleWindow, lateFeePerHour) => {
            if (!selectedItem || !scheduleWindow) return;
            if (hasBookingConflict(selectedItem.id, scheduleWindow.startTs, scheduleWindow.endTs, rentals)) {
                addToast('Schedule conflict', 'That meetup window was just taken. Choose another slot.');
                setView('checkout');
                return;
            }

            let methodText = "Wallet Payment";
            if (method === 'wallet') { setWallet(prev => prev - total); setLedger([{ id: Date.now(), ref: `Rental: ${selectedItem.name}`, amount: -total, date: 'Just now' }, ...ledger]); }
            else if (method === 'cash') methodText = "Cash on Meetup";
            else { const pm = paymentMethods.find(p => p.id === method); methodText = pm ? pm.name : "Card/GCash"; }

            const rentalId = Date.now();
            const threadId = `chat_${rentalId}`;
            const schedule = {
                ...scheduleWindow,
                meetupZone: getMeetupZone(selectedItem),
                status: 'Confirmed',
                noShowGraceMinutes: 20
            };
            const newRental = {
                ...selectedItem,
                id: rentalId,
                itemId: selectedItem.id,
                chatThreadId: threadId,
                type: isHourly ? 'Hours' : 'Days',
                dur: duration,
                status: 'Authorized',
                date: 'Just now',
                borrower: user,
                lender: selectedItem.owner,
                bookingStart: schedule.startTs,
                bookingEnd: schedule.endTs,
                schedule,
                depositHold: deposit,
                escrowTotal: total,
                paymentMethodLabel: methodText,
                lateFeePerHour,
                handoffProofs: []
            };
            setRentals((prev) => [newRental, ...prev]);

            upsertChatThread({
                id: threadId,
                rentalId,
                owner: selectedItem.owner,
                item: selectedItem,
                lastMsg: `Meetup locked for ${schedule.dateLabel} at ${schedule.slotLabel}.`,
                unread: 0,
                time: 'Just now',
                status: 'Authorized',
                priority: selectedItem.insured ? 'Guarded handoff' : 'Meetup ready',
                schedule,
                messages: [
                    ...createDefaultChatMessages(selectedItem),
                    {
                        type: 'received',
                        time: 'Just now',
                        text: `Payment via ${methodText} secured in escrow.`,
                        card: buildScheduleCard(schedule, selectedItem)
                    }
                ]
            });
            setNotifications(prev => [{ id: Date.now(), type: 'rental', title: 'Schedule confirmed', message: `${selectedItem.name} is booked for ${schedule.dateLabel} at ${schedule.slotLabel}.`, time: 'Just now', read: false }, ...prev]);
            setView('success');
        };

        const handleHandoffReturn = (rental, proof) => {
            const proofEntry = proof || null;
            if (flowIsReturn) {
                setRentals(prev => prev.map(r => {
                    if (r.id !== rental.id) return r;
                    const lateFeeApplied = getLateFeeEstimate(r, Date.now());
                    const updated = {
                        ...r,
                        status: 'Completed',
                        completedAt: Date.now(),
                        lateFeeApplied,
                        depositReleased: Math.max(0, Number(r.depositHold || 0) - lateFeeApplied),
                        handoffProofs: [...(r.handoffProofs || []), ...(proofEntry ? [proofEntry] : [])]
                    };
                    if (notificationTimersRef.current[rental.id]) { clearTimeout(notificationTimersRef.current[rental.id]); delete notificationTimersRef.current[rental.id]; }
                    return updated;
                }));
                if (getLateFeeEstimate(rental, Date.now()) > 0) {
                    const lateFeeApplied = getLateFeeEstimate(rental, Date.now());
                    setLedger([{ id: Date.now(), ref: `Late Fee: ${rental.name}`, amount: -lateFeeApplied, date: 'Just now' }, ...ledger]);
                    addToast('Late fee applied', `₱${lateFeeApplied.toLocaleString()} was deducted from the deposit hold.`);
                } else {
                    addToast('Return completed', 'Deposit is ready to release after final review.');
                }
            } else {
                setRentals(prev => prev.map(r => {
                    if (r.id !== rental.id) return r;
                    const startTime = r.bookingStart || Date.now();
                    const endTime = r.bookingEnd || (startTime + (r.type === 'Hours' ? (r.dur || 1) * 60 * 60 * 1000 : (r.dur || 1) * 24 * 60 * 60 * 1000));
                    const updated = {
                        ...r,
                        status: 'Active',
                        startTime,
                        endTime,
                        handoffProofs: [...(r.handoffProofs || []), ...(proofEntry ? [proofEntry] : [])]
                    };
                    scheduleRentalNotifications(updated);
                    return updated;
                }));
                addToast('Pickup verified', 'Handoff proof logged and rental is now active.');
            }

            setChats(prev => prev.map(thread => thread.id === rental.chatThreadId || thread.rentalId === rental.id ? createChatThread({
                ...thread,
                status: flowIsReturn ? 'Completed' : 'Active Rental',
                priority: flowIsReturn ? 'Review ready' : 'Return pending',
                lastMsg: flowIsReturn ? 'Return proof verified. Rental complete.' : 'Pickup proof verified. Rental is now active.',
                time: 'Just now',
                messages: [
                    ...(thread.messages || []),
                    {
                        type: 'received',
                        time: 'Just now',
                        text: flowIsReturn ? 'Return proof was recorded in the thread.' : 'Pickup proof was recorded in the thread.',
                        card: {
                            title: flowIsReturn ? 'Return Proof Logged' : 'Pickup Proof Logged',
                            rows: [
                                { label: 'Timestamp', value: proofEntry?.readableTime || formatDateTimeLabel(Date.now()) },
                                { label: 'Meetup', value: getMeetupZone(rental) },
                                { label: 'Checklist', value: `${proofEntry?.checklist?.length || 0} items confirmed` }
                            ],
                            note: proofEntry?.notes || 'Condition notes are now attached to the rental record.'
                        }
                    }
                ]
            }) : thread));
            setView('activity');
        };

        const handleExtendRental = (rental) => {
            if (!rental || !rental.id) return;
            const choice = window.prompt('Extend by how many minutes? Enter a number (minutes):', '60');
            if (!choice) return;
            const mins = Math.max(1, parseInt(choice, 10) || 0);
            let extensionApplied = false;
            setRentals(prev => prev.map(r => {
                if (r.id !== rental.id) return r;
                const currentEnd = r.endTime || (r.startTime ? r.startTime + ((r.type === 'Hours' ? (r.dur||1) * 3600000 : (r.dur||1) * 86400000)) : Date.now());
                const newEnd = currentEnd + mins * 60 * 1000;
                if (hasBookingConflict(r.itemId || r.id, currentEnd, newEnd, prev, r.id)) {
                    addToast('Extension blocked', 'A later booking already exists for this listing.');
                    return r;
                }
                const updated = { ...r, endTime: newEnd };
                extensionApplied = true;
                scheduleRentalNotifications(updated);
                return updated;
            }));
            if (extensionApplied) addToast('Rental extended', `Extended by ${choice} minutes`);
        };

        const handleReportNoShow = (rental) => {
            if (!rental || rental.status !== 'Authorized') return;
            const confirmed = window.confirm(`Report a no-show for ${rental.name}? This will close the booking and affect the counterparty trust score.`);
            if (!confirmed) return;
            const atFaultUserId = rental.borrower?.id === user.id ? rental.lender?.id : rental.borrower?.id;
            const noShowFee = Math.min(Number(rental.depositHold || 0), Math.max(50, Math.round(getRentalBaseFee(rental) * 0.15)));
            setRentals(prev => prev.map(entry => entry.id === rental.id ? {
                ...entry,
                status: 'No-Show',
                completedAt: Date.now(),
                noShowFee,
                noShow: {
                    reportedBy: user.id,
                    reportedAt: Date.now(),
                    atFaultUserId,
                    note: 'Counterparty did not arrive within the confirmed grace period.'
                }
            } : entry));
            setNotifications(prev => [{ id: Date.now(), type: 'rental', title: 'No-show documented', message: `${rental.name} was closed as a missed meetup. The trust record and refund review were updated.`, time: 'Just now', read: false }, ...prev]);
            addToast('No-show reported', 'The rental was closed and the missed meetup was logged.');
        };

        const requestNotificationPermission = async () => {
            if (typeof window === 'undefined' || typeof Notification === 'undefined') return;
            if (Notification.permission === 'granted') return;
            try { await Notification.requestPermission(); } catch (e) {}
        };

        const showLocalNotification = (title, body) => {
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                try { new Notification(title, { body }); } catch (e) { /* ignore */ }
            } else {
                // fallback: in-app notification list + alert
                setNotifications(prev => [{ id: Date.now(), type: 'system', title, message: body, time: 'Just now', read: false }, ...prev]);
                try { alert(`${title}\n\n${body}`); } catch (e) { /* noop */ }
            }
        };

        const scheduleRentalNotifications = (rental) => {
            if (!rental || !rental.id || !rental.endTime) return;
            // only schedule notifications for clients involved in rental (borrower or lender)
            const isBorrower = user?.id && rental.borrower?.id === user.id;
            const isLender = user?.id && rental.lender?.id === user.id;
            if (!isBorrower && !isLender) return;

            // clear existing timer
            if (notificationTimersRef.current[rental.id]) { clearTimeout(notificationTimersRef.current[rental.id]); delete notificationTimersRef.current[rental.id]; }

            const warnAt = rental.endTime - (15 * 60 * 1000);
            const msUntilWarn = warnAt - Date.now();

            const title = 'Rental Ending Soon';
            const body = `Your rental for \"${rental.name}\" ends at ${new Date(rental.endTime).toLocaleString()}. This is a 15-minute reminder.`;

            if (msUntilWarn <= 0) {
                // if already within 15 minutes, fire immediately
                showLocalNotification(title, body);
            } else {
                const t = setTimeout(() => {
                    showLocalNotification(title, body);
                    delete notificationTimersRef.current[rental.id];
                }, msUntilWarn);
                notificationTimersRef.current[rental.id] = t;
            }
        };

        // Reschedule notifications for active rentals on load and when rentals change
        useEffect(() => {
            requestNotificationPermission();
            rentals.forEach(r => {
                if (r.status === 'Active' && r.endTime) scheduleRentalNotifications(r);
            });
            return () => {
                // clear timers on unmount
                Object.values(notificationTimersRef.current || {}).forEach(t => clearTimeout(t));
                notificationTimersRef.current = {};
            };
        }, []);

        useEffect(() => {
            // keep timers in sync if rentals array changes during session
            rentals.forEach(r => { if (r.status === 'Active' && r.endTime) scheduleRentalNotifications(r); });
        }, [rentals]);

        const startHandoffFlow = (rental, isReturn) => { setSelectedItem(rental); setFlowIsReturn(isReturn); navigateTo('handoff'); }

        const handleTopUp = (amt) => { setWallet(w => w + amt); setLedger([{ id: Date.now(), ref: 'Wallet Top Up', amount: amt, date: 'Just now' }, ...ledger]); };
        const handleWithdraw = (amt) => { setWallet(w => w - amt); setLedger([{ id: Date.now(), ref: 'Wallet Withdraw', amount: -amt, date: 'Just now' }, ...ledger]); };
        const handleAddGcash = (phone) => { setPaymentMethods([...paymentMethods, { id: `gcash_${Date.now()}`, type: 'gcash', name: 'GCash', detail: phone.substring(0,4) + ' ••• ' + phone.slice(-4) }]); };
        const handleAddCard = (info) => { setPaymentMethods([...paymentMethods, { id: `card_${Date.now()}`, type: 'card', name: 'New Card', detail: '•••• ' + info.slice(-4) }]); };

        const handleCreateRequest = (draft) => {
            const budgetNum = Number(draft.budget || 0);
            const nr = {
                id: Date.now(),
                user: user,
                title: draft.title?.trim() || "Requested Item",
                category: draft.category || "General",
                budget: budgetNum > 0 ? `₱${budgetNum.toLocaleString()}/day` : "₱Negotiable",
                dateNeeded: draft.dateNeeded?.trim() || "Flexible",
                details: draft.details?.trim() || "",
                status: "Open",
                offers: []
            };
            setReqs(prev => [nr, ...prev]);
            const matches = getRequestMatches(nr, items, rentals, 3);
            if (matches.length > 0) {
                setNotifications(prev => [{ id: Date.now(), type: 'system', title: 'Smart matches found', message: `${matches.length} listings are a strong fit for "${nr.title}".`, time: 'Just now', read: false }, ...prev]);
                addToast('Smart matches ready', `${matches.length} listings were matched to your request.`);
            }
        };

        const handleCreateListing = (draft) => {
            const dailyRate = Math.min(1000, Math.max(100, Number(draft.priceDaily || 0)));
            const declaredValue = Math.max(1000, Number(draft.value || dailyRate * 20));
            const seed = Date.now();
            const listingLocation = draft.location?.trim() || "ICT Building";
            const newItem = ensureItemAvailability({
                id: Date.now(),
                name: draft.name?.trim() || "New Listing",
                priceDaily: dailyRate,
                priceHourly: Math.max(50, Math.round(dailyRate / 5)),
                category: draft.category || "General",
                condition: draft.condition || "Good",
                location: listingLocation,
                value: declaredValue,
                images: [draft.image?.trim() || "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=800"],
                owner: user,
                rating: 5.0,
                coords: getCampusCoordsForLocation(listingLocation, seed),
                description: draft.description?.trim() || "Newly listed on Lendora.",
                insured: !!draft.insured,
                paused: false
            });
            setItems(prev => [newItem, ...prev]);
            const demandHits = reqs.filter(req => getRequestMatchScore(newItem, req, rentals) >= 25).length;
            if (demandHits > 0) {
                addToast('Demand detected', `${demandHits} active request${demandHits === 1 ? '' : 's'} could match this listing.`);
            }
        };

        const handleToggleListingPause = (itemId) => {
            setItems(prev => prev.map(item => item.id === itemId ? { ...item, paused: !item.paused } : item));
        };

        const handleAdjustListingPrice = (itemId, delta) => {
            setItems(prev => prev.map(item => {
                if (item.id !== itemId) return item;
                const oldPrice = item.priceDaily;
                const nextDaily = Math.min(1000, Math.max(100, item.priceDaily + delta));
                if (nextDaily < oldPrice) {
                    const matchingSearches = savedSearches.filter(searchConfig => doesSavedSearchMatchItem({ ...searchConfig, maxPrice: nextDaily }, { ...item, priceDaily: nextDaily }));
                    if (matchingSearches.length > 0) {
                        setNotifications(prevNotifications => [{ id: Date.now(), type: 'system', title: 'Price-drop alert', message: `${item.name} just dropped to ₱${nextDaily}/day and matches ${matchingSearches.length} saved search${matchingSearches.length === 1 ? '' : 'es'}.`, time: 'Just now', read: false }, ...prevNotifications]);
                    }
                }
                return { ...item, priceDaily: nextDaily, priceHourly: Math.max(50, Math.round(nextDaily / 5)) };
            }));
        };

        const handleOfferRequest = (reqId, note) => {
            setReqs(prev => prev.map(req => {
                if (req.id !== reqId) return req;
                const offers = req.offers || [];
                const existing = offers.find(o => o.lenderId === user.id);
                const nextOffer = { id: existing?.id || Date.now(), lenderId: user.id, lenderName: user.name, note, time: 'Just now' };
                const nextOffers = existing ? offers.map(o => o.lenderId === user.id ? nextOffer : o) : [nextOffer, ...offers];
                return { ...req, offers: nextOffers, status: 'In Review' };
            }));
        };

        const activeChatThread = chats.find(c => c.id === activeChatId) || (chatPartner || chatItem ? createChatThread({ id: activeChatId || 'chat-temp', owner: chatPartner, item: chatItem, unread: 0 }) : null);

        const renderMarketplaceGate = () => <VerificationGateView user={user} onOpenVerification={() => navigateTo('identity')} />;
        const renderMarketplaceHome = () => <ExploreView items={items} reqs={reqs} rentals={rentals} onSelect={(i) => { setSelectedItem(i); navigateTo('detail'); }} onSave={handleSave} saved={savedItems} onCreateRequest={handleCreateRequest} onCreateListing={handleCreateListing} onToggleListingPause={handleToggleListingPause} onAdjustListingPrice={handleAdjustListingPrice} onOfferRequest={handleOfferRequest} savedSearches={savedSearches} onSaveSearch={handleSaveSearch} onRemoveSavedSearch={handleRemoveSavedSearch} onOpenAnalytics={() => navigateTo('analytics')} userMode={userMode} setUserMode={setUserMode} user={user} userLocation={userLocation} locationEnabled={locationEnabled} onRefreshLocation={refreshLocation} onToggleLocation={toggleLocation} />;

        const renderView = () => {
            switch (view) {
                case 'onboarding': return <OnboardingScreen onFinish={() => setView('login')} />;
                case 'login': return <LoginScreen onLogin={handleLogin} />;
                case 'explore': return renderMarketplaceHome();
                case 'detail': return <DetailView item={selectedItem} saved={savedItems.find(s=>s.id === selectedItem.id)} onSave={() => handleSave(selectedItem)} onBack={goBack} onCheckout={() => navigateTo('checkout')} isHourly={isHourly} setIsHourly={setIsHourly} duration={duration} setDuration={setDuration} onUser={() => { setSelectedUser(selectedItem.owner); navigateTo('user-profile'); }} rentals={rentals} ownerTrust={getTrustSnapshot(selectedItem?.owner, rentals, items, reviews)} />;
                case 'checkout': return <CheckoutView item={selectedItem} dur={duration} isHr={isHourly} wallet={wallet} paymentMethods={paymentMethods} rentals={rentals} onCancel={goBack} onConfirm={handleCheckoutConfirm} onAddMethod={() => navigateTo('payments')} />;
                case 'success': return <SuccessView onDone={() => setView('activity')} />;
                case 'user-profile': return <PublicProfileView user={selectedUser} items={items} rentals={rentals} reviews={reviews} onBack={goBack} onSelect={(i) => { setSelectedItem(i); navigateTo('detail'); }} following={following} setFollowing={setFollowing} />;
                case 'saved': return <SavedView saved={savedItems} savedSearches={savedSearches} items={items} onRemoveSearch={handleRemoveSavedSearch} onSelect={(i) => { setSelectedItem(i); navigateTo('detail'); }} />;
                case 'inbox': return <InboxView chats={chats} onOpen={(c) => openChatThread(c)} />;
                case 'chat': return <ChatView thread={activeChatThread} onBack={goBack} onSyncThread={syncChatThread} />;
                case 'activity': return <ActivityView rentals={rentals} onChat={(r) => openChatThread({ id: r.chatThreadId, rentalId: r.id, schedule: r.schedule, owner: r.owner, item: { ...r, id: r.itemId || r.id }, status: r.status === 'Authorized' ? 'Awaiting Meetup' : r.status === 'Active' ? 'Active Rental' : r.status === 'No-Show' ? 'Meetup Issue' : 'Completed', priority: r.status === 'Authorized' ? 'Meetup next' : r.status === 'Active' ? 'Return pending' : 'Review ready' })} onClaim={(r) => navigateTo('claims')} onScan={(r, ret) => startHandoffFlow(r, ret)} onReturn={(r) => startHandoffFlow(r, true)} onDirections={(r) => { setSelectedItem(r); navigateTo('directions'); }} onReview={(r) => { setSelectedItem(r); navigateTo('review'); }} onExtend={(r) => handleExtendRental(r)} onReportNoShow={handleReportNoShow} />;
                case 'directions': return <DirectionsView rental={selectedItem} onBack={goBack} userLocation={userLocation} />;
                case 'handoff': return <HandoffFlow rental={selectedItem} onSuccess={handleHandoffReturn} onCancel={goBack} isReturn={flowIsReturn} />;
                case 'profile': return <ProfileView user={user} wallet={wallet} setView={navigateTo} onLogout={() => setView('login')} notifications={notifications} following={following} rentals={rentals} ledger={ledger} reviews={reviews} items={items} settings={settings} blockedUsers={blockedUsers} chats={chats} savedSearches={savedSearches} />;
                case 'payments': return <WalletHub wallet={wallet} ledger={ledger} paymentMethods={paymentMethods} onTopUp={handleTopUp} onWithdraw={handleWithdraw} onAddGcash={handleAddGcash} onAddCard={handleAddCard} onBack={goBack} />;
                case 'my-listings': return <MyListingsView items={items} rentals={rentals} onBack={goBack} onAdjustPrice={handleAdjustListingPrice} onTogglePause={handleToggleListingPause} onOpenAnalytics={() => navigateTo('analytics')} />;
                case 'analytics': return <AnalyticsView user={user} items={items} rentals={rentals} reqs={reqs} savedSearches={savedSearches} onBack={goBack} onSelectItem={(item) => { setSelectedItem(item); navigateTo('detail'); }} />;
                case 'policy': return <PolicyView onBack={goBack} />;
                case 'claims': return <ClaimsCenter rentals={rentals} onBack={goBack} />;
                case 'identity': return <IdentityVault onBack={goBack} user={user} setUser={setUser} onVerified={() => setView('explore')} />;
                case 'settings': return <SettingsView settings={settings} setSettings={setSettings} blockedUsers={blockedUsers} setBlockedUsers={setBlockedUsers} onBack={goBack} onOpenTerms={() => navigateTo('terms')} onOpenHelp={() => navigateTo('help')} />;
                case 'terms': return <TermsView onBack={goBack} />;
                case 'help': return <HelpCenterView onBack={goBack} />;
                case 'ai-lister': return <ScannerView onCancel={goBack} onDone={(newItem) => { setItems([ensureItemAvailability(newItem), ...items]); setView('explore'); }} />;
                case 'notifications': return <NotificationsView notifications={notifications} setNotifications={setNotifications} onBack={goBack} />;
                case 'review': return <ReviewView rental={selectedItem} onSubmit={(review) => { handleSubmitReview({ ...review, itemId: selectedItem.itemId || selectedItem.id }); goBack(); }} onBack={goBack} />;
                default: return renderMarketplaceHome();
            }
        };

        const showBottomNav = ['explore', 'saved', 'activity', 'inbox', 'profile'].includes(view);

        return (
            <div className="phone-container">
                <div className="premium-orb one"></div>
                <div className="premium-orb two"></div>
                {!isOnline && (
                    <div className="absolute top-4 left-4 right-4 z-[10001] rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Offline Mode</p>
                        <p className="text-xs font-medium text-amber-900 mt-1">Core screens stay available from cache. Local actions still work and will remain on this device.</p>
                    </div>
                )}
                {/* Active View Container */}
                <div className="flex-1 flex flex-col min-h-0 w-full relative">
                    {renderView()}
                </div>
                
                {/* Simplified Bottom Navigation */}
                <AnimatePresence>
                    {showBottomNav && (
                        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="absolute bottom-5 left-5 right-5 h-16 nav-shell rounded-2xl flex items-center gap-1 px-2 z-[9999]">
                            <NavBtn active={view === 'explore'} icon="ph-house" label="Home" onClick={() => setView('explore')} />
                            <NavBtn active={view === 'saved'} icon="ph-heart" label="Saved" onClick={() => setView('saved')} />
                            <NavBtn active={view === 'activity'} icon="ph-calendar-check" label="Activity" onClick={() => setView('activity')} badge={rentals.some(r => ['Authorized', 'Active'].includes(r.status))} />
                            <NavBtn active={view === 'inbox'} icon="ph-chat-circle" label="Inbox" onClick={() => setView('inbox')} badge={chats.some(c => c.unread > 0)} />
                            <NavBtn active={view === 'profile'} icon="ph-user" label="Profile" onClick={() => setView('profile')} />
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Toasts container */}
                <div className="absolute bottom-28 right-6 z-[99999] flex flex-col gap-3">
                    {toasts.map(t => (
                        <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-3 shadow-md w-80">
                            <p className="font-bold text-sm text-slate-900">{t.title}</p>
                            <p className="text-xs text-slate-600 mt-1">{t.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const rootElement = document.getElementById('root');
    if (!rootElement) {
        throw new Error('Missing #root container.');
    }

    const root = ReactDOM.createRoot(rootElement);
    if (typeof window !== 'undefined') {
        window.__lendoraRenderStarted = true;
    }

    try {
        root.render(
            <LendoraErrorBoundary>
                <App />
            </LendoraErrorBoundary>
        );
    } catch (error) {
        if (typeof window !== 'undefined' && typeof window.renderLendoraStartupError === 'function') {
            window.renderLendoraStartupError(`Startup error: ${error?.message || 'Unknown startup failure'}`);
        }
        throw error;
    }
