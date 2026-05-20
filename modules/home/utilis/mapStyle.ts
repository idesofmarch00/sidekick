export const getMapStyles = (
  features: string[],
  element: string,
  styles: any[]
) => {
  return features.map((feature) => ({
    featureType: feature, 
    elementType: element,
    stylers: [...styles],
  }));
};

const hiddenGeometry = getMapStyles(
  ["transit", "poi.business"],
  "geometry",
  [{ visibility: "off" }]
);

const greyGeometry = getMapStyles(
  [
    "administrative.land_parcel",
    "landscape.natural.landcover",
    "landscape.natural.terrain",
    "landscape.man_made",
  ],
  "geometry",
  [{ color: "#EAEBEF" }]
);

const hiddenLabels = getMapStyles(
  [
    "poi.attraction",
    "poi.park",
    "poi.government",
    "poi.place_of_worship",
    "poi.school",
    "poi.sports_complex",
    "administrative.land_parcel",
    "administrative.neighborhood",
    "transit.station",
    "transit.station.bus",
    "transit.station.rail",
    "road.highway",
  ],
  "labels",
  [{ visibility: "off" }]
);

const bluGrayGeometry = getMapStyles(
  ["road.highway", "road.highway.controlled_access"],
  "geometry",
  [{ color: "#BDC4D3" }]
);

const blueGrayIcons = getMapStyles(
  [
    "poi.park",
    "poi.place_of_worship",
    "poi.school",
    "poi.business",
    "poi.medical",
    "poi.sports_complex",
    "poi.attraction",
    "administrative.province",
    "administrative.land_parcel",
    "administrative.locality",
    "administrative.neighborhood",
    "transit.station",
    "transit.station.bus",
    "transit.station.rail",
    "road.highway",
  ],
  "labels.icon",
  [{ color: "#BDC4D3" }]
);

const blueGrayLabelText = getMapStyles(
  ["poi.business", "poi.medical", "poi.attraction"],
  "labels.text.fill",
  [{ color: "#7E8598" }]
);

export const mapStyles = [
  ...hiddenLabels,
  ...hiddenGeometry,
  ...greyGeometry,
  ...bluGrayGeometry,
  ...blueGrayIcons,
  ...blueGrayLabelText,
];

export const mapStyles2 = [
  ...hiddenLabels,
  ...hiddenGeometry,
  ...blueGrayIcons,
  ...blueGrayLabelText,
];
