export function calculateAreaSqIn(diameterIn: number): number {
  const radiusIn = diameterIn / 2;
  return Math.PI * radiusIn * radiusIn;
}

export function calculatePricePerSqIn(price: number, diameterIn: number): number {
  const areaSqIn = calculateAreaSqIn(diameterIn);
  return price / areaSqIn;
}
