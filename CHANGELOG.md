## 1.0.0

### 💡 Main Changes

- [+] **@goldfishjs/react:** support React
  - [+] Connect reactive system with React Function Component.
  - [+] Import `useProps`, `useAutorun`, `useContextType`, `useState`, and `useWatch` from previous composition APIs.
- [+] **@goldfishjs/pre-build:** Support `baseDir` and `tsconfigPath` configuration in `mini.project.json` file

  ```json
  {
    "compilerOptions": {
      "baseDir": ".",
      "tsconfigPath": "./tsconfig.json"
    }
  }
  ```
