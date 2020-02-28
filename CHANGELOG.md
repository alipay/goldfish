## 1.1.0

### 💡 Main Changes

- [+] **@goldfishjs/react:** support React
  - Add `useFetchInitData`, `useGlobalData`, `useGlobalFetchInitData`, `useGlobalReady`, `useLocalReady`, `usePlugins` and `usePluginsReady`.
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
