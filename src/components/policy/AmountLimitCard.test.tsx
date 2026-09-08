import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AmountLimitCard } from './AmountLimitCard'

describe('AmountLimitCard', () => {
  it('disables Save until the amount actually changes to something valid', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)

    render(
      <AmountLimitCard
        title="Daily cap"
        helpText="help"
        currentSmallestUnit="1000000"
        token="native"
        onSave={onSave}
        saving={false}
        saveError={null}
      />,
    )

    const input = screen.getByLabelText('Daily cap')
    const saveButton = screen.getByRole('button', { name: 'Save' })
    expect(saveButton).toBeDisabled()

    // Unchanged value (same as current, just reformatted) should stay disabled.
    await user.clear(input)
    await user.type(input, '0.1')
    expect(saveButton).toBeDisabled()
  })

  it('rejects non-positive or non-numeric input with a validation message', async () => {
    const user = userEvent.setup()
    render(
      <AmountLimitCard title="Daily cap" helpText="help" currentSmallestUnit="1000000" token="native" onSave={vi.fn()} saving={false} saveError={null} />,
    )

    const input = screen.getByLabelText('Daily cap')
    await user.clear(input)
    await user.type(input, '-5')
    expect(screen.getByText('Enter a positive number.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('shows an old -> new diff and calls onSave with the smallest-unit amount on confirm', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)

    render(
      <AmountLimitCard title="Daily cap" helpText="help" currentSmallestUnit="1000000" token="native" onSave={onSave} saving={false} saveError={null} />,
    )

    const input = screen.getByLabelText('Daily cap')
    await user.clear(input)
    await user.type(input, '5')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText(/0\.1 XLM/)).toBeInTheDocument()
    expect(dialog.getByText(/5 XLM/)).toBeInTheDocument()

    await user.click(dialog.getByRole('button', { name: 'Sign & save' }))
    expect(onSave).toHaveBeenCalledWith('50000000')
  })
})
