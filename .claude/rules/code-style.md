# Code Style Rules

## Linting and Formatting

**Use Biome, NOT ESLint or Prettier.**

```bash
# ✅ CORRECT
biome check --write
biome lint --write
biome format --write

# ❌ WRONG
eslint --fix
prettier --write
```

## Strict Rules

### 1. No Direct process.env Access

```typescript
// ❌ WRONG
const apiKey = process.env.LLM_API_KEY;

// ✅ CORRECT
import { env } from '@/env/server';
const apiKey = env.LLM_API_KEY;
```

Typed env files:
- Web: `apps/web/src/env/client.ts` and `apps/web/src/env/server.ts`
- Scripts: `apps/scripts/src/env.ts`

### 2. No console.log

```typescript
// ❌ WRONG
console.log('Debug info');

// ✅ CORRECT
// Use proper logging or remove debug statements
```

### 3. No Explicit Any

```typescript
// ❌ WRONG
function process(data: any) { }

// ✅ CORRECT
function process(data: unknown) { }
function process<T>(data: T) { }
```

### 4. Use Template Literals

```typescript
// ❌ WRONG
const message = 'Hello, ' + name + '!';

// ✅ CORRECT
const message = `Hello, ${name}!`;
```

### 5. Use Import Type

```typescript
// ❌ WRONG
import { User } from '@monorepo/database/client';

// ✅ CORRECT - for type-only imports
import type { User } from '@monorepo/database/client';
```

### 6. No Nested Ternary

```typescript
// ❌ WRONG
const value = a ? b : c ? d : e;

// ✅ CORRECT
const value = a ? b : (c ? d : e);
// Or better: use if-else
```

### 7. No Comments in Code

**Do not write comments in code.** Code should be self-documenting through clear naming and structure.

**Exception:** Comments are only allowed when code violates conventions or has known issues that cannot be immediately fixed.

```typescript
// ❌ WRONG - Unnecessary comments
// Get user by ID
function getUserById(id: string) {
  // Query the database
  return prisma.user.findUnique({
    where: { id }
  });
}

// Loop through events
events.forEach((event) => {
  // Process event
  processEvent(event);
});

// ✅ CORRECT - Self-documenting code
function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

events.forEach(processEvent);

// ✅ ACCEPTABLE - Explaining violation or known issue
function legacyCalculation(value: number) {
  // TODO: This uses deprecated API. Migrate to new calculation method
  // See ticket: PROJ-123
  return oldApi.calculate(value);
}

// ✅ ACCEPTABLE - Temporary workaround
async function fetchUserData(userId: string) {
  // HACK: API returns inconsistent types, force cast here
  // Remove when API v2 is deployed (ETA: 2026-04)
  const data = await api.getUser(userId) as unknown as UserData;
  return data;
}

// ✅ ACCEPTABLE - Complex business rule requiring explanation
function calculateDiscount(user: User, order: Order) {
  // Business rule: Legacy users (created before 2020) get 15% discount
  // per agreement with Sales team. Do not change without approval.
  if (user.createdAt < new Date('2020-01-01')) {
    return 0.15;
  }
  return 0.10;
}
```

**Why avoid comments:**
- Comments become outdated as code changes
- Good naming eliminates the need for most comments
- Comments indicate code that should be refactored
- Self-documenting code is more maintainable

**Instead of comments:**
- Use descriptive function and variable names
- Extract complex logic into well-named functions
- Use type definitions to document structure
- Write clear commit messages

```typescript
// ❌ WRONG - Comment explaining complex logic
function processOrder(order: Order) {
  // Calculate total with discount
  const total = order.items.reduce((sum, item) => sum + item.price, 0);
  const discounted = total * 0.9; // 10% discount
  return discounted;
}

// ✅ CORRECT - Extract into named functions
function calculateOrderTotal(items: OrderItem[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

function applyDiscount(total: number, discountRate: number) {
  return total * (1 - discountRate);
}

function processOrder(order: Order) {
  const total = calculateOrderTotal(order.items);
  return applyDiscount(total, 0.1);
}
```

### 8. File Size Limits

**Keep files small and focused. Large files are a sign that refactoring is needed.**

File size limits:
- **Non-TSX files**: Maximum **500 lines**
- **TSX files (components)**: Maximum **1000 lines**

```typescript
// ❌ WRONG - Single file with 800 lines
// userService.ts (800 lines)
export function createUser() { /* ... */ }
export function updateUser() { /* ... */ }
export function deleteUser() { /* ... */ }
export function getUserById() { /* ... */ }
export function listUsers() { /* ... */ }
export function searchUsers() { /* ... */ }
export function validateUser() { /* ... */ }
export function exportUsers() { /* ... */ }
// ... 20 more functions

// ✅ CORRECT - Split into focused modules
// userService/create.ts (50 lines)
export function createUser() { /* ... */ }

// userService/update.ts (50 lines)
export function updateUser() { /* ... */ }

// userService/delete.ts (30 lines)
export function deleteUser() { /* ... */ }

// userService/query.ts (100 lines)
export function getUserById() { /* ... */ }
export function listUsers() { /* ... */ }

// userService/search.ts (80 lines)
export function searchUsers() { /* ... */ }

// userService/validation.ts (60 lines)
export function validateUser() { /* ... */ }

// userService/export.ts (120 lines)
export function exportUsers() { /* ... */ }

// userService/index.ts (10 lines)
export * from './create';
export * from './update';
export * from './delete';
export * from './query';
export * from './search';
export * from './validation';
export * from './export';
```

