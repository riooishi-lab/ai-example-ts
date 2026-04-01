import { parseAsInteger, useQueryStates } from 'nuqs'

type Args = {
  defaultPage?: number
  defaultPageSize?: number
  pageKey?: string
  pageSizeKey?: string
}

/**
 * Reusable hook to sync pagination with URL search params.
 * Inspired by the 'accepting-org' project architecture.
 */
export const useParamPagination = ({
  defaultPage = 1,
  defaultPageSize = 10,
  pageKey = 'page',
  pageSizeKey = 'pageSize',
}: Args = {}) => {
  const [params, setParams] = useQueryStates(
    {
      [pageKey]: parseAsInteger.withDefault(defaultPage),
      [pageSizeKey]: parseAsInteger.withDefault(defaultPageSize),
    },
    { shallow: false },
  )

  return {
    page: params[pageKey],
    updatePage: (value: number) => setParams({ [pageKey]: value }),
    pageSize: params[pageSizeKey],
    updatePageSize: (value: number) => setParams({ [pageSizeKey]: value, [pageKey]: 1 }),
  }
}
