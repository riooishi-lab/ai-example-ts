import { createParser, createSearchParamsCache, parseAsString } from 'nuqs/server'

const parseAsPositiveInt = createParser({
  parse(value) {
    const num = Number.parseInt(value, 10)
    if (Number.isNaN(num) || num < 1) return null
    return num
  },
  serialize: String,
})

const parseAsNonNegativeInt = createParser({
  parse(value) {
    const num = Number.parseInt(value, 10)
    if (Number.isNaN(num) || num < 0) return null
    return num
  },
  serialize: String,
})

export const tabSearchParams = {
  tabIndex: parseAsPositiveInt.withDefault(0),
  activityTabIndex: parseAsPositiveInt.withDefault(0),
}

export const paginationSearchParams = {
  page: parseAsPositiveInt.withDefault(1),
  pageSize: parseAsNonNegativeInt.withDefault(10),
  search: parseAsString.withDefault(''),
}

export const searchParamsCache = createSearchParamsCache({
  ...tabSearchParams,
  ...paginationSearchParams,
})
