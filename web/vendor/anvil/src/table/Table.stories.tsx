import 'overlayscrollbars/overlayscrollbars.css'

import { Meta, StoryObj } from '@storybook/react-vite'
import {
  ColumnDef,
  PaginationState,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table'
import React, { useMemo, useState } from 'react'

import { CheckBox } from '../form'
import { Heading } from '../typography'
import TablePaginationControls from './pagination/TablePaginationControls'
import Table from './Table'
import { resolvePageSizeChanged } from './utils'

type User = {
  id: number
  name: string
  email: string
  age: number
  catchPhrase?: string
  favoriteJoke?: string
}
const catchPhrases = [
  'A cool human',
  'Loves to code',
  'Loves my cat',
  'A super cool human',
]
const jokes = [
  'What do you call a fake noodle? An Impasta!',
  'What does a fish say when it runs into a wall? Dam!',
  'What do you call a fish with no eyes? A fsh!',
  'How do you make a tissue dance? You put a little boogie in it!',
  'What do you call a fish with two knees? A two-knee fish!',
]
const fakeUsers = (size: number) => {
  return [...Array(size).keys()].map((i) => ({
    id: i,
    name: `User ${i}`,
    email: `user_${i}@gmail.com`,
    catchPhrase: catchPhrases[Math.floor(Math.random() * catchPhrases.length)],
    age: Math.floor(Math.random() * 100),
    favoriteJoke: jokes[Math.floor(Math.random() * jokes.length)],
  }))
}

type StoryProps = {
  data: User[]
  paginated?: boolean
}

// NOTE: this story is a bit complex because it tries to demonstrate both paginated and infinite scroll tables.
// In practice, you would only use one or the other, so the complexity here is not representative of the
// complexity of the component itself.
const StoryContainer = ({ data, paginated }: StoryProps) => {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const pageCount = Math.ceil(data.length / pagination.pageSize)

  /**
   * The currently active row, if any. This is separate from react-tables concept
   * of selected rows, which is used for bulk actions (e.g. checkbox selection)
   */
  const [activeRow, setActiveRow] = React.useState<User | undefined>()
  /**
   * State for react-tables native row selection operations.
   */
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const handleSelectActiveRow = (row?: User) => {
    setActiveRow((prev) => (prev?.id === row?.id ? undefined : row))
  }

  const columns = useMemo<ColumnDef<User>[]>(() => {
    const userColumns: ColumnDef<User>[] = Object.keys(data[0]).map((key) => ({
      id: key,
      accessorKey: key,
      // @ts-expect-error: this type isn't really unknown here
      cell: (info) => <span className="line-clamp-1">{info.getValue()}</span>,
      header: () => <span>{key}</span>,
      minSize: key === 'favoriteJoke' ? 300 : 150,
    }))

    const checks: ColumnDef<User> = {
      id: 'select',
      header: ({ table }) => (
        <CheckBox
          // All rows in the table body have an invisible left border, so we need a slight offset
          className="ml-0.5"
          checked={
            paginated
              ? table.getIsAllPageRowsSelected()
              : table.getIsAllRowsSelected()
          }
          onCheckedChange={(checked) =>
            paginated
              ? table.toggleAllPageRowsSelected(!!checked)
              : table.toggleAllRowsSelected(!!checked)
          }
        />
      ),
      cell: ({ row }) => (
        <span className="flex h-full w-full items-center justify-start">
          <CheckBox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(checked) => row.toggleSelected(!!checked)}
          />
        </span>
      ),
      size: 30,
      meta: {
        // A custom metadata attribute used in the Table component
        isActionColumn: true,
      },
      enableSorting: false,
    }

    return [checks, ...userColumns]
  }, [data, paginated])

  const handleChangePagination = (
    update: ((state: PaginationState) => PaginationState) | PaginationState,
  ) => {
    if (typeof update === 'function') {
      setPagination((prev) => {
        const newPaginationState = update(prev)
        const pageIndex = resolvePageSizeChanged(
          prev,
          newPaginationState,
          data.length,
        )

        const adjusted = {
          ...newPaginationState,
          pageIndex,
        }

        return adjusted
      })
    } else {
      setPagination(update)
    }
  }

  const centerContent = useMemo(() => {
    return `Showing ${
      pagination.pageIndex * pagination.pageSize + 1
    } - ${Math.min(
      pagination.pageIndex * pagination.pageSize + pagination.pageSize,
      data.length,
    )} of ${data.length}`
  }, [pagination, data.length])

  return (
    <>
      <Heading level={2} className="mb-2">
        {paginated ? 'Paginated Table' : 'Infinite Scroll Table'}
      </Heading>
      <div className="border border-solid border-gray-200 dark:border-gray-700">
        <Table
          data={data}
          columns={columns}
          options={{
            enableRowSelection: true,
            onRowSelectionChange: setRowSelection,
            onPaginationChange: paginated ? handleChangePagination : undefined,
            pageCount: paginated ? pageCount : undefined,
            state: {
              sorting,
              rowSelection,
              pagination: paginated ? pagination : undefined,
            },
            onSortingChange: setSorting,
          }}
          height={520}
          enableScrollToTop
          activeRow={activeRow}
          activeRowOverlay={(activeRow) => <div>{activeRow?.name}</div>}
          activeRowOverlayTitle={(activeRow) => activeRow?.name}
          onSelectActiveRow={handleSelectActiveRow}
        />

        {paginated && (
          <TablePaginationControls
            currentPage={pagination.pageIndex + 1}
            pageCount={pageCount}
            onSetPage={(page) =>
              setPagination((prev) => ({ ...prev, pageIndex: page - 1 }))
            }
            pageSize={pagination.pageSize}
            onSetPageSize={(pageSize) =>
              handleChangePagination((prev) => ({
                ...prev,
                pageSize,
              }))
            }
            centerContent={centerContent}
            height={40}
          />
        )}
      </div>

      <div className="dark:text-gray-200">
        {Object.keys(rowSelection).length} selected
      </div>
    </>
  )
}

export default {
  title: 'Components/Table',
  component: StoryContainer,
} as Meta

type Story = StoryObj<StoryProps>

export const InfiniteScroll: Story = {
  args: {
    data: fakeUsers(50),
  },
}

export const Paginated: Story = {
  args: {
    data: fakeUsers(100),
    paginated: true,
  },
}
