import { Alert, AlertProvider } from './alert'
import { Avatar } from './avatar'
import { Badge } from './badge'
import Card from './card'
import { type CodeEditorProps, CodeEditor } from './codeEditor'
import { CodeHighlight } from './codeHighlight'
import { Command } from './command'
import { CopyableEntry, MASKED_VALUE } from './copyableEntry'
import {
  Calendar,
  DatePicker,
  RangeDatePicker,
  RangeDatePickerQuickSelect,
  RawDatePicker,
} from './datePicker'
import { type ConfirmationDialogProps, ConfirmationDialog } from './dialog'
import {
  configurationHash,
  DittoConnectionValues,
  DittoIdentityType,
  DittoLogo,
} from './ditto'
import { type EmptyStateProps, EmptyState } from './emptyState'
import { FileUploader } from './fileUploader'
import {
  type SelectOption,
  CheckBox,
  ComboBox,
  RadioButtonList,
  RawSelect,
  Select,
  Switch,
} from './form'
import {
  type Platform,
  useAnimatedSetState,
  useAnimationCycle,
  useBodyLock,
  useCopyToClipboard,
  useCurrentOrPrevious,
  useDetectTheme,
  useDevicePlatform,
  useLogSpan,
  useMediaMatch,
  usePopper,
  usePrevious,
  usePreviousIsDifferent,
  useScript,
  useSize,
} from './hooks'
import Image from './image'
import { InputError } from './input'
import {
  isSupportedJSONPickerType,
  JSONKeyPicker,
  SupportedJSONPickerType,
  toSupportedJSONPickerType,
} from './jsonKeyPicker'
import { Link, RawLink } from './link'
import MessagePanel from './messagePanel'
import { Popover } from './Popover'
import { ProgressBar } from './progressBar'
import Separator from './separator'
import SlideOverPanel, { Sheet } from './slideOver'
import { ProgressSpinner } from './spinner'
import {
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type TableCellProps,
  type TableColumnDef,
  type TableRowProps,
  createColumnHelper,
  DEFAULT_TABLE_HEADER_ROW_HEIGHT,
  DEFAULT_TABLE_ROW_HEIGHT,
  getCommonPinningStyles,
  renderUnknownValue,
  resolveTablePageSizeChanged,
  Table,
  TableActionsHeaderButton,
  TableCell,
  TablePageSelector,
  TablePageSizeSelector,
  TablePaginationControls,
  TableRow,
} from './table'
import { Tabs } from './tabs'
import TextDownload from './textDownload'
import {
  type ResolvedTheme,
  type Theme,
  isTheme,
  ThemeProvider,
  useTheme,
  useThemeStore,
} from './themeProvider'
import { Toaster } from './toast'
import { Tooltip } from './tooltip'
import { TwoColumn } from './twoColumn'
import {
  classes,
  noop,
  randomU64,
  stringify,
  truncate,
  truncateString,
  uuid,
  validations,
} from './utils'

export {
  Alert,
  AlertProvider,
  Avatar,
  Badge,
  Calendar,
  Card,
  CheckBox,
  classes,
  CodeEditor,
  CodeHighlight,
  ComboBox,
  Command,
  configurationHash,
  ConfirmationDialog,
  CopyableEntry,
  createColumnHelper,
  DatePicker,
  DEFAULT_TABLE_HEADER_ROW_HEIGHT,
  DEFAULT_TABLE_ROW_HEIGHT,
  DittoLogo,
  EmptyState,
  FileUploader,
  getCommonPinningStyles,
  Image,
  InputError,
  isSupportedJSONPickerType,
  isTheme,
  JSONKeyPicker,
  Link,
  MASKED_VALUE,
  MessagePanel,
  noop,
  Popover,
  ProgressBar,
  ProgressSpinner,
  RadioButtonList,
  randomU64,
  RangeDatePicker,
  RangeDatePickerQuickSelect,
  RawDatePicker,
  RawLink,
  RawSelect,
  renderUnknownValue,
  resolveTablePageSizeChanged,
  Select,
  Separator,
  Sheet,
  SlideOverPanel,
  stringify,
  Switch,
  Table,
  TableActionsHeaderButton,
  TableCell,
  TablePageSelector,
  TablePageSizeSelector,
  TablePaginationControls,
  TableRow,
  Tabs,
  TextDownload,
  ThemeProvider,
  Toaster,
  Tooltip,
  toSupportedJSONPickerType,
  truncate,
  truncateString,
  TwoColumn,
  useAnimatedSetState,
  useAnimationCycle,
  useBodyLock,
  useCopyToClipboard,
  useCurrentOrPrevious,
  useDetectTheme,
  useDevicePlatform,
  useLogSpan,
  useMediaMatch,
  usePopper,
  usePrevious,
  usePreviousIsDifferent,
  useScript,
  useSize,
  useTheme,
  useThemeStore,
  uuid,
  validations,
}

export * from './button'
export * from './buttonGroup'
export type { CalendarProps, DateRange, RawDatePickerProps } from './datePicker'
export * from './dialog'
export * from './dropdown'
export * from './form'
export * from './icon'
export * from './input'
export * from './label'
export * from './resizable'
export * from './typography'

export type {
  CodeEditorProps,
  ColumnFiltersState,
  ConfirmationDialogProps,
  DittoConnectionValues,
  DittoIdentityType,
  EmptyStateProps,
  PaginationState,
  Platform,
  ResolvedTheme,
  RowSelectionState,
  SelectOption,
  SortingState,
  SupportedJSONPickerType,
  TableCellProps,
  TableColumnDef,
  TableRowProps,
  Theme,
}

/**
 * A utility type to simplify complex types to appease the type checker and avoid excessive
 * instantiation depth lints. This should be used sparingly and only when necessary.
 * Sourced from [`kysely`](https://kysely.dev/)
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type Simplify<T> = { [K in keyof T]: T[K] } & {}