**For TSX files:**

```tsx
// ❌ WRONG - Single component file with 1200 lines
// UserDashboard.tsx (1200 lines)
export function UserDashboard() {
  // 300 lines of state and logic
  // 900 lines of JSX with nested components
  return (
    <div>
      {/* Inline Header component (100 lines) */}
      {/* Inline Sidebar component (200 lines) */}
      {/* Inline UserTable component (300 lines) */}
      {/* Inline UserForm component (300 lines) */}
    </div>
  );
}

// ✅ CORRECT - Split into focused components
// UserDashboard/UserDashboard.tsx (200 lines)
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { UserTable } from './UserTable';
import { UserForm } from './UserForm';

export function UserDashboard() {
  // 50 lines of state and logic
  // 150 lines of JSX
  return (
    <div>
      <DashboardHeader />
      <DashboardSidebar />
      <UserTable />
      <UserForm />
    </div>
  );
}

// UserDashboard/DashboardHeader.tsx (100 lines)
// UserDashboard/DashboardSidebar.tsx (200 lines)
// UserDashboard/UserTable.tsx (300 lines)
// UserDashboard/UserForm.tsx (300 lines)
```

**When a file exceeds the limit:**
1. Identify logical boundaries (features, concerns, components)
2. Extract into separate files
3. Use index.ts for re-exports
4. Maintain single responsibility principle

**Benefits of small files:**
- Easier to understand and review
- Faster to navigate and edit
- Better git history (fewer merge conflicts)
- Encourages modular design
- Easier to test in isolation

### 9. Prefer Functional Array Methods Over for Loops

**Avoid `for` loops.** Use `forEach`, `map`, `filter`, `reduce` and other functional array methods instead.

**Exception:** `for` loops are acceptable when you need to:
- Resolve promises sequentially (e.g., `await` inside loop)
- Break out early for performance
- Use complex iteration logic that's clearer with `for`

```typescript
// ❌ WRONG - Using for loop for simple iteration
const userNames: string[] = [];
for (let i = 0; i < users.length; i++) {
  userNames.push(users[i].name);
}

// ✅ CORRECT - Use map
const userNames = users.map(user => user.name);

// ❌ WRONG - Using for loop to filter
const activeUsers: User[] = [];
for (let i = 0; i < users.length; i++) {
  if (users[i].isActive) {
    activeUsers.push(users[i]);
  }
}

// ✅ CORRECT - Use filter
const activeUsers = users.filter(user => user.isActive);

// ❌ WRONG - Using for loop for side effects
for (let i = 0; i < users.length; i++) {
  console.log(users[i].name);
}

// ✅ CORRECT - Use forEach
users.forEach(user => {
  console.log(user.name);
});

// ❌ WRONG - Using for loop to accumulate
let total = 0;
for (let i = 0; i < orders.length; i++) {
  total += orders[i].amount;
}

// ✅ CORRECT - Use reduce
const total = orders.reduce((sum, order) => sum + order.amount, 0);

// ✅ ACCEPTABLE - Sequential promise resolution
for (const user of users) {
  await sendEmail(user.email);  // Must run sequentially
}

// ✅ ACCEPTABLE - Early break for performance
for (const item of largeArray) {
  if (item.id === targetId) {
    return item;  // Stop as soon as found
  }
}
// Note: Could also use .find() in this case
const item = largeArray.find(item => item.id === targetId);

// ✅ ACCEPTABLE - Complex iteration with state
let depth = 0;
for (let i = 0; i < tokens.length; i++) {
  if (tokens[i] === '{') depth++;
  if (tokens[i] === '}') depth--;
  if (depth < 0) return i;  // Complex logic
}
```

**Parallel vs Sequential Promise Execution:**

```typescript
// ❌ WRONG - Sequential when parallel is possible
for (const user of users) {
  await fetchUserData(user.id);  // Slow: runs one by one
}

// ✅ CORRECT - Parallel execution
await Promise.all(users.map(user => fetchUserData(user.id)));

// ✅ CORRECT - Sequential when needed (rate limiting, dependencies)
for (const user of users) {
  await sendEmail(user.email);  // Must not overwhelm email service
  await delay(100);  // Rate limiting
}
```

**Why prefer functional methods:**
- More declarative and readable
- Clearly expresses intent (map = transform, filter = select, etc.)
- Less error-prone (no off-by-one errors)
- Encourages immutability
- Easier to chain operations
- Works well with TypeScript type inference

### 10. Maintain Array Immutability

**Do not mutate arrays with `.push()`, `.pop()`, `.shift()`, `.unshift()`, `.splice()`, etc.** Create new arrays instead using spread syntax or array methods.

This ensures immutability and prevents unexpected side effects.

