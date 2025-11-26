---
inclusion: always
---

# Spooky Styles Project Standards

## Code Style

### TypeScript
- Use TypeScript strict mode
- Prefer `interface` over `type` for object shapes
- Use `const` for immutable values
- Prefer functional components over class components
- Use async/await over raw promises

### Naming Conventions
- **Components**: PascalCase (`ProductCard`, `ARTryOn`)
- **Files**: kebab-case (`product-card.tsx`, `ar-tryon.tsx`)
- **Functions**: camelCase (`getUserData`, `calculateTotal`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **Interfaces**: PascalCase with descriptive names (`Product`, `CartItem`)

### File Organization
```
src/
├── components/     # Reusable UI components
├── pages/          # Route components
├── services/       # API calls and business logic
├── hooks/          # Custom React hooks
├── store/          # Zustand state management
├── types/          # TypeScript type definitions
├── utils/          # Helper functions
└── engine/         # AR/3D rendering logic
```

## React Patterns

### Component Structure
```typescript
import React from 'react';

interface Props {
  // Props with JSDoc comments
}

export const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // 1. Hooks (useState, useEffect, custom hooks)
  // 2. Event handlers
  // 3. Helper functions
  // 4. Render logic
  
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
};

export default MyComponent;
```

### Hooks Rules
- Always use hooks at the top level
- Custom hooks start with `use` prefix
- Extract complex logic into custom hooks
- Use `useCallback` for event handlers passed to children
- Use `useMemo` for expensive calculations

## Styling

### Tailwind CSS
- Use Tailwind utility classes
- Follow Halloween theme colors:
  - Primary: `halloween-purple` (#8b5cf6)
  - Secondary: `halloween-orange` (#f97316)
  - Background: `halloween-black` (#0a0a0a)
  - Dark Purple: `halloween-darkPurple` (#1a0033)
  - Green: `halloween-green` (#10b981)
- Ensure responsive design (mobile-first)
- Use `className` prop, not inline styles

### Component Styling
```typescript
// Good
<div className="bg-halloween-purple text-white p-4 rounded-lg">

// Avoid
<div style={{ backgroundColor: '#8b5cf6', color: 'white' }}>
```

## API Integration

### Service Pattern
```typescript
import api from './api';

export const productService = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  create: (data: CreateProductDto) => api.post<Product>('/products', data),
  update: (id: string, data: UpdateProductDto) => 
    api.put<Product>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};
```

### Error Handling
- Always use try-catch in async functions
- Provide user-friendly error messages
- Log errors for debugging
- Show loading states
- Handle network failures gracefully

## State Management

### Zustand Stores
- One store per domain (cart, user, products)
- Keep stores small and focused
- Use selectors for derived state
- Persist important state (cart, auth)

### Store Pattern
```typescript
import { create } from 'zustand';

interface MyStore {
  data: Data[];
  loading: boolean;
  error: string | null;
  
  fetchData: () => Promise<void>;
  updateData: (id: string, data: Data) => void;
}

export const useMyStore = create<MyStore>((set) => ({
  data: [],
  loading: false,
  error: null,
  
  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await myService.getAll();
      set({ data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  updateData: (id, data) => {
    set((state) => ({
      data: state.data.map(item => 
        item.id === id ? { ...item, ...data } : item
      ),
    }));
  },
}));
```

## Testing

### Test Structure
```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Arrange
    // Act
    // Assert
  });
  
  it('should handle user interaction', () => {
    // Test
  });
});
```

### Best Practices
- Test behavior, not implementation
- Use `data-testid` for selectors
- Mock external dependencies
- Test edge cases
- Keep tests simple and focused
- Aim for 80% coverage

## Git Workflow

### Branch Naming
- Feature: `feature/add-wishlist`
- Bug fix: `fix/cart-total-calculation`
- Hotfix: `hotfix/payment-error`
- Refactor: `refactor/api-services`

### Commit Messages
```
type(scope): subject

body (optional)

footer (optional)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(cart): add wishlist functionality`
- `fix(checkout): correct tax calculation`
- `docs(readme): update installation instructions`

### Pull Requests
- Descriptive title
- Link to issue/ticket
- Screenshots for UI changes
- Test coverage report
- Reviewer checklist

## Performance

### Optimization
- Lazy load routes and heavy components
- Use React.memo for expensive components
- Implement virtual scrolling for long lists
- Optimize images (WebP, lazy loading)
- Code splitting with dynamic imports
- Minimize bundle size

### Monitoring
- Track Core Web Vitals
- Monitor API response times
- Log errors to monitoring service
- Track user interactions
- Measure conversion rates

## Security

### Best Practices
- Never commit secrets or API keys
- Use environment variables
- Sanitize user input
- Implement rate limiting
- Use HTTPS in production
- Validate all API inputs
- Implement CSRF protection
- Use secure session management

## Accessibility

### Requirements
- Use semantic HTML
- Add ARIA labels where needed
- Support keyboard navigation
- Ensure color contrast (WCAG AA)
- Provide alt text for images
- Test with screen readers
- Support focus management

## Documentation

### Code Comments
- Use JSDoc for functions and components
- Explain "why", not "what"
- Document complex algorithms
- Keep comments up to date
- Remove commented-out code

### README Files
- Every major feature should have a README
- Include usage examples
- Document API endpoints
- Provide setup instructions
- List dependencies

## Environment

### Development
- Use `.env.example` as template
- Never commit `.env` files
- Document all environment variables
- Use different configs for dev/staging/prod

### Required Variables
```
# Backend
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
STRIPE_SECRET_KEY=...

# Frontend
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=...
```

## Deployment

### Checklist
- [ ] All tests pass
- [ ] Environment variables updated
- [ ] Database migrations run
- [ ] Monitoring configured
- [ ] Error tracking enabled
- [ ] Performance tested
- [ ] Security audit completed
- [ ] Documentation updated

## Questions?

When in doubt:
1. Check existing code for patterns
2. Review this document
3. Ask the team
4. Consult official docs
5. Use Kiro for guidance

Remember: **Consistency > Perfection**
