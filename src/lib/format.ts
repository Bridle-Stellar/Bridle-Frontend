const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  timeStyle: 'short',
})

export function formatTimestamp(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const diffMs = date.getTime() - Date.now()
  const diffMinutes = Math.round(diffMs / 60_000)

  if (Math.abs(diffMinutes) < 1) return 'just now'
  if (Math.abs(diffMinutes) < 60) {
    return new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(diffMinutes, 'minute')
  }
  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) {
    return new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(diffHours, 'hour')
  }
  const diffDays = Math.round(diffHours / 24)
  if (Math.abs(diffDays) < 7) {
    return new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(diffDays, 'day')
  }
  return dateTimeFormatter.format(date)
}

export function formatTimeOnly(iso: string): string {
  return timeFormatter.format(new Date(iso))
}

export function shortenAddress(address: string, lead = 5, trail = 5): string {
  if (address.length <= lead + trail + 1) return address
  return `${address.slice(0, lead)}…${address.slice(-trail)}`
}
