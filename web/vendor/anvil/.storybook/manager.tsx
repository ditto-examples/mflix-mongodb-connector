import React from 'react'
import { addons, types, useGlobals } from 'storybook/manager-api'
import {
  IconButton,
  TooltipLinkList,
  WithTooltip,
} from 'storybook/internal/components'
import { BrowserIcon, MoonIcon, SunIcon } from '@storybook/icons'

const ADDON_ID = 'ditto/theme-switcher'
const TOOL_ID = `${ADDON_ID}/tool`

addons.setConfig({
  brandTitle: 'Anvil',
})

const LightHighContrastIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    fill="currentColor"
  >
    <path d="M7 11.5a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-1 0V12a.5.5 0 0 1 .5-.5M3.464 10.036a.5.5 0 0 1 .354.853l-1.06 1.06a.5.5 0 1 1-.708-.706l1.06-1.06a.5.5 0 0 1 .354-.147M10.535 10.036a.5.5 0 0 1 .354.146l1.06 1.06a.499.499 0 1 1-.706.708l-1.061-1.06a.5.5 0 0 1 0-.708.5.5 0 0 1 .353-.146M7 4a3.002 3.002 0 0 1 2.771 4.148A3 3 0 1 1 7 4M2 6.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1zM13.5 6.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1 0-1zM11.599 1.897a.5.5 0 0 1 .351.86L10.89 3.818a.5.5 0 1 1-.707-.707l1.061-1.061a.5.5 0 0 1 .356-.153M2.401 1.897a.5.5 0 0 1 .356.153L3.818 3.11a.5.5 0 0 1-.708.707L2.05 2.757a.5.5 0 0 1-.115-.549.5.5 0 0 1 .466-.31M7 0a.5.5 0 0 1 .5.5V2a.5.5 0 0 1-1 0V.5A.5.5 0 0 1 7 0" />
  </svg>
)

const DarkHighContrastIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    fill="currentColor"
  >
    <path d="M7.78.044 7.64.03a7 7 0 1 0 5.73 9.872c.096-.214-.145-.417-.36-.323A4.999 4.999 0 0 1 8.543.645c.202-.115.186-.43-.044-.481a7 7 0 0 0-.72-.12" />
  </svg>
)

type ThemeOption = {
  value: string
  title: string
  Icon: React.ComponentType
}

const themeOptions: readonly ThemeOption[] = [
  { value: 'system', title: 'System', Icon: BrowserIcon },
  { value: 'light', title: 'Light', Icon: SunIcon },
  { value: 'dark', title: 'Dark', Icon: MoonIcon },
  {
    value: 'light-high-contrast',
    title: 'Light high contrast',
    Icon: LightHighContrastIcon,
  },
  {
    value: 'dark-high-contrast',
    title: 'Dark high contrast',
    Icon: DarkHighContrastIcon,
  },
]

const ThemeTool: React.FC = () => {
  const [globals, updateGlobals] = useGlobals()
  const current = (globals.theme as string | undefined) ?? 'system'
  const active =
    themeOptions.find((opt) => opt.value === current) ?? themeOptions[0]
  const ActiveIcon = active.Icon

  return (
    <WithTooltip
      placement="bottom"
      trigger="click"
      closeOnOutsideClick
      tooltip={({ onHide }: { onHide: () => void }) => (
        <TooltipLinkList
          links={themeOptions.map((opt) => {
            const Icon = opt.Icon
            return {
              id: opt.value,
              title: opt.title,
              icon: <Icon />,
              active: current === opt.value,
              onClick: () => {
                updateGlobals({ theme: opt.value })
                onHide()
              },
            }
          })}
        />
      )}
    >
      <IconButton key={TOOL_ID} title={`Theme: ${active.title}`}>
        <ActiveIcon />
      </IconButton>
    </WithTooltip>
  )
}

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    title: 'Theme',
    type: types.TOOL,
    match: ({ viewMode }) => viewMode === 'story' || viewMode === 'docs',
    render: ThemeTool,
  })
})
