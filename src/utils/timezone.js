export const getBrowserTimezone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone

export const formatDateInBrowserTz = (dateString) => {
  const tz = getBrowserTimezone()
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: tz
  })
}

export const formatTimeInBrowserTz = (dateString) => {
  const tz = getBrowserTimezone()
  return new Date(dateString).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: tz
  })
}