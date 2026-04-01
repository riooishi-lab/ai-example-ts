'use client'

import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'
import { Button } from '../Button'
import { FlexBox } from '../FlexBox'
import { Select } from '../Select'
import { Typography } from '../Typography'

import styles from './Pagination.module.css'

type Props = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize: number
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50]

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: Props) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <FlexBox alignItems='center' justifyContent='center' gap='1rem' padding='0.5rem 0'>
      <FlexBox alignItems='center' gap='0.25rem'>
        <Button
          variant='ghost'
          theme='primary'
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <FlexBox alignItems='center' gap='0.75rem' padding='0.5rem 0.75rem'>
            <IoIosArrowBack />
            <Typography>前へ</Typography>
          </FlexBox>
        </Button>

        {pages.map((page) => (
          <Button
            variant='ghost'
            key={page}
            onClick={() => onPageChange(page)}
            className={page === currentPage ? styles.pageButtonActive : styles.pageButton}
          >
            {page}
          </Button>
        ))}

        <Button
          variant='ghost'
          theme='primary'
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <FlexBox alignItems='center' gap='0.75rem' padding='0.5rem 0.75rem'>
            <Typography>次</Typography>
            <IoIosArrowForward />
          </FlexBox>
        </Button>
        <Select
          options={pageSizeOptions.map((size) => ({
            value: size.toString(),
            label: size.toString(),
          }))}
          value={pageSize.toString()}
          onChange={(value) => onPageSizeChange(Number(value?.value))}
        />
      </FlexBox>
    </FlexBox>
  )
}

export default Pagination
