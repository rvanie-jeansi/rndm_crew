import {
  type ComponentProps,
  type ForwardRefExoticComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DHtmlMarker,
  DMap,
  DPolyline,
  type DMapRef,
} from 'react-native-2gis-mapgl';

import {
  type AdventureMapProps,
  type AdventureTarget,
  type MapPoint,
  type VisitedMapPoint,
} from '@/components/adventure-map.props';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const MAP_KEY = process.env.EXPO_PUBLIC_2GIS_MAPGL_KEY ?? '';

const DEFAULT_CENTER: [number, number] = [37.6173, 55.7558];
const DEFAULT_ZOOM = 12;
const USER_ZOOM = 15;
const USER_DOT_COLOR = '#2F6BFF';
const VISITED_DOT_COLOR = '#9A9CB0';
const TARGET_LABEL_WIDTH = 112;

type Camera = { center: [number, number]; zoom: number };
type Bounds = { southWest: [number, number]; northEast: [number, number] };

type MapErrorEvent = { type?: string };

type DMapWithExtras = ForwardRefExoticComponent<
  ComponentProps<typeof DMap> & { onError?: (event: MapErrorEvent) => void }
>;

const DMapWithError = DMap as unknown as DMapWithExtras;

const HIDE_KEY_OVERLAY_JS = `
(function () {
  var message = 'MapGL key is invalid';
  var kill = function () {
    var nodes = document.querySelectorAll('div');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.childElementCount !== 0) continue;
      if (!node.textContent || node.textContent.indexOf(message) === -1) continue;
      var victim = node;
      var parent = victim.parentNode;
      while (
        parent &&
        parent.id !== 'map' &&
        parent.childElementCount === 1 &&
        parent.textContent &&
        parent.textContent.indexOf(message) !== -1
      ) {
        victim = parent;
        parent = victim.parentNode;
      }
      if (victim.parentNode) victim.parentNode.removeChild(victim);
    }
  };
  kill();
  new MutationObserver(kill).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
`;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function zoomForSpan(span: number): number {
  return clamp(Math.log2(547 / Math.max(span, 0.0005)), 3, 18);
}

function boundsOf(points: MapPoint[]): Bounds {
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  return {
    southWest: [Math.min(...lngs), Math.min(...lats)],
    northEast: [Math.max(...lngs), Math.max(...lats)],
  };
}

