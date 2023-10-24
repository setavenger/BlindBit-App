export function stringToBoolean(str) {
  return str.toLowerCase() === 'true';
}

export function getCurrentTimestamp() {
  return new Date().toISOString();
}
