# State Management Skill

**Purpose:** Manage application state effectively in modern React apps  
**Impact:** Predictable data flow, easier debugging, better performance

---

## React useState

### Basic State
```typescript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

### Object State
```typescript
const [user, setUser] = useState({
  name: 'John',
  email: 'john@example.com',
  age: 30
});

// Update single property
setUser(prev => ({ ...prev, age: 31 }));

// Update multiple properties
setUser(prev => ({
  ...prev,
  name: 'Jane',
  email: 'jane@example.com'
}));
```

### Array State
```typescript
const [items, setItems] = useState<string[]>([]);

// Add item
setItems(prev => [...prev, 'new item']);

// Remove item
setItems(prev => prev.filter((_, index) => index !== indexToRemove));

// Update item
setItems(prev => prev.map((item, index) =>
  index === indexToUpdate ? 'updated item' : item
));
```

---

## React useReducer

### When to Use
- Complex state logic
- Multiple sub-values
- Next state depends on previous
- Want to optimize performance

### Basic Reducer
```typescript
import { useReducer } from 'react';

type State = {
  count: number;
  step: number;
};

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' }
  | { type: 'setStep'; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'reset':
      return { ...state, count: 0 };
    case 'setStep':
      return { ...state, step: action.payload };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, {
    count: 0,
    step: 1
  });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
      
      <input
        type="number"
        value={state.step}
        onChange={(e) => dispatch({
          type: 'setStep',
          payload: parseInt(e.target.value)
        })}
      />
    </div>
  );
}
```

---

## Context API

### Create Context
```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (user: User) => setUser(user);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Use Context
```typescript
function App() {
  return (
    <AuthProvider>
      <Header />
      <Main />
    </AuthProvider>
  );
}

function Header() {
  const { user, logout } = useAuth();
  
  return (
    <header>
      {user ? (
        <>
          <span>Welcome, {user.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <span>Not logged in</span>
      )}
    </header>
  );
}
```

---

## Zustand (Lightweight)

### Setup
```bash
npm install zustand
```

### Create Store
```typescript
import { create } from 'zustand';

interface User {
  id: number;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  
  login: (user, token) => set({ user, token }),
  
  logout: () => set({ user: null, token: null }),
}));
```

### Use Store
```typescript
function Header() {
  const { user, logout } = useAuthStore();
  
  return (
    <header>
      {user && (
        <>
          <span>{user.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      )}
    </header>
  );
}

// Access state outside components
const currentUser = useAuthStore.getState().user;
```

### Persist Store
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
);
```

---

## Redux Toolkit (Enterprise)

### Setup
```bash
npm install @reduxjs/toolkit react-redux
```

### Create Slice
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  name: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.loading = false;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
```

### Configure Store
```typescript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Use Redux
```typescript
import { Provider, useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store';

// App wrapper
function App() {
  return (
    <Provider store={store}>
      <Header />
    </Provider>
  );
}

// Component
function Header() {
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogin = async () => {
    dispatch(loginStart());
    try {
      const user = await fetchUser();
      dispatch(loginSuccess(user));
    } catch (error) {
      dispatch(loginFailure(error.message));
    }
  };

  return (
    <header>
      {loading ? (
        <span>Loading...</span>
      ) : user ? (
        <>
          <span>{user.name}</span>
          <button onClick={() => dispatch(logout())}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </header>
  );
}
```

---

## When to Use What?

### useState
✅ Local component state  
✅ Simple values  
✅ No sharing needed  

### useReducer
✅ Complex state logic  
✅ Multiple related values  
✅ Next state depends on previous  

### Context API
✅ Theming  
✅ User authentication  
✅ Language/i18n  
✅ Low-frequency updates  

### Zustand
✅ Global state  
✅ Simple API  
✅ Lightweight  
✅ Persistence needed  

### Redux Toolkit
✅ Large applications  
✅ Complex data flow  
✅ Time-travel debugging  
✅ Middleware needed  

---

## Performance Optimization

### Memoization
```typescript
import { useMemo, useCallback } from 'react';

function ExpensiveComponent({ data }: { data: number[] }) {
  // Memoize expensive calculation
  const sortedData = useMemo(() => {
    console.log('Sorting...');
    return [...data].sort((a, b) => a - b);
  }, [data]);

  // Memoize callback
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);

  return <div>{/* render */}</div>;
}
```

### React.memo
```typescript
import { memo } from 'react';

const ExpensiveComponent = memo(({ value }: { value: number }) => {
  console.log('Rendering ExpensiveComponent');
  return <div>{value}</div>;
});

// Only re-renders if value changes
```

### Selector Optimization (Redux)
```typescript
import { createSelector } from '@reduxjs/toolkit';

// Memoized selector
const selectActiveUsers = createSelector(
  (state: RootState) => state.users.all,
  (users) => users.filter(u => u.active)
);

// Use in component
const activeUsers = useSelector(selectActiveUsers);
```

---

## Async State

### useState with Async
```typescript
function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user found</div>;

  return <div>{user.name}</div>;
}
```

### Redux Thunk
```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUser = createAsyncThunk(
  'users/fetch',
  async (userId: number) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    current: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.current = action.payload;
        state.loading = false;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});
```

---

## Best Practices

### ✅ DO
```typescript
// Keep state close to where it's used
function Form() {
  const [email, setEmail] = useState('');
  // Use email only here
}

// Lift state when needed by siblings
function Parent() {
  const [shared, setShared] = useState('');
  return (
    <>
      <ChildA value={shared} />
      <ChildB onChange={setShared} />
    </>
  );
}

// Use derived state
const [items, setItems] = useState([]);
const activeItems = items.filter(i => i.active); // Don't store in state

// Split unrelated state
const [name, setName] = useState('');
const [email, setEmail] = useState('');
// Not: const [form, setForm] = useState({ name: '', email: '' });
```

### ❌ DON'T
```typescript
// Don't store derived values
const [items, setItems] = useState([]);
const [count, setCount] = useState(0); // ❌ Derive from items.length

// Don't put everything in global state
const [buttonColor, setButtonColor] = useState('blue'); // ❌ Keep local

// Don't mutate state
items.push(newItem); // ❌
setItems(items); // Won't trigger re-render

// Do this instead:
setItems([...items, newItem]); // ✅
```

---

**Manage state wisely. Keep it simple. Scale when needed.** 📦✨

---

_State Management Skill by CLAWDY - 12 Feb 2026_
