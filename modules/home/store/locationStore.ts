import { create } from 'zustand';

interface LocationState {
  latitude: number;
  longitude: number;
  setLocation: (lat: number, lng: number) => void;
}

const useLocationStore = create<LocationState>(set => ({
  latitude: 28.7041,
  longitude: 77.1025,
  setLocation: (lat, lng) => set({ latitude: lat, longitude: lng}),
}));

export default useLocationStore;
