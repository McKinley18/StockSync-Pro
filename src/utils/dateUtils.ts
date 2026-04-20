export const formatToDisplayDate = (isoDateString: string, includeTime: boolean = false): string => {
  if (!isoDateString) return '';

  const date = new Date(isoDateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    // If it's not a valid ISO string, try to handle simple YYYY-MM-DD format gracefully
    const parts = isoDateString.split('-');
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}/${parts[0]}`; // MM/DD/YYYY
    }
    return isoDateString; // Return original if cannot parse
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = date.getDate().toString().padStart(2, '0');

  let formattedDate = `${month}/${day}/${year}`;

  if (includeTime) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    formattedDate += ` ${hours}:${minutes}`;
  }

  return formattedDate;
};

export const formatToISODate = (displayDateString: string): string => {
  if (!displayDateString) return '';

  // This function assumes displayDateString is already in a parsable format or simple MM/DD/YYYY
  // For simplicity, if displayDateString includes time, we will try to parse it directly.
  // If not, we construct a date assuming it's MM/DD/YYYY and convert to ISO.
  try {
    const date = new Date(displayDateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (e) {
    // Fallback for simple MM/DD/YYYY if direct parse fails
  }

  // If displayDateString is MM-DD-YYYY (old format) or MM/DD/YYYY (new display format)
  // Split by either '-' or '/'
  const parts = displayDateString.split(/[-\/]/);
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString();
  }
  return displayDateString; // Return original if cannot parse
};
