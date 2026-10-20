// Trout are weighed in pounds and ounces, pike are measured in centimetres -
// stored as a single decimal (lb + oz/16 is exact in floating point since 16
// is a power of two) so sorting/comparing still works as plain numbers.
export function formatWeightLbOz(value: number): string {
  const totalOz = Math.round(value * 16);
  const lb = Math.floor(totalOz / 16);
  const oz = totalOz % 16;
  return oz > 0 ? `${lb} lb ${oz} oz` : `${lb} lb`;
}

export function formatMeasurement(
  value: number | null | undefined,
  type: string | null | undefined
): string {
  if (value === null || value === undefined || !type) return "—";
  if (type === "weight_lb") return formatWeightLbOz(value);
  return `${value} cm`;
}
