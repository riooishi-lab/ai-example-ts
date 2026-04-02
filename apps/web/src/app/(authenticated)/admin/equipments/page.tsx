import { prisma } from '@monorepo/database/client'
import { redirect } from 'next/navigation'
import { PAGE_PATH } from '../../../../constants/pagePath'
import { checkIsAdminOrManager } from '../../../../libs/auth/session'
import { searchParamsCache } from '../../../../utils/searchParams'
import { AdminEquipmentsView } from './components/AdminEquipmentsView'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ searchParams }: Props) {
  if (!(await checkIsAdminOrManager())) {
    redirect(PAGE_PATH.HOME)
  }

  const { tabIndex } = await searchParamsCache.parse(searchParams)

  const [equipments, parts, inspectionItems] = await Promise.all([
    prisma.visibleEquipment.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    tabIndex === 1
      ? prisma.visiblePart.findMany({
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
    tabIndex === 2
      ? prisma.visibleInspectionItem.findMany({
          orderBy: [{ equipmentId: 'asc' }, { sortOrder: 'asc' }],
        })
      : Promise.resolve([]),
  ])

  return (
    <AdminEquipmentsView equipments={equipments} parts={parts} inspectionItems={inspectionItems} tabIndex={tabIndex} />
  )
}
