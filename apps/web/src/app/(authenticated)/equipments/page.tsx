import { prisma } from '@monorepo/database/client'
import { MdBuild } from 'react-icons/md'
import { FlexBox } from '../../../components/common/FlexBox'
import { PageHeader } from '../../../components/common/PageHeader'
import { EquipmentList } from './components/EquipmentList'
import styles from './page.module.css'

export default async function Page() {
  const equipments = await prisma.visibleEquipment.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <FlexBox flexDirection='column' gap='1.5rem' className={styles.container} data-testid='equipments-page'>
      <PageHeader icon={<MdBuild size={32} />} title='設備一覧' subtitle={`全 ${equipments.length} 件`} />
      <EquipmentList equipments={equipments} />
    </FlexBox>
  )
}
