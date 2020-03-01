## 1.1.0

### 💡 Main Changes

- [+] **@goldfishjs/react:** support React
  - `useBridge()`: encapsulation of underlying interfaces.
  - `useFeedback()`: encapsulation of Alert, Confirm, Toast, and Prompt.
  - `useRequester()`: encapsulation of data fetching, and includes fetching status.
  - `useGlobalConfig()`: get config data from global.
  - `useGlobalData()`: get global reactive data.
  - `useGlobalStorage()`: get global non-reactive data.
  - `useGlobalDestroy()`: add destroy function to the global.
  - `useGlobalFetchInitData()`: add init data fetching method to the global.
- [+] **@goldfishjs/utils:** add `isEqual`.
- [+] **@goldfishjs/composition-api:** add `usePageEvents`.

## 1.0.0

### 💡 Main Changes

- [+] **@goldfishjs/react:** support React
  - Connect reactive system with React Function Component.
  - Import `useProps`, `useAutorun`, `useContextType`, `useState`, and `useWatch` from previous composition APIs.
- [+] **@goldfishjs/pre-build:** support `baseDir` and `tsconfigPath` configuration in `mini.project.json` file

  ```json
  {
    "compilerOptions": {
      "baseDir": ".",
      "tsconfigPath": "./tsconfig.json"
    }
  }
  ```
