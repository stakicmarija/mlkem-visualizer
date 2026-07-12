import { useEffect, useRef, useState } from 'react'

const STEP_DELAY_MS = 90

// Drives step-tree navigation for algorithm pages (KeyGen, Encaps, Decaps).
// `currentStepIndex` is what step content should render; `treeIndex` is
// what <StepTree> should visualize -- they diverge only while goNext is
// skipping over transition steps (e.g. "Run internal algorithm"), during
// which treeIndex steps through each skipped step in turn (lighting it up
// pending -> done), landing on the target the same instant content jumps
// there. A single-step advance (the common case) updates both immediately,
// with no animation.
export function useStepNavigation(navSteps, transitionIds, initialIndex = 0) {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialIndex)
  const [treeIndex, setTreeIndex] = useState(initialIndex)
  const [isAnimating, setIsAnimating] = useState(false)
  const timeoutsRef = useRef([])

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), [])

  function goNext() {
    if (isAnimating) return
    let next = currentStepIndex + 1
    while (next < navSteps.length && transitionIds.has(navSteps[next].id)) {
      next++
    }
    if (next >= navSteps.length) return

    const skipped = next - currentStepIndex - 1
    if (skipped <= 0) {
      setTreeIndex(next)
      setCurrentStepIndex(next)
      return
    }

    setIsAnimating(true)
    timeoutsRef.current = []
    for (let i = currentStepIndex + 1; i <= next; i++) {
      const isLast = i === next
      const timeoutId = setTimeout(() => {
        setTreeIndex(i)
        if (isLast) {
          setCurrentStepIndex(i)
          setIsAnimating(false)
        }
      }, (i - currentStepIndex) * STEP_DELAY_MS)
      timeoutsRef.current.push(timeoutId)
    }
  }

  // Backward navigation stays instant — there's no "completing steps"
  // narrative to animate when moving the other way.
  function goPrev() {
    if (isAnimating) return false
    let prev = currentStepIndex - 1
    while (prev >= 0 && transitionIds.has(navSteps[prev].id)) {
      prev--
    }
    if (prev < 0) return false
    setTreeIndex(prev)
    setCurrentStepIndex(prev)
    return true
  }

  return { currentStepIndex, treeIndex, goNext, goPrev, isAnimating }
}
