export const calculateHeading = (startLat: number, startLng: number, endLat: number, endLng: number) => {
    const y = Math.sin(endLng - startLng) * Math.cos(endLat);
    const x =
      Math.cos(startLat) * Math.sin(endLat) -
      Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
    return (Math.atan2(y, x) * 180) / Math.PI;
  };
  