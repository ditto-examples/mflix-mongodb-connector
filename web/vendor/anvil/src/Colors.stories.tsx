import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

const COLOR_FAMILIES = [
  'red',
  'sunset',
  'orange',
  'amber',
  'yellow',
  'citrus',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'mauve',
  'olive',
  'mist',
  'taupe',
] as const

const SHADES = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
] as const

const SWATCH_SIZE = 48

const SEMANTIC_COLOR_GROUPS = [
  {
    name: 'Background',
    tokens: [
      '--background',
      '--background-surface',
      '--background-surface-hovered',
      '--background-surface-secondary',
      '--background-overlay',
      '--background-overlay-hovered',
      '--background-inverse',
    ],
  },
  {
    name: 'Fill',
    tokens: [
      '--fill-brand-primary',
      '--fill-brand-primary-hovered',
      '--fill-brand-secondary',
      '--fill-brand-secondary-hovered',
      '--fill-disabled',
      '--fill-opaque',
      '--fill-info',
      '--fill-info-secondary',
      '--fill-success',
      '--fill-success-secondary',
      '--fill-warning',
      '--fill-warning-secondary',
      '--fill-critical',
      '--fill-critical-secondary',
      '--fill-promo',
      '--fill-promo-secondary',
      '--fill-control-selected',
    ],
  },
  {
    name: 'Foreground',
    tokens: [
      '--foreground-normal',
      '--foreground-subtle',
      '--foreground-accent',
      '--foreground-warning',
      '--foreground-disabled',
      '--foreground-on-fill',
      '--foreground-on-inverse',
      '--foreground-on-brand-primary',
    ],
  },
  {
    name: 'Border',
    tokens: [
      '--border-normal',
      '--border-strong',
      '--border-info',
      '--border-success',
      '--border-warning',
      '--border-critical',
      '--border-promo',
      '--border-control-selected',
    ],
  },
  {
    name: 'Ring and focus',
    tokens: ['--ring', '--focus-outline'],
  },
  {
    name: 'Shadow',
    tokens: ['--color-shadow-shallow', '--color-shadow', '--color-shadow-deep'],
  },
] as const

const checkerboardBackground = {
  backgroundColor: 'var(--background-surface)',
  backgroundImage:
    'linear-gradient(45deg, var(--border-normal) 25%, transparent 25%), linear-gradient(-45deg, var(--border-normal) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--border-normal) 75%), linear-gradient(-45deg, transparent 75%, var(--border-normal) 75%)',
  backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0',
  backgroundSize: '12px 12px',
}

const SemanticColorSwatch = ({ token }: { token: string }) => (
  <div className="min-w-0">
    <div
      className="border-border-normal h-16 overflow-hidden rounded-sm border"
      style={checkerboardBackground}
    >
      <div className="size-full" style={{ backgroundColor: `var(${token})` }} />
    </div>
    <code className="font-plex-mono text-foreground-subtle mt-1.5 block break-all text-xs">
      {token}
    </code>
  </div>
)

const ColorsDemo = () => (
  <div className="bg-background text-foreground-normal flex flex-col gap-10 p-6 font-sans">
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Semantic tokens</h1>
        <p className="text-foreground-subtle mt-1 text-sm">
          Theme-aware colors for backgrounds, fills, content, borders, and
          effects.
        </p>
      </div>
      {SEMANTIC_COLOR_GROUPS.map(({ name, tokens }) => (
        <div key={name} className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">{name}</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-3">
            {tokens.map((token) => (
              <SemanticColorSwatch key={token} token={token} />
            ))}
          </div>
        </div>
      ))}
    </section>

    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Palette</h1>
      {COLOR_FAMILIES.map((family) => (
        <div key={family} className="flex flex-col gap-1">
          <div className="text-sm font-medium capitalize">{family}</div>
          <div className="flex flex-wrap gap-2">
            {SHADES.map((shade) => {
              const variable = `--color-${family}-${shade}`
              return (
                <div
                  key={shade}
                  className="flex flex-col items-center gap-1"
                  title={variable}
                >
                  <div
                    className="border-border-normal border"
                    style={{
                      width: SWATCH_SIZE,
                      height: SWATCH_SIZE,
                      backgroundColor: `var(${variable})`,
                      borderRadius: 4,
                    }}
                  />
                  <span className="text-foreground-subtle text-xs">
                    {shade}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </section>
  </div>
)

export default {
  title: 'Theme/Colors',
  component: ColorsDemo,
} as Meta

type Story = StoryObj

export const Default: Story = {}
