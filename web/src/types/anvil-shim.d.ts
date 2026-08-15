// Type shim for the vendored anvil design system.
//
// Why: anvil's source was authored against React 18 types and its own
// tsconfig; under OUR tsc gate (React 19 types, stricter flags) it produces
// ~1,400 errors we must not fix in vendored code. So tsconfig `paths` sends
// TypeScript here, while the Vite alias still compiles the real source at
// vendor/anvil/src. Trade-off: anvil props are loosely typed until the real
// @dittolive/anvil npm package (with its own .d.ts) replaces the vendor copy
// — at which point delete this file and both config entries.
//
// Signatures below are hand-transcribed from the component sources; add
// components here as the app adopts them.
import type * as React from 'react'

export declare const Button: React.ComponentType<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: string
    size?: string
    asChild?: boolean
  }
>

/** Watches OS dark-mode preference; render once near the app root. */
export declare const ThemeProvider: React.ComponentType<React.PropsWithChildren>

export declare const Card: React.ComponentType<{
  className?: string
  children?: React.ReactNode
  isDivided?: boolean
}> & {
  Body: React.ComponentType<
    React.HTMLAttributes<HTMLDivElement> & { isFlushed?: boolean }
  >
  Header: React.ComponentType<
    React.HTMLAttributes<HTMLDivElement> & { isFlushed?: boolean }
  >
  Footer: React.ComponentType<
    React.HTMLAttributes<HTMLDivElement> & { isFlushed?: boolean }
  >
  Spacer: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>
}

/** img with a built-in error fallback source. */
export declare const Image: React.ComponentType<
  React.ImgHTMLAttributes<HTMLImageElement> & { fallback?: string }
>

export declare const Badge: React.ComponentType<
  React.HTMLAttributes<HTMLSpanElement> & {
    colorScheme?:
      | 'gray'
      | 'red'
      | 'green'
      | 'darkGreen'
      | 'blue'
      | 'yellow'
      | 'amber'
      | 'sunset'
      | 'neutral'
      | 'brand'
    size?: 'xs' | 'sm' | 'default' | 'lg'
  }
>

export declare const EmptyState: React.ComponentType<{
  message: string
  className?: string
  icon?: boolean
  iconProps?: Record<string, unknown>
}>

export declare const ProgressSpinner: React.ComponentType<{
  className?: string
}>

export declare const Heading: React.ComponentType<
  React.HTMLAttributes<HTMLHeadingElement> & { level: 1 | 2 | 3 | 4 }
>

/** Input/TextArea carry label + description + errorMessage rendering. */
export declare const Input: React.ComponentType<
  React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string
    description?: string
    errorMessage?: string
    containerClassName?: string
    leadingIcon?: React.ReactNode
    trailingIcon?: React.ReactNode
  }
>
export declare const TextArea: React.ComponentType<
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string
    description?: string
    errorMessage?: string
  }
>

export declare const DittoLogo: React.ComponentType<
  React.SVGProps<SVGSVGElement>
>

/** CodeMirror wrapper; `language` takes a CodeMirror language Extension. */
export declare const CodeEditor: React.ComponentType<{
  value?: string
  onChange?: (value: string) => void
  height?: string
  readOnly?: boolean
  language: unknown
  className?: string
  onKeyDown?: (e: React.KeyboardEvent) => void
}>
