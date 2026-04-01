import { prisma } from '@monorepo/database/client'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { NavBar } from '../../components/common/NavBar'
import { getSession } from '../../libs/auth/session'

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const session = await getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  const user = await prisma.visibleUser.findFirst({
    where: { authProviderId: session.uid },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <div>
      <NavBar />
      <main>{children}</main>
    </div>
  )
}
