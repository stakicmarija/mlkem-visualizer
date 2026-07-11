import { useState } from 'react'

// Tracks which cell (0..length-1) in a matrix/vector has its popup open,
// plus prev/next navigation within that same flat list of cells -- used by
// every matrix/vector cell popup (A, s, e, t, and anything built later).
export function useCellPopup(length) {
  const [index, setIndex] = useState(null)

  return {
    index,
    isOpen: index !== null,
    open: setIndex,
    close: () => setIndex(null),
    goPrev: () => setIndex(i => Math.max(0, i - 1)),
    goNext: () => setIndex(i => Math.min(length - 1, i + 1)),
    hasPrev: index !== null && index > 0,
    hasNext: index !== null && index < length - 1,
  }
}