```typescript
// ❌ WRONG - Mutating arrays
const items = [1, 2, 3];
items.push(4);           // Mutates original array
items.pop();             // Mutates original array
items.unshift(0);        // Mutates original array
items.splice(1, 1);      // Mutates original array

// ✅ CORRECT - Creating new arrays
const items = [1, 2, 3];
const withAdded = [...items, 4];              // Add to end
const withRemoved = items.slice(0, -1);       // Remove from end
const withPrepended = [0, ...items];          // Add to beginning
const withoutSecond = items.filter((_, i) => i !== 1);  // Remove by index

// ❌ WRONG - Mutating in function
function addUser(users: User[], newUser: User) {
  users.push(newUser);  // Mutates input array
  return users;
}

// ✅ CORRECT - Returning new array
function addUser(users: User[], newUser: User) {
  return [...users, newUser];
}

// ❌ WRONG - Mutating in React state
const [items, setItems] = useState([1, 2, 3]);
items.push(4);           // Mutates state directly
setItems(items);         // React won't detect change

// ✅ CORRECT - Creating new state
const [items, setItems] = useState([1, 2, 3]);
setItems([...items, 4]);
// Or more concisely:
setItems(prev => [...prev, 4]);

// ❌ WRONG - Sorting in place
const sorted = items.sort();  // Mutates original array

// ✅ CORRECT - Create sorted copy
const sorted = [...items].sort();
// Or use toSorted() if available (ES2023)
const sorted = items.toSorted();

// ❌ WRONG - Reversing in place
const reversed = items.reverse();  // Mutates original array

// ✅ CORRECT - Create reversed copy
const reversed = [...items].reverse();
// Or use toReversed() if available (ES2023)
const reversed = items.toReversed();
```

**Benefits of immutability:**
- Prevents unexpected mutations in other parts of code
- Safer in React (proper state change detection)
- Easier to debug (no hidden mutations)
- Enables time-travel debugging
- Thread-safe (no concurrent modification issues)
- Makes code more predictable

**Exception:** Mutating local arrays that don't escape the function scope is acceptable for performance-critical code, but prefer immutable patterns by default.

```typescript
// ✅ ACCEPTABLE - Local mutation for performance
function processBatch(data: Data[]) {
  const localResults: Result[] = [];  // Local, doesn't escape

  for (const item of data) {
    localResults.push(processItem(item));  // OK: local only
  }

  return localResults;  // Return is fine
}

// ✅ BETTER - Still prefer immutable when possible
function processBatch(data: Data[]) {
  return data.map(processItem);  // Cleaner and immutable
}
```

### 11. Use Object Parameters for 3+ Arguments

**When a function has 3 or more arguments, use an object parameter instead of positional arguments.**

This improves readability, maintainability, and makes the function calls self-documenting.

```typescript
// ❌ WRONG - 3+ positional arguments
function createUser(
  name: string,
  email: string,
  role: string,
  isActive: boolean,
  departmentId: string
) {
  // ...
}

// Hard to read, easy to mix up argument order
createUser('John Doe', 'john@example.com', 'MEMBER', true, 'dept-123');

// ✅ CORRECT - Object parameter
type CreateUserParams = {
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  departmentId: string;
};

function createUser(params: CreateUserParams) {
  // ...
}

// Self-documenting, order doesn't matter
createUser({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'MEMBER',
  isActive: true,
  departmentId: 'dept-123'
});

// ❌ WRONG - Unclear what each boolean means
function updateSettings(true, false, true, 10);

// ✅ CORRECT - Clear intent
updateSettings({
  enableNotifications: true,
  allowComments: false,
  autoSave: true,
  maxRetries: 10
});

// ✅ CORRECT - 2 or fewer arguments can use positional
function getUserById(id: string) { }
function updateUser(id: string, data: UserData) { }

// ❌ WRONG - Even 3 arguments should use object
function calculateDiscount(price: number, discountRate: number, taxRate: number) {
  return price * (1 - discountRate) * (1 + taxRate);
}

// ✅ CORRECT - Object parameter
type CalculateDiscountParams = {
  price: number;
  discountRate: number;
  taxRate: number;
};

function calculateDiscount({ price, discountRate, taxRate }: CalculateDiscountParams) {
  return price * (1 - discountRate) * (1 + taxRate);
}

// Usage is much clearer
const total = calculateDiscount({
  price: 100,
  discountRate: 0.1,
  taxRate: 0.08
});
```

**Benefits:** Self-documenting calls, optional params are natural, easy to extend without breaking callers, destructuring with defaults, argument order doesn't matter.

**Type definition patterns:**

```typescript
// ✅ CORRECT - Define type separately for reusability
type CreateEventParams = {
  tenantId: string;
  userId: string;
  name: string;
  startedAt: Date;
  endedAt: Date;
};

function createEvent(params: CreateEventParams) { }

// ✅ CORRECT - Inline type for simple cases
function deleteUser({ userId, tenantId }: { userId: string; tenantId: string }) { }

// ✅ CORRECT - Use Pick/Omit for variations
type UpdateEventParams = Omit<CreateEventParams, 'tenantId' | 'userId'>;

function updateEvent(eventId: string, params: UpdateEventParams) { }
```

**Exception:** Well-known patterns with clear argument order can use positional parameters even with 3+ args, but this is rare.

```typescript
// ✅ ACCEPTABLE - Math operations with clear semantics
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// But often object is still better for clarity:
function clamp({ value, min, max }: { value: number; min: number; max: number }) {
  return Math.max(min, Math.min(max, value));
}
```

