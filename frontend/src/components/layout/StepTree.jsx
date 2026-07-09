import Step from './Step.jsx'
import Layer from './Layer.jsx'
import './StepTree.css'

const INDENT = 24 // px per nesting level
// The Step connector is a border-left on a 0-width div with margin-left: 6px,
// centering it under the 14px circle. Layer lines must start at this same X.
const CONN_OFFSET = 6

function StepTree({ steps, currentStepIndex, onStepClick }) {
  // Flat list of only navigable steps — used for position-based state calculation.
  const navSteps = steps.filter(s => !s.isGroupLabel)

  // Returns the navSteps positions of the first and last non-group children
  // under a group label — all items whose level >= groupLevel until we step back out.
  function groupChildRange(groupIndex, groupLevel) {
    let firstPos = -1
    let lastPos = -1
    for (let i = groupIndex + 1; i < steps.length; i++) {
      if (steps[i].level < groupLevel) break
      if (!steps[i].isGroupLabel) {
        const pos = navSteps.findIndex(s => s.id === steps[i].id)
        if (pos !== -1) {
          if (firstPos === -1) firstPos = pos
          lastPos = pos
        }
      }
    }
    return { firstPos, lastPos }
  }

  // A step/layer "continues" (has a connector going downward) if the next item
  // in the array is at the same depth or deeper -- i.e. this isn't the last
  // item in its branch.
  function continues(index) {
    const next = steps[index + 1]
    return !!next && next.level >= steps[index].level
  }

  return (
    <div className="step-tree">
      {steps.flatMap((item, index) => {
        const prevItem = steps[index - 1]
        const goesOn = continues(index)
        const elements = []

        // When returning from a deeper level, inject a label-less back connector
        // so the horizontal dashed line visually shows the step back up.
        if (prevItem && prevItem.level > item.level) {
          const pos = !item.isGroupLabel ? navSteps.findIndex(s => s.id === item.id) : -1
          const backState = pos !== -1 && pos <= currentStepIndex ? 'done' : 'pending'
          elements.push(
            <div
              key={`${item.id}--back`}
              className="step-tree__item step-tree__item--group step-tree__item--back"
              style={{ paddingLeft: item.level * INDENT + CONN_OFFSET }}
            >
              <Layer label="" level={item.level} hasLine state={backState} />
            </div>
          )
        }

        if (item.isGroupLabel) {
          const { firstPos, lastPos } = groupChildRange(index, item.level)
          const state =
            lastPos !== -1 && lastPos < currentStepIndex ? 'done'
            : firstPos !== -1 && firstPos <= currentStepIndex ? 'active'
            : 'pending'
          elements.push(
            <div
              key={item.id}
              className="step-tree__item step-tree__item--group"
              style={{ paddingLeft: Math.max(0, (item.level - 1) * INDENT + CONN_OFFSET) }}
            >
              <Layer label={item.label} level={item.level} hasLine={item.level > 0 && goesOn} state={state} />
            </div>
          )
        } else {
          const pos = navSteps.findIndex(s => s.id === item.id)
          const state =
            pos < currentStepIndex ? 'done'
            : pos === currentStepIndex ? 'active'
            : 'pending'
          elements.push(
            <div
              key={item.id}
              className={`step-tree__item${item.isFinal ? ' step-tree__item--final' : ''}`}
              style={{ paddingLeft: item.level * INDENT }}
            >
              <Step
                label={item.label}
                state={state}
                hasConnector={!!steps[index + 1]}
                onClick={onStepClick ? () => onStepClick(item) : undefined}
              />
            </div>
          )
        }

        return elements
      })}
    </div>
  )
}

export default StepTree
