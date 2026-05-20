import { point, distance } from '@turf/turf';
import { FetchAllHubsQuery } from '@/generated/graphql';

export const findNearestHub = (
  userLat: number,
  userLng: number,
  hubs: FetchAllHubsQuery['hubs'],
  maxDistance: number = 20
): FetchAllHubsQuery['hubs'][0] | null => {
  if (!hubs?.length) {return null;}
  if (!userLat || !userLng) {return null;}

  const userPoint = point([userLng, userLat]);

  return hubs
    ?.filter(hub => hub.latitude && hub.longitude)
    ?.reduce((nearest, hub) => {
      const hubPoint = point([hub.longitude, hub.latitude]);
      const distanceInKm = distance(userPoint, hubPoint);

      if (distanceInKm > maxDistance) {return nearest;}

      if (!nearest) {return hub;}

      const nearestPoint = point([nearest.longitude, nearest.latitude]);
      const nearestDistance = distance(userPoint, nearestPoint);

      return distanceInKm < nearestDistance ? hub : nearest;
    }, null as FetchAllHubsQuery['hubs'][0] | null);
};

export const sortHubsByDistance = (
  userLat: number,
  userLng: number,
  hubs: FetchAllHubsQuery['hubs']
): (FetchAllHubsQuery['hubs'][0] & { distance: string })[] => {
  if (!hubs?.length) {return [];}
  
  const userPoint = point([userLng, userLat]);

  return hubs
    ?.filter(hub => hub.latitude && hub.longitude)
    ?.map(hub => {
      const hubPoint = point([hub.longitude, hub.latitude]);
      const distanceInKm = distance(userPoint, hubPoint);
      const distanceInM = distanceInKm * 1000;
      
      return {
        ...hub,
        distance: distanceInM < 1000 ? 
          `${Math.round(distanceInM)}m` : 
          `${distanceInKm.toFixed(1)}km`
      };
    })
    ?.sort((a, b) => {
      const distA = parseFloat(a.distance.replace(/[mk]/g, ''));
      const distB = parseFloat(b.distance.replace(/[mk]/g, ''));
      return distA - distB;
    });
};

export const calculateHubDistance = (
  userLat: number,
  userLng: number,
  hub: FetchAllHubsQuery['hubs'][0]
): string => {
  if (!hub?.latitude || !hub?.longitude) {
    return '0m';
  }

  const userPoint = point([userLng, userLat]);
  const hubPoint = point([hub.longitude, hub.latitude]);
  const distanceInKm = distance(userPoint, hubPoint);
  const distanceInM = distanceInKm * 1000;

  return distanceInM < 1000 
    ? `${Math.round(distanceInM)}m` 
    : `${distanceInKm.toFixed(1)}km`;
};
