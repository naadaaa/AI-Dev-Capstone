# WORKFLOW.md

## The drill
Same feature — a settings form with validation — built twice: once from a single
vague prompt ("Build a settings form with validation"), once from a precise spec
with file references, constraints, edge cases, and a verification step (write
tests, run them, fix failures).

## What round one actually built
Given zero context, the AI didn't ask what "settings" meant — it guessed. It
invented an "AI preferences" form (model selector, temperature, max tokens,
notification toggles) instead of anything resembling a generic settings form.
That's the single most important finding of this drill: an underspecified prompt
doesn't just produce lower-quality code, it lets the model silently choose the
requirements for you. I didn't notice this until I diffed the branches — in the
moment, the output looked plausible and I'd have accepted it without realizing
it wasn't the feature I actually needed.

Round one also split into three files (`SettingsForm/SettingsForm.tsx`,
`FormField.tsx`, `SettingsForm.css`) unprompted, versus round two's single file
at the exact path I specified.

## The accessibility bug I caught
Round one's `FormField.tsx` places `aria-describedby` on a wrapping `<div>`
around the input, not on the input itself. That attribute only works for screen
readers when it's on the actual form control — so despite having a correctly
`role="alert"`-tagged error message and a plausible-looking wiring pattern, the
error is never actually announced to a screen reader user. This is the kind of
bug that survives a visual review completely — the code looks careful, uses the
right attribute names, and would pass a skim. It only surfaces if you know
ARIA semantics well enough to check *which* element the attribute sits on.

Round two's version places `aria-describedby` directly on the `<input>`,
because I explicitly specified "labels linked to inputs, error messages linked
via aria-describedby" in the prompt.

## A bug I caught during round two's own verification step
Round two generated 22 tests; two failed on the first run. Both used
`screen.findByRole('alert')`, which throws if more than one element shares that
role — and two fields can show validation errors simultaneously (e.g. an
untouched name field plus an empty email field both render `role="alert"` at
once). The component was correct; the test assertion was too broad. I fixed it
by scoping the query with `findByText` on the specific error message instead.
This is exactly the kind of catch the "write tests, run them, fix failures"
step is meant to produce — without running them, this would have shipped as an
untested claim of correctness.

## Validation behavior difference
Round one used `mode: 'onBlur'` (validates only when a field loses focus).
Round two used `mode: 'onChange'` (revalidates as you type), which is what
actually satisfies "submit button disabled while form is invalid" — onBlur mode
would leave the button in a stale disabled/enabled state while a user is mid-edit
in the currently focused field. I didn't explicitly ask for onChange mode; the
model inferred it correctly from the disabled-submit requirement, which is one
place a good spec's downstream consequences paid off unprompted.

## Review effort, honestly
Round one *felt* faster because there was nothing to check — I clicked
"accept" and moved on. But there was nothing to check because nothing was
verified; the hallucinated scope and the ARIA bug were both invisible until I
actively went looking. Round two felt slower in the moment (writing the real
spec took real thought, and I had to review 22 tests plus fix one bug), but the
end result is something I can actually trust runs correctly, because it was
checked rather than assumed. If I count the time I'd have spent later
discovering round one built the wrong form and had a silent accessibility bug,
round two was very likely faster end-to-end, not slower.

## What I'd change next time
Even round two's prompt had a gap — I didn't specify onBlur vs onChange
validation mode explicitly and got lucky that the model inferred the right one
from context. I'd make validation timing an explicit constraint next time
rather than relying on inference.
