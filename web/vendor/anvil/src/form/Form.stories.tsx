import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '../button'
import { Input } from '../input'
import { Form } from './Form'

type Fields = { name: string }

type Props = {
  label?: string
  description?: string
  errorMessage?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  fieldsetClassName?: string
}

const FormDemo = ({
  label,
  description,
  errorMessage,
  placeholder,
  required = false,
  disabled = false,
  fieldsetClassName,
}: Props) => {
  const form = useForm<Fields>({ defaultValues: { name: '' } })
  const [submitted, setSubmitted] = React.useState('')
  const validationMessage = form.formState.errors.name?.message

  return (
    <div className="w-80 p-6 font-sans">
      <Form
        form={form}
        disabled={disabled}
        onSubmit={({ name }) => setSubmitted(name)}
        fieldsetClassName={fieldsetClassName}
      >
        <Input
          label={label}
          description={description}
          errorMessage={errorMessage || validationMessage}
          placeholder={placeholder}
          required={required}
          {...form.register('name', {
            required: required ? 'App name is required.' : false,
          })}
        />
        <Button type="submit" variant="primary">
          Submit
        </Button>
        {submitted && (
          <p className="text-foreground-subtle text-sm">
            Submitted: {submitted}
          </p>
        )}
      </Form>
    </div>
  )
}

export default {
  title: 'Components/Form/Form',
  component: FormDemo,
  argTypes: {
    label: {
      control: 'text',
      description: 'Label displayed above the input',
    },
    description: {
      control: 'text',
      description: 'Helper text shown below the input when there is no error',
    },
    errorMessage: {
      control: 'text',
      description:
        'Error message shown below the input, replacing its description',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder displayed inside the input',
    },
    required: {
      control: 'boolean',
      description: 'Marks the input as required and validates it on submission',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables every control in the form fieldset',
    },
    fieldsetClassName: {
      control: 'text',
      description: 'Additional classes applied to the form fieldset',
    },
  },
} satisfies Meta<typeof FormDemo>

type Story = StoryObj<typeof FormDemo>

const defaultArgs: Props = {
  label: 'App name',
  placeholder: 'Enter a value...',
  required: false,
  disabled: false,
}

export const Default: Story = { args: defaultArgs }

export const WithDescription: Story = {
  args: {
    ...defaultArgs,
    description: 'This name will be shown to users in the portal.',
  },
}

export const Required: Story = {
  args: { ...defaultArgs, required: true },
}

export const RequiredWithDescription: Story = {
  args: {
    ...defaultArgs,
    description: 'This name will be shown to users in the portal.',
    required: true,
  },
}

export const WithError: Story = {
  args: {
    ...defaultArgs,
    errorMessage: 'App name is required.',
    required: true,
  },
}

export const WithErrorAndDescription: Story = {
  args: {
    ...defaultArgs,
    description: 'This name will be shown to users in the portal.',
    errorMessage: 'App name must be at least 3 characters.',
    required: true,
  },
}

export const Disabled: Story = {
  args: {
    ...defaultArgs,
    description: 'All controls are disabled by the enclosing fieldset.',
    disabled: true,
  },
}

export const NoLabel: Story = {
  args: {
    ...defaultArgs,
    label: undefined,
    description: 'Enter a value to continue.',
  },
}

export const NoLabelWithError: Story = {
  args: {
    ...defaultArgs,
    label: undefined,
    errorMessage: 'This field cannot be empty.',
  },
}
