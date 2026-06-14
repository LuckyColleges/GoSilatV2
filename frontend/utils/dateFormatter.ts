/**
 * Format date string from DB (YYYY-MM-DD) to ID format (DD-MM-YYYY)
 */
export const formatDateToID = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-'
  try {
    // In case of ISO string with time
    const dateOnly = dateStr.split('T')[0]
    const [year, month, day] = dateOnly.split('-')
    if (!year || !month || !day) return dateStr
    return `${day}-${month}-${year}`
  } catch (e) {
    return dateStr
  }
}

/**
 * Format date string from ID format (DD-MM-YYYY) to DB format (YYYY-MM-DD)
 */
export const formatDateToDB = (dateStr: string | null | undefined) => {
  if (!dateStr) return null
  try {
    const [day, month, year] = dateStr.split('-')
    if (!day || !month || !year) return dateStr
    return `${year}-${month}-${day}`
  } catch (e) {
    return dateStr
  }
}