### 12. Avoid Unnecessary Intermediate Variables

Minimize the use of explanatory variables. Return or use values directly when possible.

```typescript
// ❌ WRONG - Unnecessary intermediate variable
function getUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user;
}

// ✅ CORRECT - Direct return
function getUser(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

// ❌ WRONG - Unnecessary variable for simple transformation
const userName = user.name;
return <div>{userName}</div>;

// ✅ CORRECT - Use directly
return <div>{user.name}</div>;

// ⚠️ ACCEPTABLE - Variable adds clarity for complex logic
const isEligibleForDiscount =
  user.role === 'MEMBER' &&
  user.createdAt < lastMonth &&
  user.purchases > 10;

if (isEligibleForDiscount) {
  // ...
}
```

## Naming Conventions

**Naming is the easiest thing to pay attention to and has the most impact on developer experience.** It cannot be fully checked by linters, so even beginners must be conscious of it.

### General Principles

1. **Follow community conventions** for the language/framework being used
2. **Avoid Hungarian notation** (except in some dynamically-typed languages like Python where it improves readability)
3. **Never use Romaji** (Japanese romanization) - Exception: when modifying existing programs with Romaji in DB column names
4. **No single-letter variables** (except in very limited contexts like loop indices)

```typescript
// ❌ WRONG - Single letter variables hurt readability
items.map((v, k) => ({ ...v, index: k }));

// ✅ CORRECT - Descriptive names
items.map((item, index) => ({ ...item, index }));
```

### Boolean Variables

Use `is_xxed`, `is_xx_adj`, `has_noun`, or `noun_xxed` patterns. **Avoid `xx_flag`**.

```typescript
// ❌ WRONG
const passwordFlag = true;
const enabledFlag = false;

// ✅ CORRECT
const isPasswordValid = true;
const isEnabled = false;
const hasPermission = true;
const chatEnabled = false;
```

### Date/Time Variables

Use `xxed_at` pattern for timestamps.

```typescript
// ✅ CORRECT
const createdAt = new Date();
const updatedAt = new Date();
const deletedAt = null;

// Note: In Python, xx_date or xx_datetime is acceptable for type clarity
```

### Class/Object Properties

**Do not include the class/object name in property names.**

```typescript
// ❌ WRONG
class User {
  userName: string;  // Redundant "User"
  userEmail: string;
}

// ✅ CORRECT
class User {
  name: string;
  email: string;
}
```

### Acronyms in camelCase

Capitalize only the first letter: `Url`, `Api`, `Id` (not `URL`, `API`, `ID`).

```typescript
// ✅ CORRECT
const apiUrl = 'https://example.com';
const userId = '123';
const API_BASE_URL = 'https://api.example.com';  // OK in UPPER_SNAKE_CASE

// ❌ WRONG
const apiURL = 'https://example.com';  // Confusing
const uRL = 'https://example.com';     // Unclear
```

### Variables and Properties

**Use nouns, not bare verbs.** This represents that they are not executable.

```typescript
// ❌ WRONG - Bare verbs
const fetch = () => {};
const update = userData;

// ✅ CORRECT - Nouns
const fetchUser = () => {};
const updatedUser = userData;
```

### Functions and Methods

**Use Verb-Object (VO) pattern.** Function names should symbolize all processing content.

```typescript
// ✅ CORRECT - VO pattern
function getUserById(id: string) { }
function createTenant(data: TenantInput) { }
function validatePassword(password: string) { }
function sendNotificationToSlack(message: string) { }

// ❌ WRONG - Vague or incomplete
function process(data: unknown) { }  // What kind of processing?
function handle() { }                // Handle what?
function doIt() { }                  // Do what?

// Note: In languages like Swift with argument labels,
// the Object can be in the first argument label
```

### Case Conventions

```typescript
// ✅ CORRECT - Code
const userName = 'John';                    // camelCase for variables
const MAX_RETRIES = 3;                      // UPPER_SNAKE_CASE for constants
function getUserById(id: string) { }        // camelCase for functions
class UserService { }                       // PascalCase for classes
interface UserProps { }                     // PascalCase for interfaces
type UserId = string;                       // PascalCase for types
enum UserRole { ADMIN, MEMBER }            // PascalCase for enums, UPPER_CASE for values

// React components
export function UserProfile() { }           // PascalCase for components
export default function Page() { }          // PascalCase for page components
```

### File and Directory Naming

**Different naming conventions based on file/directory purpose:**

1. **Page-related files/directories**: `kebab-case`
2. **Component-related files/directories**: `PascalCase`
3. **Everything else**: `camelCase`

