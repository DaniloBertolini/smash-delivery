export function openGoogleMaps(address: string) {
  if (!address) return;
  const encoded = encodeURIComponent(address);
  window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
}

export function openWaze(address: string) {
  if (!address) return;
  const encoded = encodeURIComponent(address);
  // Universal link para Waze
  window.open(`https://ul.waze.com/ul?navigate=yes&q=${encoded}`, '_blank');
}

export function openGoogleMapsDirections(addresses: string[], startAddress?: string) {
  const validAddresses = addresses.filter(Boolean);

  if (validAddresses.length === 0) {
    return;
  }

  if (validAddresses.length === 1) {
    openGoogleMaps(validAddresses[0]);
    return;
  }

  const origin = startAddress ? encodeURIComponent(startAddress) : '';
  const destination = encodeURIComponent(validAddresses[0]);
  const waypoints = validAddresses.slice(1).map(encodeURIComponent).join('/');

  const url = `https://www.google.com/maps/dir/${origin}/${destination}/${waypoints}`;
  window.open(url, '_blank');
}