import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Steps through `length` indices at a steady pace (one event per index --
// no slow-then-fast speedup), highlighting one at a time and marking it
// "filled" on the same tick. Shared by any step that narrates a
// value-by-value walkthrough: EncodePlaintextStep's Decompress circle,
// CompressPackStep's Compress circle, and future reverse-Decompress steps
// -- same hook, not step-specific.
//
// Supports pause/resume: plain setTimeout has no pause of its own, so
// Stop/Continue works by clearing pending timers and rescheduling whatever
// hasn't fired yet with reduced delays (elapsedRef/startTimeRef track how
// much virtual time has already been consumed across paused segments).
//
// `enabled=false` skips scheduling entirely (still safe to call
// unconditionally per the rules of hooks) for callers that want the same
// component to also support a plain, non-animated static mode.
export function useWalkAnimation(length, stepGap, enabled = true) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [filledCount, setFilledCount] = useState(0)
  const [paused, setPaused] = useState(false)
  const timeoutsRef = useRef([])
  const elapsedRef = useRef(0) // virtual ms consumed before the current run segment
  const startTimeRef = useRef(0) // performance.now() when the current run segment started

  const events = useMemo(
    () => Array.from({ length }, (_, i) => ({ delay: i * stepGap, i })),
    [length, stepGap]
  )

  const runEvent = useCallback(({ i }) => {
    setActiveIndex(i)
    setFilledCount(c => Math.max(c, i + 1))
  }, [])

  // Schedules every event whose delay hasn't already elapsed, offset by
  // however much virtual time has already been consumed -- elapsedMs=0 is
  // a fresh start; elapsedMs=elapsedRef.current resumes from a pause.
  const scheduleFrom = useCallback(elapsedMs => {
    timeoutsRef.current.forEach(clearTimeout)
    const timers = []
    startTimeRef.current = performance.now()
    events.forEach(event => {
      if (event.delay >= elapsedMs) {
        timers.push(setTimeout(() => runEvent(event), event.delay - elapsedMs))
      }
    })
    timeoutsRef.current = timers
  }, [runEvent, events])

  useEffect(() => {
    if (!enabled) return
    elapsedRef.current = 0
    scheduleFrom(0)
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
    }
  }, [scheduleFrom, enabled])

  function handleStop() {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    elapsedRef.current += performance.now() - startTimeRef.current
    setPaused(true)
  }

  function handleContinue() {
    setPaused(false)
    scheduleFrom(elapsedRef.current)
  }

  function handleReplay() {
    setActiveIndex(0)
    setFilledCount(0)
    setPaused(false)
    elapsedRef.current = 0
    scheduleFrom(0)
  }

  return {
    activeIndex,
    filledCount,
    paused,
    done: filledCount === length,
    handleStop,
    handleContinue,
    handleReplay,
  }
}
