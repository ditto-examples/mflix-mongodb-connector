import React from 'react'
import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form'

import { classes } from '../utils'

export type FormProps<T extends FieldValues> = {
  form: UseFormReturn<T>
  onSubmit: SubmitHandler<T>
  fieldsetClassName?: string
  disabled?: boolean
} & Omit<React.ComponentProps<'form'>, 'onSubmit'>

export function Form<T extends FieldValues>({
  form,
  onSubmit,
  children,
  fieldsetClassName,
  disabled,
  ...props
}: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
        <fieldset
          className={classes('flex min-w-0 flex-col gap-4', fieldsetClassName)}
          disabled={form.formState.isSubmitting || disabled}
        >
          {children}
        </fieldset>
      </form>
    </FormProvider>
  )
}
