## 1.1.6

### 🐞 Bug Fixes

- [^] **@goldfishjs/reactive-connect:**
  - avoid the invoking of setters in array methods.

## 1.1.5

### 🐞 Bug Fixes

- [^] **@goldfishjs/reactive-connect:**
  - use `cloneDeep()` to clone the reactive data that need to set to the view data.
  - change the way to check the different types.

## 1.1.4

### 💡 Main Changes

- [+] **@goldfishjs/utils:**
  - visit the object deeply and handle the circular reference.

### 🐞 Bug Fixes

- [^] **@goldfishjs/reactive:**
  - use `deepVisit()` to handle circular objects.

## 1.1.3

### 🐞 Bug Fixes

- [^] **@goldfishjs/react:**
  - use keys to update state.
  - get computed values in the `watchDeep()` callback.

## 1.1.2

### 🐞 Bug Fixes

- [^] **@goldfishjs/react:** keep `this` of the component function in `observer`.

### 💡 Main Changes

- [+] **@goldfish/react:**
  - add `useMount()` and `useUnmount()`.
  - add `useSetup()` to support the strange compiler in Taro.

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
