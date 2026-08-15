import {
  Archive,
  ArrowRight,
  Bell,
  Bookmark,
  Calendar,
  ChartBar,
  CheckCircle,
  Envelope,
  Fire,
  Gear,
  House,
  Info,
  Lock,
  MagnifyingGlass,
  Pencil,
  Plus,
  Question,
  ShieldCheck,
  Star,
  Trash,
  User,
  WarningCircle,
  X,
} from '@phosphor-icons/react'
import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Icon } from './Icon'
import { SvgOnly } from './SvgOnly'

export default {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    docs: {
      description: {
        component:
          'Decorates an svg icon with automatic sizing (`size-5`) and `shrink-0`. Pass any Phosphor icon as the `svg` prop.',
      },
    },
  },
} satisfies Meta<typeof Icon>

type Story = StoryObj<typeof Icon>

/** Default rendering with automatic `size-5` sizing */
export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon svg={<Fire />} />
      <Icon svg={<Fire weight="fill" />} />
      <Icon svg={<Fire weight="duotone" />} />
      <Icon svg={<Fire weight="thin" />} />
      <Icon svg={<Fire weight="light" />} />
      <Icon svg={<Fire weight="bold" />} />
    </div>
  ),
}

/** Apply color via Tailwind text-color utilities on `Icon` */
export const WithColor: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon svg={<Fire />} />
      <Icon className="text-fill-critical" svg={<Fire weight="fill" />} />
      <Icon className="text-amber-500" svg={<Fire weight="fill" />} />
      <Icon className="text-blue-500" svg={<Fire weight="fill" />} />
      <Icon className="text-green-500" svg={<CheckCircle weight="fill" />} />
      <Icon className="text-yellow-500" svg={<WarningCircle weight="fill" />} />
    </div>
  ),
}

/** Override sizing with custom classes — `className` on `Icon` wins over base `size-5` */
export const CustomSize: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Icon className="size-3" svg={<Star weight="fill" />} />
      <Icon className="size-4" svg={<Star weight="fill" />} />
      <Icon svg={<Star weight="fill" />} />
      {/* default size-5 */}
      <Icon className="size-6" svg={<Star weight="fill" />} />
      <Icon className="size-8" svg={<Star weight="fill" />} />
      <Icon className="size-12" svg={<Star weight="fill" />} />
    </div>
  ),
}

/**
 * className merging precedence:
 * `shrink-0` (SvgOnly base) → `size-5` (Icon base) → Icon className → svg className
 */
export const ClassNameMerging: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-foreground-subtle w-72 text-sm">
          No className:
        </span>
        <Icon svg={<Fire />} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-foreground-subtle w-72 text-sm">
          svg className only:
        </span>
        <Icon svg={<Fire className="size-12 text-orange-500" />} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-foreground-subtle w-72 text-sm">
          Icon className only:
        </span>
        <Icon className="size-12 text-blue-500" svg={<Fire />} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-foreground-subtle w-72 text-sm">
          Both (svg wins):
        </span>
        <Icon
          className="size-12 text-blue-500"
          svg={<Fire className="text-fill-critical size-6" />}
        />
      </div>
    </div>
  ),
}

/** A gallery of common Phosphor icons */
export const Gallery: Story = {
  render: () => (
    <div className="grid grid-cols-12 gap-4 p-4">
      {[
        Archive,
        ArrowRight,
        Bell,
        Bookmark,
        Calendar,
        ChartBar,
        CheckCircle,
        Envelope,
        Fire,
        Gear,
        House,
        Info,
        Lock,
        MagnifyingGlass,
        Pencil,
        Plus,
        Question,
        ShieldCheck,
        Star,
        Trash,
        User,
        WarningCircle,
        X,
      ].map((PhosphorIcon, i) => (
        <Icon key={i} svg={<PhosphorIcon />} />
      ))}
    </div>
  ),
}

/** SvgOnly — lower-level primitive without the default `size-5` */
export const SvgOnlyExample: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <SvgOnly svg={<Fire className="size-4" />} />
      <SvgOnly svg={<Fire className="size-6 text-orange-500" />} />
      <SvgOnly
        svg={<Fire className="text-fill-critical size-8" weight="fill" />}
      />
    </div>
  ),
}