```
// ✅ CORRECT - Page routes (kebab-case)
app/
├── tenants/
│   └── [tenantId]/
│       ├── (authenticated)/
│       │   ├── dashboard/
│       │   │   └── page.tsx
│       │   ├── password-reset/          // kebab-case for route
│       │   │   └── confirm/
│       │   │       └── page.tsx
│       │   └── user-settings/           // kebab-case for route
│       │       └── page.tsx
│       └── auth/
│           ├── signin/                   // kebab-case for route
│           └── password-reset/           // kebab-case for route

// ✅ CORRECT - Components (PascalCase)
components/
├── common/
│   ├── Button/                           // PascalCase
│   │   ├── Button.tsx
│   │   └── Button.types.ts
│   ├── Modal/                            // PascalCase
│   │   ├── Modal.tsx
│   │   └── index.ts
│   └── UserProfile/                      // PascalCase
│       └── UserProfile.tsx

// ✅ CORRECT - Utilities and others (camelCase)
utils/
├── formatDate.ts                         // camelCase
├── validateEmail.ts                      // camelCase
└── libs/
    ├── googleapis.ts                     // camelCase
    └── salesforce.ts                     // camelCase

libs/
├── apiClient.ts                          // camelCase
├── email.ts                              // camelCase
└── firebase/
    └── nodeApp.ts                        // camelCase

// ❌ WRONG - Inconsistent naming
app/
├── UserSettings/                         // Wrong: should be user-settings/
│   └── page.tsx
└── password_reset/                       // Wrong: should be password-reset/

components/
├── user-profile/                         // Wrong: should be UserProfile/
│   └── user-profile.tsx
└── modal_component/                      // Wrong: should be Modal/

utils/
├── FormatDate.ts                         // Wrong: should be formatDate.ts
└── validate_email.ts                     // Wrong: should be validateEmail.ts
```

**Summary:**
- **Routes/Pages**: `password-reset/`, `user-settings/`, `signin/` (kebab-case)
- **Components**: `UserProfile/`, `Button/`, `Modal/` (PascalCase)
- **Utils/Libs/Functions**: `formatDate.ts`, `apiClient.ts`, `validateEmail.ts` (camelCase)
```

### Refactoring Indicator

**If a function name becomes too long or complex, it's a sign that refactoring is needed.** Break down the function into smaller, focused units.

```typescript
// ⚠️ REFACTORING NEEDED - Name is too complex
function getUserCalendarEventAndValidateAccessAndGenerateSummary() { }

// ✅ BETTER - Break into smaller functions
function getUserCalendarEvent(eventId: string) { }
function validateEventAccess(event: Event, user: User) { }
function generateEventSummary(event: Event) { }
```

## Type Safety

### Avoid Unsafe Type Assertions

Do not use `as` to assign unknown types to variables.

```typescript
// ❌ WRONG - Unsafe type assertion
const user = data as User;
const response = apiResult as ApiResponse;

// ✅ CORRECT - Use type predicates with guard functions
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    typeof data.id === 'string' &&
    typeof data.name === 'string'
  );
}

if (isUser(data)) {
  // data is now typed as User
  console.log(data.name);
}

// ✅ CORRECT - as unknown is acceptable for escape hatches
const value = someComplexType as unknown;

// ✅ CORRECT - Validate with Zod
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const user = UserSchema.parse(data); // Runtime validation
```

### Type Predicates for Guards

Always use type predicates (`is` keyword) in guard functions:

```typescript
// ❌ WRONG - No type predicate
function isString(value: unknown): boolean {
  return typeof value === 'string';
}

// ✅ CORRECT - With type predicate
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// ✅ CORRECT - Complex type guard
function isUserCalendarEvent(value: unknown): value is UserCalendarEvent {
  return (
    typeof value === 'object' &&
    value !== null &&
    'tenantId' in value &&
    'userId' in value &&
    'status' in value
  );
}

// Usage
if (isUserCalendarEvent(data)) {
  // TypeScript knows data is UserCalendarEvent
  await processEvent(data);
}
```

### No Non-Null Assertion

**Do not use the non-null assertion operator (`!`).** It bypasses TypeScript's null safety and can cause runtime errors.

```typescript
// ❌ WRONG - Non-null assertion
const user = users.find(u => u.id === id)!;
const name = user!.name;
const element = document.getElementById('root')!;

// ✅ CORRECT - Handle null/undefined explicitly
const user = users.find(u => u.id === id);
if (!user) {
  throw new Error(`User not found: ${id}`);
}
const name = user.name;

// ✅ CORRECT - Use optional chaining
const name = user?.name;

// ✅ CORRECT - Use nullish coalescing
const name = user?.name ?? 'Unknown';

// ✅ CORRECT - Early return
function processUser(user: User | undefined) {
  if (!user) return;
  sendEmail(user.email);
}

// ✅ CORRECT - Type narrowing with guard
function getElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element not found: ${id}`);
  }
  return element;
}
```

**Why avoid non-null assertion:**
- Silently removes null/undefined from the type without runtime validation
- Runtime errors (`Cannot read properties of undefined`) become harder to trace
- Explicit null handling makes code more robust and self-documenting
- Optional chaining (`?.`) and nullish coalescing (`??`) are safer alternatives

## React/Next.js Specific

### Component Composition

**Pages should be composed mostly of components, not raw HTML tags.**

```tsx
// ❌ WRONG - Too many raw HTML tags
export default function Page() {
  return (
    <div>
      <div style={{ padding: '20px' }}>
        <h1>Title</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button>Action</button>
        </div>
      </div>
    </div>
  );
}

// ✅ CORRECT - Composed of components
export default function Page() {
  return (
    <PageLayout>
      <Typography variant="h1">Title</Typography>
      <FlexBox gap={10}>
        <Button>Action</Button>
      </FlexBox>
    </PageLayout>
  );
}
```

### Layout-Level Logic

