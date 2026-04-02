'use client'

import type { VisibleEquipment, VisibleInspectionItem, VisiblePart } from '@monorepo/database'
import { useMemo } from 'react'
import { MdBuild } from 'react-icons/md'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { PageHeader } from '../../../../../components/common/PageHeader'
import { SearchParamTab } from '../../../../../components/common/SearchParamTab'
import styles from '../page.module.css'
import { EquipmentTab } from './EquipmentTab'
import { InspectionItemsTab } from './InspectionItemsTab'
import { PartsTab } from './PartsTab'

type Props = {
  equipments: VisibleEquipment[]
  parts: VisiblePart[]
  inspectionItems: VisibleInspectionItem[]
  tabIndex: number
}

export function AdminEquipmentsView({ equipments, parts, inspectionItems, tabIndex }: Props) {
  const subtitle = (() => {
    switch (tabIndex) {
      case 0:
        return `全 ${equipments.length} 件`
      case 1:
        return `全 ${parts.length} 件`
      case 2:
        return `全 ${inspectionItems.length} 件`
      default:
        return ''
    }
  })()

  const contents = useMemo(
    () => [
      {
        id: 'equipments',
        label: `設備 (${equipments.length})`,
        content: <EquipmentTab equipments={equipments} />,
      },
      {
        id: 'parts',
        label: `部品 (${parts.length})`,
        content: <PartsTab parts={parts} equipments={equipments} />,
      },
      {
        id: 'inspectionItems',
        label: `点検項目 (${inspectionItems.length})`,
        content: <InspectionItemsTab inspectionItems={inspectionItems} equipments={equipments} />,
      },
    ],
    [equipments, parts, inspectionItems],
  )

  return (
    <FlexBox flexDirection='column' gap='1.5rem' className={styles.container}>
      <PageHeader icon={<MdBuild size={32} />} title='設備マスタ管理' subtitle={subtitle} />
      <SearchParamTab keyName='tabIndex' selectedIndex={tabIndex} contents={contents} />
    </FlexBox>
  )
}
