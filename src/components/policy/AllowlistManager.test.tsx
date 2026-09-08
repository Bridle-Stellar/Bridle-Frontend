import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AllowlistManager } from './AllowlistManager'

const VALID_ADDRESS = 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ'

describe('AllowlistManager', () => {
  it('keeps Approve disabled until a valid Stellar address and a label are entered', async () => {
    const user = userEvent.setup()
    render(<AllowlistManager allowlist={[]} onAdd={vi.fn()} onRemove={vi.fn()} saving={false} error={null} />)

    const approveButton = screen.getByRole('button', { name: 'Approve destination' })
    expect(approveButton).toBeDisabled()

    await user.type(screen.getByPlaceholderText('Stellar address (G...)'), 'not-a-real-address')
    expect(screen.getByText("That doesn't look like a valid Stellar address.")).toBeInTheDocument()
    expect(approveButton).toBeDisabled()
  })

  it('enables Approve once a valid address and label are both present, and submits them on confirm', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn().mockResolvedValue(undefined)
    render(<AllowlistManager allowlist={[]} onAdd={onAdd} onRemove={vi.fn()} saving={false} error={null} />)

    await user.type(screen.getByPlaceholderText('Label, e.g. OpenAI API'), 'OpenAI API')
    await user.type(screen.getByPlaceholderText('Stellar address (G...)'), VALID_ADDRESS)

    const approveButton = screen.getByRole('button', { name: 'Approve destination' })
    expect(approveButton).toBeEnabled()

    await user.click(approveButton)
    await user.click(screen.getByRole('button', { name: 'Sign & approve' }))

    expect(onAdd).toHaveBeenCalledWith(VALID_ADDRESS, 'OpenAI API')
  })

  it('warns instead of allowing a duplicate destination', async () => {
    const user = userEvent.setup()
    render(
      <AllowlistManager
        allowlist={[{ destination: VALID_ADDRESS, category: 'Existing' }]}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        saving={false}
        error={null}
      />,
    )

    await user.type(screen.getByPlaceholderText('Label, e.g. OpenAI API'), 'Duplicate')
    await user.type(screen.getByPlaceholderText('Stellar address (G...)'), VALID_ADDRESS)

    expect(screen.getByText('This destination is already approved.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve destination' })).toBeDisabled()
  })
})
