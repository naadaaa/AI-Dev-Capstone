import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsForm from './SettingsForm';

function renderForm(onSubmit = vi.fn()) {
  render(<SettingsForm onSubmit={onSubmit} />);
  return {
    onSubmit,
    nameInput: screen.getByLabelText(/display name/i),
    emailInput: screen.getByLabelText(/email/i),
    bioInput: screen.getByLabelText(/bio/i),
    submitButton: screen.getByRole('button', { name: /save changes/i }),
  };
}

async function fillValid(user: ReturnType<typeof userEvent.setup>, fields: ReturnType<typeof renderForm>) {
  await user.type(fields.nameInput, 'Jane Doe');
  await user.type(fields.emailInput, 'jane@example.com');
}

describe('SettingsForm', () => {
  // --- Accessibility wiring -------------------------------------------------

  it('links each label to its input via htmlFor/id', () => {
    renderForm();
    expect(screen.getByLabelText(/display name/i)).toHaveAttribute('id', 'displayName');
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('id', 'email');
    expect(screen.getByLabelText(/bio/i)).toHaveAttribute('id', 'bio');
  });

  it('links error messages to inputs via aria-describedby when invalid', async () => {
    const user = userEvent.setup();
    const { nameInput } = renderForm();

    await user.type(nameInput, 'a');
    await user.tab();

    const error = await screen.findByText(/display name must be between 2 and 50 characters/i);
    expect(error).toHaveAttribute('id', 'displayName-error');
    expect(nameInput).toHaveAttribute('aria-describedby', 'displayName-error');
    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
  });

  // --- Submit button disabled state -----------------------------------------

  it('disables the submit button on initial render (empty required fields)', async () => {
    const { submitButton } = renderForm();
    await waitFor(() => expect(submitButton).toBeDisabled());
  });

  it('keeps the submit button disabled while any field is invalid', async () => {
    const user = userEvent.setup();
    const fields = renderForm();

    await user.type(fields.nameInput, 'Jane Doe');
    // Email left empty/invalid.
    expect(fields.submitButton).toBeDisabled();

    await user.type(fields.emailInput, 'not-an-email');
    expect(fields.submitButton).toBeDisabled();
  });

  it('enables the submit button once all fields are valid', async () => {
    const user = userEvent.setup();
    const fields = renderForm();

    await fillValid(user, fields);

    await waitFor(() => expect(fields.submitButton).toBeEnabled());
  });

  it('disables the submit button while the submit handler is pending', async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });
    const onSubmit = vi.fn().mockReturnValue(pending);
    const fields = renderForm(onSubmit);

    await fillValid(user, fields);
    await waitFor(() => expect(fields.submitButton).toBeEnabled());

    await user.click(fields.submitButton);
    expect(fields.submitButton).toBeDisabled();

    resolveSubmit();
    await waitFor(() => expect(fields.submitButton).toBeEnabled());
  });

  // --- Display name validation ----------------------------------------------

  it('rejects a display name shorter than 2 characters', async () => {
    const user = userEvent.setup();
    const { nameInput } = renderForm();

    await user.type(nameInput, 'A');
    await user.tab();

    expect(
      await screen.findByText(/display name must be between 2 and 50 characters/i)
    ).toBeInTheDocument();
  });

  it('rejects a whitespace-only display name', async () => {
    const user = userEvent.setup();
    const { nameInput } = renderForm();

    await user.type(nameInput, '     ');
    await user.tab();

    expect(
      await screen.findByText(/display name must be between 2 and 50 characters/i)
    ).toBeInTheDocument();
  });

  it('accepts a display name at the 2-character lower boundary', async () => {
    const user = userEvent.setup();
    const fields = renderForm();

    await user.type(fields.nameInput, 'Al');
    await user.type(fields.emailInput, 'al@example.com');

    await waitFor(() => expect(fields.submitButton).toBeEnabled());
    expect(screen.queryByText(/display name must be/i)).not.toBeInTheDocument();
  });

  it('accepts a display name at the 50-character upper boundary', async () => {
    const user = userEvent.setup();
    const fields = renderForm();
    const name50 = 'A'.repeat(50);

    fireEvent.change(fields.nameInput, { target: { value: name50 } });
    await user.type(fields.emailInput, 'long@example.com');

    await waitFor(() => expect(fields.submitButton).toBeEnabled());
    expect(screen.queryByText(/display name must be/i)).not.toBeInTheDocument();
  });

  it('rejects a display name over the 50-character upper boundary', async () => {
    const fields = renderForm();
    const name51 = 'A'.repeat(51);

    fireEvent.change(fields.nameInput, { target: { value: name51 } });
    fireEvent.blur(fields.nameInput);

    expect(await screen.findByText(/display name must be between 2 and 50 characters/i)).toBeInTheDocument();
    expect(fields.submitButton).toBeDisabled();
  });

  it('rejects an empty display name as required', async () => {
    const user = userEvent.setup();
    const fields = renderForm();

    await user.type(fields.nameInput, 'x');
    await user.clear(fields.nameInput);
    await user.tab();

    expect(await screen.findByText(/display name must be between 2 and 50 characters/i)).toBeInTheDocument();
    expect(fields.submitButton).toBeDisabled();
  });

  // --- Email validation -------------------------------------------------------

  it('rejects an empty email as required', async () => {
    const user = userEvent.setup();
    const fields = renderForm();

    await user.type(fields.emailInput, 'x');
    await user.clear(fields.emailInput);
    await user.tab();

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it('rejects malformed email syntax', async () => {
    const user = userEvent.setup();
    const { emailInput } = renderForm();

    await user.type(emailInput, 'not-an-email');
    await user.tab();

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  it('rejects an email with a missing top-level domain', async () => {
    const user = userEvent.setup();
    const { emailInput } = renderForm();

    await user.type(emailInput, 'user@localhost');
    await user.tab();

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  it('rejects an email with an empty local part', async () => {
    const user = userEvent.setup();
    const { emailInput } = renderForm();

    await user.type(emailInput, '@example.com');
    await user.tab();

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  it('accepts a well-formed email', async () => {
    const user = userEvent.setup();
    const fields = renderForm();

    await fillValid(user, fields);

    await waitFor(() => expect(fields.submitButton).toBeEnabled());
    expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument();
  });

  // --- Bio validation -----------------------------------------------------

  it('allows bio to be left empty (optional field)', async () => {
    const user = userEvent.setup();
    const fields = renderForm();

    await fillValid(user, fields);

    await waitFor(() => expect(fields.submitButton).toBeEnabled());
    expect(screen.queryByText(/bio must be/i)).not.toBeInTheDocument();
  });

  it('accepts a bio at exactly the 280-character limit', async () => {
    const user = userEvent.setup();
    const fields = renderForm();
    const bio280 = 'x'.repeat(280);

    await fillValid(user, fields);
    fireEvent.change(fields.bioInput, { target: { value: bio280 } });
    fireEvent.blur(fields.bioInput);

    await waitFor(() => expect(fields.submitButton).toBeEnabled());
    expect(screen.queryByText(/bio must be 280 characters or fewer/i)).not.toBeInTheDocument();
  });

  it('rejects a bio over the 280-character limit', async () => {
    const user = userEvent.setup();
    const fields = renderForm();
    const bio281 = 'x'.repeat(281);

    await fillValid(user, fields);
    fireEvent.change(fields.bioInput, { target: { value: bio281 } });
    fireEvent.blur(fields.bioInput);

    expect(await screen.findByText(/bio must be 280 characters or fewer/i)).toBeInTheDocument();
    expect(fields.submitButton).toBeDisabled();
  });

  // --- Submission -----------------------------------------------------------

  it('calls onSubmit with the validated (trimmed) values when the form is valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const fields = renderForm(onSubmit);

    await user.type(fields.nameInput, '  Jane Doe  ');
    await user.type(fields.emailInput, 'jane@example.com');
    await user.type(fields.bioInput, 'Hello there');

    await waitFor(() => expect(fields.submitButton).toBeEnabled());
    await user.click(fields.submitButton);

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: 'Jane Doe',
          email: 'jane@example.com',
          bio: 'Hello there',
        })
      )
    );
  });

  it('does not call onSubmit when the form is invalid', async () => {
    const onSubmit = vi.fn();
    const fields = renderForm(onSubmit);

    // Button is disabled, so a click should not trigger submission,
    // but we also assert onSubmit is never invoked as a safety net.
    fireEvent.click(fields.submitButton);

    expect(onSubmit).not.toHaveBeenCalled();
  });
});