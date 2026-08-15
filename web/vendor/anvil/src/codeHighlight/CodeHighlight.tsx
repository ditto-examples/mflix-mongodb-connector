/* eslint-disable simple-import-sort/imports -- Prism must initialize before its language modules. */
import { Highlight, Language, themes } from 'prism-react-renderer'
import React from 'react'

import { classes } from '../utils'
import Prism from './prism'

import 'prismjs/components/prism-groovy.js'
import 'prismjs/components/prism-kotlin.js'
import 'prismjs/components/prism-ruby.js'
import 'prismjs/components/prism-sql.js'
import 'prismjs/components/prism-swift.js'
import 'prismjs/components/prism-csharp.js'
import 'prismjs/components/prism-json.js'

type AddedLanguage =
  | 'groovy'
  | 'kotlin'
  | 'ruby'
  | 'swift'
  | 'csharp'
  // XML is supported without an import above because `prism-react-renderer`
  // bundles the `markup` language, which XML extends in `prismjs`.
  | 'xml'

export interface CodeHighlightProps {
  /** The code to highlight */
  code: string
  /** The language to highlight the code as */
  language?: Language | AddedLanguage
  /** Whether or not to show line numbers */
  lineNumbers?: boolean
  /** Optional className to be applied to the `pre` tag wrapper element */
  className?: string
  /** Whether or not to round the corners of the code block */
  isRounded?: boolean
}

export const CodeHighlight = ({
  code,
  language,
  lineNumbers,
  className: preClassName,
  isRounded,
}: CodeHighlightProps): React.ReactElement => {
  return (
    <Highlight
      prism={Prism}
      // We pass vsDark so prism-react-renderer attaches its token classNames.
      // All colors are driven by CSS variables in theme.css — the inline style
      // object from the theme is discarded below.
      theme={themes.vsDark}
      code={code}
      language={(language ?? 'bash') as Language}
    >
      {({ className, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={classes(
            className,
            'font-plex-mono overflow-x-auto px-3 py-5 text-sm',
            { 'rounded-md': isRounded },
            preClassName,
          )}
          // No `style` prop — background and foreground come from .prism-code
          // in theme.css, which owns the full vsDark palette as CSS variables.
        >
          {tokens.map((line, i) => {
            const { className, ...lineProps } = getLineProps({ line, key: i })
            return (
              <div
                key={i}
                className={classes(className, { 'table-row': lineNumbers })}
                {...lineProps}
              >
                {lineNumbers && (
                  <span className="text-foreground-subtle table-cell select-none pr-4 text-right">
                    {i + 1}
                  </span>
                )}
                <span className={classes({ 'table-cell': lineNumbers })}>
                  {line.map((token, key) => {
                    const tokenProps = getTokenProps({ token, key })
                    // Drop the inline style — token colors are handled by
                    // .token.* rules in theme.css.
                    return <span key={key} {...tokenProps} style={undefined} />
                  })}
                </span>
              </div>
            )
          })}
        </pre>
      )}
    </Highlight>
  )
}