**pageを超えて共通化できる処理やバリデーションは、layout.tsxに配置して何度も書かないようにする。**

Common processing and validation that can be shared across pages should be placed in `layout.tsx` to avoid repetition.

```tsx
// ❌ WRONG - Repeating auth check in every page
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return <Dashboard />;
}

// app/settings/page.tsx
export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return <Settings />;
}

// ✅ CORRECT - Auth check in layout
// app/(authenticated)/layout.tsx
export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  return <>{children}</>;
}

// app/(authenticated)/dashboard/page.tsx
export default async function DashboardPage() {
  return <Dashboard />;
}

// app/(authenticated)/settings/page.tsx
export default async function SettingsPage() {
  return <Settings />;
}
```

### Layout and Spacing

**Use layout component padding, flex-box gap, and grid for spacing. Avoid using margin actively.**

Reasons to avoid margin:
- Flex-box `gap` and `padding` are usually sufficient
- Margin can unintentionally affect other components

```tsx
// ❌ WRONG - Using margin
<div>
  <Component style={{ marginBottom: '20px' }} />
  <Component style={{ marginTop: '10px' }} />
</div>

// ✅ CORRECT - Using flex-box gap
<FlexBox direction="vertical" gap={20}>
  <Component />
  <Component />
</FlexBox>

// ✅ CORRECT - Using padding in layout component
<PageLayout padding={32}>
  <Component />
  <Component />
</PageLayout>
```

### Directory Structure

**Use plural form for grouping directories.**

```
components/
├── buttons/           ✅ Plural
│   ├── PrimaryButton.tsx
│   └── SecondaryButton.tsx
├── modals/            ✅ Plural
│   ├── ConfirmModal.tsx
│   └── AlertModal.tsx
└── forms/             ✅ Plural
    └── LoginForm.tsx
```

### Component Naming

**Use PascalCase and noun-like names (not Verb-Object pattern like regular functions).**

This distinguishes components from regular functions.

```tsx
// ❌ WRONG - VO pattern (like regular functions)
function RenderUserProfile() { }
function ShowEventList() { }
function DisplayHeader() { }

// ✅ CORRECT - Noun-like names
function UserProfile() { }
function EventList() { }
function Header() { }

// ✅ CORRECT - Descriptive nouns
function MeetingCard() { }
function SummaryDisplay() { }
function InstantMeetingModal() { }
```

### Avoid Unnecessary Default Values

**Do not write unnecessary initial values.**

```tsx
// ❌ WRONG - Unnecessary defaults
function UserCard({
  name = '',
  email = '',
  isActive = false
}: UserCardProps) {
  return <div>{name}</div>;
}

// ✅ CORRECT - Only set defaults when truly needed
function UserCard({ name, email, isActive }: UserCardProps) {
  return <div>{name}</div>;
}

// ✅ CORRECT - Default only when required
function Button({
  variant = 'primary',  // Has a meaningful default
  children
}: ButtonProps) {
  return <button className={variant}>{children}</button>;
}
```

### Page Component Naming

**Page components should be named `Page` with props type `PageProps`.**

```tsx
// ✅ CORRECT - Page component naming convention
type PageProps = {
  params: { tenantId: string };
  searchParams: { page?: string };
};

export default async function Page({ params, searchParams }: PageProps) {
  const tenant = await getTenant(params.tenantId);
  return <div>{tenant.name}</div>;
}
```

### Server Components by Default

```typescript
// ✅ CORRECT - Default Server Component
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Only add 'use client' when needed
'use client';
export function InteractiveComponent() {
  const [state, setState] = useState(0);
  return <button onClick={() => setState(s => s + 1)}>{state}</button>;
}
```

### Server Actions

```typescript
// ✅ CORRECT
'use server';
export async function createEvent(formData: FormData) {
  const session = await getSession();
  // Validate and process
}
```

### Dynamic Routes Naming

**Use specific, meaningful names for dynamic route parameters instead of generic `id`.**

This helps maintain clarity when routes become deeply nested.

```
// ❌ WRONG - Generic parameter name
/movies/[id]/
/users/[id]/reviews/[id]/  // Which id is which?

// ✅ CORRECT - Specific parameter names
/movies/[movieId]/
/users/[userId]/reviews/[reviewId]/

// Project examples:
/tenants/[tenantId]/
/tenants/[tenantId]/playback/[userCalendarEventId]/
/tenants/[tenantId]/settings/users/[userId]/
```

Benefits:
- Clear which ID belongs to which resource in deeply nested routes
- Better type safety in `params` object
- Self-documenting code

```tsx
// ✅ CORRECT - Clear parameter types
type PageProps = {
  params: {
    tenantId: string;
    userCalendarEventId: string;
  };
};

export default async function Page({ params }: PageProps) {
  const { tenantId, userCalendarEventId } = params;
  // Clear which ID is for which resource
}
```

### Dependency Injection Pattern for Components

**Do not pass `mode`, `type`, or similar discriminator props that cause internal branching.** Instead, inject logic as props (functions, callbacks, render props).

This follows the Dependency Injection pattern and makes components more reusable and testable.

