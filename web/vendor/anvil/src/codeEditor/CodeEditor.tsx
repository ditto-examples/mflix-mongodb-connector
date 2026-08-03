import CodeMirror, {
  BasicSetupOptions,
  Extension,
  ReactCodeMirrorProps,
} from '@uiw/react-codemirror'
import React from 'react'

import { useDetectTheme } from '../hooks'
import { dittoDarkTheme, dittoLightTheme } from './themes'

export type CodeEditorProps = {
  /** The current value of the editor */
  value?: string
  /** Callback for when the content changes */
  onChange?: (value: string) => void
  /** Height of the editor */
  height?: string
  /** Whether the editor is read-only */
  readOnly?: boolean
  /** CodeMirror language extension */
  language: Extension
  /** Optional CodeMirror linter extension */
  linter?: Extension
  /** CodeMirror basic setup options */
  options?: BasicSetupOptions
} & Omit<
  ReactCodeMirrorProps,
  'onChange' | 'value' | 'height' | 'readOnly' | 'basicSetup' | 'extensions'
>

export default function CodeEditor({
  value,
  onChange,
  height = '300px',
  readOnly = false,
  language,
  linter,
  options,
  ...rest
}: CodeEditorProps) {
  return (
    <CodeMirror
      {...rest}
      basicSetup={options}
      value={value}
      onChange={onChange}
      height={height}
      readOnly={readOnly}
      theme={useDetectTheme() === 'dark' ? dittoDarkTheme : dittoLightTheme}
      extensions={[language, ...(linter ? [linter] : [])]}
    />
  )
}
