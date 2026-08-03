import { DotsThreeVerticalIcon } from '@phosphor-icons/react'
import React, { ComponentProps, Fragment, useState } from 'react'

import { buttonVariants } from '../button/Button'
import { Icon } from '../icon/Icon'
import Tooltip from '../tooltip/Tooltip'
import classes from '../utils/styles'
import { DropdownMenu } from './base'

type ActionMenuItemBase = {
  id?: string
  /**
   * A class name to apply to the item
   */
  className?: string
  /**
   * Whether the item is currently active
   */
  active?: boolean
  /**
   * Whether the item is disabled
   */
  disabled?: boolean
  tip?: {
    content: string
  } & Pick<ComponentProps<typeof Tooltip>, 'side'>
  variant?: 'default' | 'critical'
}

type ActionMenuItemControlled = {
  /**
   * The label to display for the item
   */
  label: string
  /**
   * The function to call when the item is clicked
   */
  onClick: () => void
  /**
   * An optional icon to display next to the label
   */
  icon?: React.ComponentType
  /**
   * Where to display the icon
   */
  iconPosition?: 'left' | 'right'

  render?: undefined
}

type ActionMenuItemCustom = {
  label?: undefined
  onClick?: undefined
  icon?: undefined
  iconPosition?: undefined
  id: string
  render: () => JSX.Element
}

export type ActionMenuItem = ActionMenuItemBase &
  (ActionMenuItemControlled | ActionMenuItemCustom)

export type ActionMenuItemGroup = {
  label?: string
  items: ActionMenuItem[]
}

type ItemsProps = {
  groups?: never
  /**
   * List of items to display in the menu
   */
  items: ActionMenuItem[]
}

type GroupsProps = {
  items?: never
  /**
   * List of groups to display in the menu
   */
  groups: ActionMenuItemGroup[]
}

type WithTrigger = {
  trigger: React.ReactNode
  icon: never
  iconClassName: never
  itemsClassName: never
}

type WithoutTrigger = {
  /**
   * Icon to display in the button, defaults to `MenuVertical`
   */
  icon?: React.ComponentType
  /**
   * Optional class name for the icon
   */
  iconClassName?: string
  /**
   * Optional class name for the items container
   */
  itemsClassName?: string
}

type TriggerProps = WithTrigger | WithoutTrigger
type ItemOrGroupProps = ItemsProps | GroupsProps

type Props = TriggerProps &
  ItemOrGroupProps &
  Pick<ComponentProps<typeof DropdownMenu.Content>, 'align' | 'alignOffset'> & {
    /**
     * Callback fired when the dropdown's open state changes
     */
    onOpenChange?: (open: boolean) => void
    /**
     * Whether the dropdown is disabled and cannot be opened
     */
    disabled?: boolean
  }

export function ActionMenu({ groups, items, ...props }: Props) {
  const [open, setOpen] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    // Prevent opening when disabled
    if (newOpen && props.disabled) {
      return
    }

    setOpen(newOpen)
    props.onOpenChange?.(newOpen)
  }

  const renderTrigger = () => {
    if ('trigger' in props) {
      return (
        <DropdownMenu.Trigger
          asChild
          data-testid="actionMenuTrigger"
          disabled={props.disabled}
        >
          {props.trigger}
        </DropdownMenu.Trigger>
      )
    } else {
      const { icon, iconClassName } = props
      const TriggerIcon = icon ?? null

      return (
        <DropdownMenu.Trigger
          className={buttonVariants({ size: 'icon', variant: 'ghost' })}
          data-testid="actionMenuTrigger"
          disabled={props.disabled}
        >
          <Icon
            svg={TriggerIcon ? <TriggerIcon /> : <DotsThreeVerticalIcon />}
            className={iconClassName}
          />
        </DropdownMenu.Trigger>
      )
    }
  }

  const renderItems = (scopedItems: ActionMenuItem[]) => {
    return scopedItems.map(
      ({
        label,
        onClick,
        className,
        disabled,
        icon,
        iconPosition,
        active,
        id,
        render,
        tip,
        variant = 'default',
      }) => {
        // This is an invalid item and shouldn't happen
        if (!label && !render) {
          return null
        }

        const Container = ({ children }: { children: React.ReactNode }) =>
          tip ? (
            <Tooltip tip={tip.content} side={tip.side}>
              {children}
            </Tooltip>
          ) : (
            <Fragment>{children}</Fragment>
          )

        if (render) {
          return (
            <Container key={id}>
              <DropdownMenu.Item
                disabled={disabled}
                onClick={onClick}
                onSelect={(event) => event.preventDefault()}
                active={active}
                data-testid={id}
                className={classes(className, props.itemsClassName)}
              >
                {render()}
              </DropdownMenu.Item>
            </Container>
          )
        }

        const ItemIcon = icon ?? null
        const position = iconPosition || 'left'

        return (
          <Container key={label}>
            <DropdownMenu.Item
              key={label}
              disabled={disabled}
              onClick={onClick}
              active={active}
              data-testid={id}
              className={classes(
                { 'text-fill-critical': variant === 'critical' },
                className,
                props.itemsClassName,
              )}
            >
              {ItemIcon && position === 'left' && (
                <Icon
                  svg={<ItemIcon />}
                  className={classes('text-foreground-subtle mr-2 size-4', {
                    'text-fill-critical': variant === 'critical',
                  })}
                />
              )}
              {label}
              {ItemIcon && position === 'right' && (
                <Icon
                  svg={<ItemIcon />}
                  className={classes('text-foreground-subtle ml-2 size-4', {
                    'text-fill-critical': variant === 'critical',
                  })}
                />
              )}
            </DropdownMenu.Item>
          </Container>
        )
      },
    )
  }

  const renderGroup = (group: ActionMenuItemGroup) => {
    const { label, items } = group

    return (
      <DropdownMenu.Group key={`group-${label || items.length}`}>
        {label && <DropdownMenu.Label>{label}</DropdownMenu.Label>}
        {renderItems(items)}
      </DropdownMenu.Group>
    )
  }

  const renderContent = () => {
    if (groups) {
      return groups.map((group, idx) => {
        const renderedGroup = renderGroup(group)
        if (idx === groups.length - 1) {
          return renderedGroup
        } else {
          return (
            <Fragment key={idx}>
              {renderedGroup}
              <DropdownMenu.Separator />
            </Fragment>
          )
        }
      })
    } else {
      return renderItems(items)
    }
  }

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={handleOpenChange}>
      {renderTrigger()}

      <DropdownMenu.Content align={props.align} alignOffset={props.alignOffset}>
        {renderContent()}
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
