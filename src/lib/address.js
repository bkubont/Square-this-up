export function addressLines(client) {
  return [client?.address, client?.address_line2].filter(value => typeof value === 'string' && value.trim()).map(value => value.trim());
}

export function googleMapsUrl(client) {
  const address = addressLines(client).join(', ');
  return address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null;
}
