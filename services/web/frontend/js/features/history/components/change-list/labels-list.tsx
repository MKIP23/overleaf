import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import HistoryVersionDetails from './history-version-details'
import TagTooltip from './tag-tooltip'
import UserNameWithColoredBadge from './user-name-with-colored-badge'
import LabelDropdown from './dropdown/label-dropdown'
import { useHistoryContext } from '../../context/history-context'
import { useUserContext } from '../../../../shared/context/user-context'
import { isVersionSelected } from '../../utils/history-details'
import { getVersionWithLabels, isPseudoLabel } from '../../utils/label'
import { formatTime, isoToUnix } from '../../../utils/format-date'
import { Version } from '../../services/types/update'

function LabelsList() {
  const { t } = useTranslation()
  const { labels, projectId, selection } = useHistoryContext()
  const { id: currentUserId } = useUserContext()

  const versionWithLabels = useMemo(
    () => getVersionWithLabels(labels),
    [labels]
  )

  const selectedVersions = new Set<Version>(
    Array.from(versionWithLabels.values(), value => value.version).filter(
      version => isVersionSelected(selection, version)
    )
  )

  const singleVersionSelected = selectedVersions.size === 1

  return (
    <>
      {versionWithLabels.map(({ version, labels }) => {
        const selected = selectedVersions.has(version)

        // first label
        const fromVTimestamp = isoToUnix(labels[labels.length - 1].created_at)
        // most recent label
        const toVTimestamp = isoToUnix(labels[0].created_at)

        return (
          <HistoryVersionDetails
            key={version}
            fromV={version}
            toV={version}
            fromVTimestamp={fromVTimestamp}
            toVTimestamp={toVTimestamp}
            selected={selected}
            selectable={!(singleVersionSelected && selected)}
          >
            <div className="history-version-main-details">
              {labels.map(label => (
                <div key={label.id} className="history-version-label">
                  <TagTooltip
                    showTooltip={false}
                    currentUserId={currentUserId}
                    label={label}
                  />
                  <time className="history-version-metadata-time">
                    {formatTime(label.created_at, 'Do MMMM, h:mm a')}
                  </time>
                  {!isPseudoLabel(label) && (
                    <div className="history-version-saved-by">
                      <span className="history-version-saved-by-label">
                        {t('saved_by')}
                      </span>
                      <UserNameWithColoredBadge
                        user={{
                          id: label.user_id,
                          displayName: label.user_display_name,
                        }}
                        currentUserId={currentUserId}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <LabelDropdown
              id={version.toString()}
              projectId={projectId}
              version={version}
              updateMetaEndTimestamp={toVTimestamp}
              isComparing={selection.comparing}
              isSelected={selected}
            />
          </HistoryVersionDetails>
        )
      })}
    </>
  )
}

export default LabelsList
