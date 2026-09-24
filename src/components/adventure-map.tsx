import MapView, { Marker, Polyline, type Region } from 'react-native-maps';

import {
  type AdventureMapProps,
  type MapPoint,
} from '@/components/adventure-map.props';

const DEFAULT_REGION: Region = {
  latitude: 55.7558,
  longitude: 37.6173,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

function regionFor(user: MapPoint | null, targets: MapPoint[]): Region {
  if (user) {
    return {
      latitude: user.lat,
      longitude: user.lng,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    };
  }

  const points = targets;
  if (points.length === 0) return DEFAULT_REGION;

  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(0.05, (maxLat - minLat) * 1.6),
    longitudeDelta: Math.max(0.05, (maxLng - minLng) * 1.6),
  };
}

export function AdventureMap({ targets, route, visited, user, accent }: AdventureMapProps) {
  const region = regionFor(user, targets);
  const path = route
    .map((point) => ({ latitude: point.lat, longitude: point.lng }));

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={region}
      showsUserLocation={false}
      showsMyLocationButton
      showsCompass
      toolbarEnabled={false}>
      {path.length >= 2 && (
        <Polyline
          coordinates={path}
          strokeColor={accent}
          strokeWidth={3}
          lineCap="round"
          lineJoin="round"
          tappable={false}
        />
      )}

      {targets.map((target) => (
        <Marker
          key={target.id}
          coordinate={{ latitude: target.lat, longitude: target.lng }}
          pinColor={accent}
          title={target.label}
        />
      ))}

      {visited.map((place) => (
        <Marker
          key={place.id}
          coordinate={{ latitude: place.lat, longitude: place.lng }}
          pinColor="#9A9CB0"
          title={place.name ?? 'Посещённое место'}
        />
      ))}
    </MapView>
  );
}