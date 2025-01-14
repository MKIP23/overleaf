import { useTranslation } from 'react-i18next'
import { useHistoryContext } from '../../context/history-context'
import { getUpdateForVersion } from '../../utils/history-details'
import { computeUpdateRange } from '../../utils/range'
import { isAnyVersionMatchingSelection } from '../../utils/label'
import { HistoryContextValue } from '../../context/types/history-context-value'

type ToggleSwitchProps = Pick<
  HistoryContextValue,
  'labelsOnly' | 'setLabelsOnly'
>

function ToggleSwitch({ labelsOnly, setLabelsOnly }: ToggleSwitchProps) {
  const { t } = useTranslation()
  const { selection, setSelection, resetSelection, updatesInfo, labels } =
    useHistoryContext()

  const handleChange = (isLabelsOnly: boolean) => {
    if (selection.comparing) {
      // using the switch toggle should reset the selection when in `compare` mode
      resetSelection()
    } else {
      if (isLabelsOnly) {
        if (isAnyVersionMatchingSelection(labels, selection)) {
          resetSelection()
        }
      } else {
        // in labels only mode the `fromV` is equal to `toV` value
        // switching to all history mode and triggering immediate comparison with
        // an older version would cause a bug if the computation below is skipped.
        const update = selection.updateRange?.toV
          ? getUpdateForVersion(selection.updateRange.toV, updatesInfo.updates)
          : null

        const { updateRange } = selection

        if (
          updateRange &&
          update &&
          (update.fromV !== updateRange.fromV || update.toV !== updateRange.toV)
        ) {
          const range = computeUpdateRange(
            updateRange,
            update.fromV,
            update.toV,
            update.meta.end_ts
          )

          setSelection({
            updateRange: range,
            comparing: false,
            files: [],
          })
        }
      }
    }

    setLabelsOnly(isLabelsOnly)
  }

  return (
    <fieldset className="toggle-switch">
      <legend className="sr-only">{t('history_view_a11y_description')}</legend>
      <input
        type="radio"
        name="labels-only-toggle-switch"
        checked={!labelsOnly}
        onChange={() => handleChange(false)}
        className="toggle-switch-input"
        id="toggle-switch-all-history"
      />
      <label
        htmlFor="toggle-switch-all-history"
        className="toggle-switch-label"
      >
        <span>{t('history_view_all')}</span>
      </label>
      <input
        type="radio"
        name="labels-only-toggle-switch"
        checked={labelsOnly}
        onChange={() => handleChange(true)}
        className="toggle-switch-input"
        id="toggle-switch-labels"
      />
      <label htmlFor="toggle-switch-labels" className="toggle-switch-label">
        <span>{t('history_view_labels')}</span>
      </label>
    </fieldset>
  )
}

export default ToggleSwitch