```tsx
// ❌ WRONG - Mode-based branching
type UserCardProps = {
  user: User;
  mode: 'view' | 'edit' | 'compact';
};

function UserCard({ user, mode }: UserCardProps) {
  if (mode === 'view') {
    return <div>{user.name}</div>;
  }
  if (mode === 'edit') {
    return <input defaultValue={user.name} />;
  }
  if (mode === 'compact') {
    return <span>{user.name.split(' ')[0]}</span>;
  }
}

// ❌ WRONG - Type-based branching
type ButtonProps = {
  type: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
};

function Button({ type, onClick }: ButtonProps) {
  if (type === 'primary') {
    return <button className="primary" onClick={onClick}>Click</button>;
  }
  if (type === 'secondary') {
    return <button className="secondary" onClick={onClick}>Click</button>;
  }
  // ... more branching
}

// ✅ CORRECT - Inject logic as props
type UserCardProps = {
  user: User;
  renderContent: (user: User) => React.ReactNode;
};

function UserCard({ user, renderContent }: UserCardProps) {
  return <div className="user-card">{renderContent(user)}</div>;
}

// Usage - Different behaviors injected from outside
<UserCard user={user} renderContent={(u) => <div>{u.name}</div>} />
<UserCard user={user} renderContent={(u) => <input defaultValue={u.name} />} />
<UserCard user={user} renderContent={(u) => <span>{u.name.split(' ')[0]}</span>} />

// ✅ CORRECT - Separate components for different variants
function PrimaryButton({ onClick, children }: ButtonProps) {
  return <button className="primary" onClick={onClick}>{children}</button>;
}

function SecondaryButton({ onClick, children }: ButtonProps) {
  return <button className="secondary" onClick={onClick}>{children}</button>;
}

function DangerButton({ onClick, children }: ButtonProps) {
  return <button className="danger" onClick={onClick}>{children}</button>;
}
```

**Real-world example:**

```tsx
// ❌ WRONG - Modal with type branching
type ModalProps = {
  type: 'confirm' | 'alert' | 'form';
  onClose: () => void;
};

function Modal({ type, onClose }: ModalProps) {
  return (
    <div className="modal">
      {type === 'confirm' && (
        <>
          <p>Are you sure?</p>
          <button onClick={onClose}>Yes</button>
          <button onClick={onClose}>No</button>
        </>
      )}
      {type === 'alert' && (
        <>
          <p>Alert message</p>
          <button onClick={onClose}>OK</button>
        </>
      )}
      {type === 'form' && (
        <>
          <form>{/* ... */}</form>
          <button onClick={onClose}>Submit</button>
        </>
      )}
    </div>
  );
}

// ✅ CORRECT - Inject content as children or render props
type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
};

function Modal({ children, onClose }: ModalProps) {
  return (
    <div className="modal">
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
}

// Usage - Logic injected from outside
<Modal onClose={handleClose}>
  <p>Are you sure?</p>
  <button onClick={handleConfirm}>Yes</button>
  <button onClick={handleClose}>No</button>
</Modal>

<Modal onClose={handleClose}>
  <p>Alert message</p>
  <button onClick={handleClose}>OK</button>
</Modal>
```

**Why avoid mode/type props:**
- Components become harder to test (need to test all modes)
- Violates Single Responsibility Principle
- Difficult to extend (adding new modes requires changing the component)
- Makes components less predictable
- Tight coupling between component and business logic

**Benefits of dependency injection:**
- Components focus on presentation only
- Logic lives in parent components or containers
- Easier to test (mock injected functions)
- More flexible and reusable
- Follows Open/Closed Principle (open for extension, closed for modification)

### Form Component Design

**When implementing forms, pass the following as props:**
- `initialValue` (optional) - Initial form values
- `onSubmit` - Behavior when form is submitted
- `onSuccess` - Behavior when submission succeeds
- `onFailure` - Behavior when submission fails

This is a specific application of the Dependency Injection pattern above.

```tsx
// ✅ CORRECT - Props-based form design
type UserFormProps = {
  initialValue?: Partial<User>;
  onSubmit: (data: UserFormData) => Promise<void>;
  onSuccess?: () => void;
  onFailure?: (error: Error) => void;
};

export function UserForm({
  initialValue,
  onSubmit,
  onSuccess,
  onFailure
}: UserFormProps) {
  const handleSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data);
      onSuccess?.();
    } catch (error) {
      onFailure?.(error as Error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input name="name" defaultValue={initialValue?.name} />
      <Input name="email" defaultValue={initialValue?.email} />
      <Button type="submit">Submit</Button>
    </form>
  );
}

// Usage - Create mode
<UserForm
  onSubmit={async (data) => {
    await createUser(data);
  }}
  onSuccess={() => {
    toast.success('User created');
    router.push('/users');
  }}
  onFailure={(error) => {
    toast.error(error.message);
  }}
/>

// Usage - Edit mode
<UserForm
  initialValue={existingUser}
  onSubmit={async (data) => {
    await updateUser(existingUser.id, data);
  }}
  onSuccess={() => {
    toast.success('User updated');
  }}
/>

// ❌ WRONG - Hardcoded behavior inside component
export function UserForm({ mode }: { mode: 'create' | 'edit' }) {
  const handleSubmit = async (data: UserFormData) => {
    if (mode === 'create') {
      await createUser(data);
      toast.success('User created');
      router.push('/users');
    } else {
      await updateUser(data.id, data);
      toast.success('User updated');
    }
  };
  // ... form JSX
}
```