function cameraFor(user: MapPoint | null, targets: MapPoint[]): Camera {
  if (user) {
    return { center: [user.lng, user.lat], zoom: USER_ZOOM };
  }

  if (targets.length === 0) {
    return { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM };
  }

  const { southWest, northEast } = boundsOf(targets);
  const span = Math.max(
    northEast[0] - southWest[0],
    northEast[1] - southWest[1],
  ) * 1.6;

  return {
    center: [
      (southWest[0] + northEast[0]) / 2,
      (southWest[1] + northEast[1]) / 2,
    ],
    zoom: zoomForSpan(span),
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function dotHtml(color: string, size: number): string {
  return (
    `<div style="width:${size}px;height:${size}px;` +
    'border-radius:50%;box-sizing:border-box;' +
    `background:${color};border:2.5px solid #ffffff;` +
    'box-shadow:0 1px 4px rgba(0,0,0,.45);"></div>'
  );
}

function targetHtml(color: string, label: string): string {
  return (
    `<div style="width:${TARGET_LABEL_WIDTH}px;display:flex;` +
    'flex-direction:column;align-items:center;">' +
    dotHtml(color, 16) +
    '<div style="margin-top:3px;max-width:' +
    `${TARGET_LABEL_WIDTH}px;box-sizing:border-box;` +
    'font-family:-apple-system,system-ui,sans-serif;font-size:11px;' +
    'font-weight:600;line-height:1.25;color:#1f2430;text-align:center;' +
    'background:rgba(255,255,255,.92);border-radius:6px;padding:2px 6px;' +
    'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
    `${escapeHtml(label)}</div></div>`
  );
}

export function AdventureMap({
  targets,
  route,
  visited,
  user,
  accent,
}: AdventureMapProps) {
  const scheme = useColorScheme();
  const mapRef = useRef<DMapRef>(null);
  const [mapError, setMapError] = useState(false);
  const [keyRejected, setKeyRejected] = useState(false);

  const mapReadyRef = useRef(false);
  const userPannedRef = useRef(false);
  const centeredOnUserRef = useRef(false);
  const fittedTargetsRef = useRef(false);
  const userRef = useRef(user);
  const targetsRef = useRef(targets);

  const targetsKey = JSON.stringify(targets);
  const routeKey = JSON.stringify(route);
  const visitedKey = JSON.stringify(visited);

  const stableTargets = useMemo(
    () => JSON.parse(targetsKey) as AdventureTarget[],
    [targetsKey],
  );
  const stableRoute = useMemo(
    () => JSON.parse(routeKey) as MapPoint[],
    [routeKey],
  );
  const stableVisited = useMemo(
    () => JSON.parse(visitedKey) as VisitedMapPoint[],
    [visitedKey],
  );

  const [initialCamera] = useState<Camera>(() => cameraFor(user, targets));

  const options = useMemo(
    () => ({
      key: MAP_KEY,
      center: initialCamera.center,
      zoom: initialCamera.zoom,
      lang: 'ru',
      style: scheme === 'dark' ? ('dark' as const) : ('light' as const),
      zoomControl: false,
      trafficControl: false,
      copyright: 'bottomRight' as const,
    }),
    [initialCamera, scheme],
  );

  const maybeCenterOnUser = useCallback(() => {
    if (centeredOnUserRef.current || userPannedRef.current) return;
    const current = userRef.current;
    if (!current || !mapReadyRef.current) return;
    centeredOnUserRef.current = true;
    mapRef.current?.flyTo(
      { lat: current.lat, lng: current.lng },
      USER_ZOOM,
      { animate: true, duration: 800 },
    );
  }, []);

  const maybeFitTargets = useCallback(() => {
    if (
      !mapReadyRef.current ||
      centeredOnUserRef.current ||
      userPannedRef.current ||
      fittedTargetsRef.current
    ) {
      return;
    }
    const points = targetsRef.current;
    if (points.length === 0) return;
    fittedTargetsRef.current = true;
    mapRef.current?.fitBounds(boundsOf(points), {
      padding: { top: 90, bottom: 160, left: 50, right: 50 },
      animation: { duration: 600 },
    });
  }, []);

  const handleInit = useCallback(() => {
    mapReadyRef.current = true;
    maybeCenterOnUser();
    maybeFitTargets();
  }, [maybeCenterOnUser, maybeFitTargets]);

  const handleTouchStart = useCallback(() => {
    userPannedRef.current = true;
  }, []);

  const handleMapError = useCallback((event: MapErrorEvent) => {
    if (event?.type === 'invalidtilekey') setKeyRejected(true);
  }, []);

  useEffect(() => {
    userRef.current = user;
    maybeCenterOnUser();
  }, [user, maybeCenterOnUser]);

  useEffect(() => {
    targetsRef.current = targets;
    maybeFitTargets();
  }, [targets, maybeFitTargets]);

  if (!MAP_KEY) {
    return (
      <ThemedView style={styles.fallback}>
        <ThemedText type="smallBold">Карта 2ГИС не настроена</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          Добавь EXPO_PUBLIC_2GIS_MAPGL_KEY в .env (ключ выдаётся на
          dev.2gis.com) и перезапусти сервер через npx expo start -c.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <DMapWithError
        ref={mapRef}
        style={styles.map}
        options={options}
        fadeInOnInit={false}
        injectJS={HIDE_KEY_OVERLAY_JS}
        onInit={handleInit}
        onTouchStart={handleTouchStart}
        onError={handleMapError}
        onWebViewError={() => setMapError(true)}>
        {stableRoute.length >= 2 && (
          <DPolyline
            uniqueId="adventure-route"
            options={{
              coordinates: stableRoute.map((point) => [
                point.lng,
                point.lat,
              ]),
              color: accent,
              width: 4,
              interactive: false,
            }}
          />
        )}

        {stableTargets.map((target) => (
          <DHtmlMarker
            key={target.id}
            uniqueId={`target-${target.id}`}
            options={{
              coordinates: [target.lng, target.lat],
              html: targetHtml(accent, target.label ?? 'Цель'),
              anchor: [TARGET_LABEL_WIDTH / 2, 8],
              zIndex: 20,
              preventMapInteractions: false,
              labeling: { type: 'none' },
            }}
          />
        ))}

        {stableVisited.map((place) => (
          <DHtmlMarker
            key={place.id}
            uniqueId={`visited-${place.id}`}
            options={{
              coordinates: [place.lng, place.lat],
              html: dotHtml(VISITED_DOT_COLOR, 14),
              anchor: [7, 7],
              zIndex: 15,
              preventMapInteractions: false,
              labeling: { type: 'none' },
            }}
          />
        ))}

        {user && (
          <DHtmlMarker
            uniqueId="user-position"
            options={{
              coordinates: [user.lng, user.lat],
              html: dotHtml(USER_DOT_COLOR, 18),
              anchor: [9, 9],
              zIndex: 40,
              preventMapInteractions: false,
              labeling: { type: 'none' },
            }}
          />
        )}
      </DMapWithError>

      {(mapError || keyRejected) && (
        <SafeAreaView
          pointerEvents="none"
          edges={['top']}
          style={styles.errorWrap}>
          <ThemedView type="backgroundElement" style={styles.errorCard}>
            {mapError ? (
              <ThemedText type="small" themeColor="danger">
                Не удалось загрузить карту 2ГИС — проверь подключение к
                интернету.
              </ThemedText>
            ) : (
              <>
                <ThemedText type="smallBold" themeColor="danger">
                  Ключ 2ГИС отклонён
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Сервер 2ГИС не отдаёт тайлы. Проверь на dev.2gis.com, что у
                  ключа включены MapGL JS API и Map Tiles API и нет
                  ограничения по домену. Если не поможет — напиши на
                  api@2gis.com.
                </ThemedText>
              </>
            )}
          </ThemedView>
        </SafeAreaView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  hint: {
    textAlign: 'center',
    maxWidth: 320,
  },
  errorWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  errorCard: {
    padding: Spacing.two,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
});
