import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { checkA11y } from '../../test/a11y';
import { Button } from './Button';

const variants = ['solid', 'outline', 'ghost', 'signal'] as const;

describe('Button — accessibility', () => {
  it.each(variants)('%s variant has no axe violations', async (variant) => {
    const { container } = render(<Button variant={variant}>Save changes</Button>);
    expect(await checkA11y(container)).toHaveNoViolations();
  });

  it('exposes an accessible name when used icon-only via aria-label', async () => {
    const { container, getByRole } = render(<Button aria-label="Close dialog">×</Button>);
    expect(getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
    expect(await checkA11y(container)).toHaveNoViolations();
  });

  it('asChild renders a semantic link without nesting interactive roles', async () => {
    const { container, getByRole } = render(
      <Button asChild>
        <a href="/work/">View work</a>
      </Button>,
    );
    expect(getByRole('link', { name: 'View work' })).toBeInTheDocument();
    expect(await checkA11y(container)).toHaveNoViolations();
  });
});
