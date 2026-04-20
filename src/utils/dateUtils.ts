export const formatToDisplayDate = (isoDate: string): string => {
  if (!isoDate) return '';
  // Expected input: YYYY-MM-DD
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[1]}-${parts[2]}-${parts[0]}`;
};

export const formatToISODate = (displayDate: string): string => {
  if (!displayDate) return '';
  // Expected input: MM-DD-YYYY
  const parts = displayDate.split('-');
  if (parts.length !== 3) return displayDate;
  return `${parts[2]}-${parts[0]}-${parts[1]}`;
};
