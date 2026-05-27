import '@testing-library/jest-dom/vitest';
import { expect } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';

// adds toHaveNoViolations() and the jest-dom matchers to expect()
expect.extend(axeMatchers);