### Uncontrolled Forms with useActionState + Conform

**フォームは Uncontrolled（非制御）で実装する。** `useActionState`（React 19）と Conform（`@conform-to/react`）の `useForm` を組み合わせ、Server Action と連携するパターンを標準とする。

Controlled（`useState` で各フィールドの値を管理）は原則禁止。フォームの値は DOM が保持し、送信時に `FormData` として Server Action に渡す。

```tsx
// ❌ WRONG - Controlled form with useState
'use client'
import { useState } from 'react'

export function UserForm({ onSubmit }: UserFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await onSubmit({ name, email })
    if (result.error) setErrors(result.error)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  )
}

// ✅ CORRECT - Uncontrolled form with useActionState + Conform
'use client'
import { getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { useActionState } from 'react'

export function UserForm({ action, onSuccess }: UserFormProps) {
  const [lastResult, formAction, isPending] = useActionState(action, {
    error: { message: [] },
  })

  const [form, fields] = useForm({
    lastResult,
    defaultValue: { name: '', email: '' },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: UserFormSchema })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  return (
    <form action={formAction} id={form.id} onSubmit={form.onSubmit}>
      <Input
        {...getInputProps(fields.name, { type: 'text' })}
        key={fields.name.key}
        error={!!fields.name.errors?.[0]}
      />
      <Input
        {...getInputProps(fields.email, { type: 'email' })}
        key={fields.email.key}
        error={!!fields.email.errors?.[0]}
      />
      <Button type="submit" isLoading={isPending}>Submit</Button>
    </form>
  )
}
```

**構成要素:**

| 役割 | 使用する API |
|---|---|
| Server Action の状態管理 | `useActionState` |
| フォームのバリデーション・フィールド管理 | Conform `useForm` + `getInputProps` / `getSelectProps` |
| バリデーションスキーマ | Zod (`parseWithZod`) |
| 送信中の状態 | `useActionState` が返す `isPending` |
| サーバーエラーの表示 | `lastResult` から取得 |

**なぜ Uncontrolled を推奨するか:**
- `useState` による再レンダリングが不要で、パフォーマンスが良い
- Server Action との相性が良い（`FormData` をそのまま渡せる）
- Progressive Enhancement が効く（JS が無効でもフォーム送信が動作する）
- バリデーションロジックをサーバーとクライアントで共有できる（Zod スキーマ）

### Avoid useState for Form/Async State

**フォームや非同期処理の状態管理に `useState` を使わない。** 代わりに `useTransition` や `useOptimistic` を使用する。

`useState` でローディング状態やエラー状態を手動管理すると、状態の不整合や更新漏れが起きやすい。React 19 が提供する専用フックを使えば、フレームワークが状態遷移を正しく管理してくれる。

```tsx
// ❌ WRONG - useState でローディング・エラーを手動管理
'use client'
import { useState } from 'react'

export function DeleteButton({ id }: { id: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteItem(id)
    } catch (e) {
      setError('削除に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button onClick={handleDelete} disabled={isLoading}>
        {isLoading ? '削除中...' : '削除'}
      </button>
      {error && <p>{error}</p>}
    </>
  )
}

// ✅ CORRECT - useTransition で状態遷移を管理
'use client'
import { useTransition } from 'react'

export function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      await deleteItem(id)
    })
  }

  return (
    <button onClick={handleDelete} disabled={isPending}>
      {isPending ? '削除中...' : '削除'}
    </button>
  )
}

// ❌ WRONG - useState で楽観的更新を手動管理
'use client'
import { useState } from 'react'

export function LikeButton({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount)
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = async () => {
    setIsLiked(true)
    setCount(prev => prev + 1)
    try {
      await likePost()
    } catch {
      setIsLiked(false)
      setCount(prev => prev - 1)
    }
  }

  return <button onClick={handleLike}>{isLiked ? '❤️' : '🤍'} {count}</button>
}

// ✅ CORRECT - useOptimistic で楽観的更新
'use client'
import { useOptimistic, useTransition } from 'react'

export function LikeButton({ initialCount }: { initialCount: number }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticCount, setOptimisticCount] = useOptimistic(initialCount)

  const handleLike = () => {
    startTransition(async () => {
      setOptimisticCount(prev => prev + 1)
      await likePost()
    })
  }

  return <button onClick={handleLike}>{optimisticCount}</button>
}
```

**使い分け:**

| ユースケース | 使用する API |
|---|---|
| フォーム送信（Server Action） | `useActionState` |
| ボタンクリックなどの非同期アクション | `useTransition` |
| 楽観的 UI 更新 | `useOptimistic` + `useTransition` |
| フォームの入力値 | Uncontrolled（DOM 管理） |

**`useState` が許容されるケース:**
- UI のトグル状態（モーダルの開閉、アコーディオンの展開など）
- サーバーと無関係なクライアント専用の状態
- 外部ライブラリが `useState` を要求する場合

## Package Manager

**Always use pnpm, never npm or yarn.**

```bash
# ✅ CORRECT
pnpm install
pnpm add package-name
pnpm --filter web dev

# ❌ WRONG
npm install
yarn add package-name
```
