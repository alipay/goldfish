# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.3.0](https://github.com/alipay/goldfish/compare/v1.2.1...v1.3.0) (2020-11-24)


### Features

* add return type. ([3371b10](https://github.com/alipay/goldfish/commit/3371b1089369267d21e067f66498d032d7779231))
* batch update for react. ([405697d](https://github.com/alipay/goldfish/commit/405697d2143409154a438e1fd2a815f379404b90))
* use babel-plugin-import to compile ([42c7b3e](https://github.com/alipay/goldfish/commit/42c7b3e3200ef5735e052647a6a2f4a358b62b98))





## [1.2.1](https://github.com/alipay/goldfish/compare/v1.2.0...v1.2.1) (2020-09-25)


### Bug Fixes

* move to dependencies ([c587a7f](https://github.com/alipay/goldfish/commit/c587a7f21383dcb7f8157fca92478f8697552857))





# [1.2.0](https://github.com/alipay/goldfish/compare/v1.1.23...v1.2.0) (2020-09-24)


### Bug Fixes

* types ([31d2b60](https://github.com/alipay/goldfish/commit/31d2b6066085370bb6ccbf7fc4b3f6f80f8db58b))


### Features

* remove lodash-es ([ac76e93](https://github.com/alipay/goldfish/commit/ac76e93474f13fbf3211e18f037cc51d6646bbf6))





## 1.1.23

### 🐞 Bug Fixes

- **@goldfishjs/requester**
  - [^] Config the publish files.

## 1.1.22

### 💡 Main Changes

-[+] statistics.
-[^] ES5.

## 1.1.21

## 1.1.20

### 💡 Main Changes

- **@goldfishjs/requester**
  - [+] Export more things.

- **@goldfishjs/composition-api**
  - [+] Integrate page events.
  - [+] Support default data for page.
  - [+] Support default data for component.

- **@goldfishjs/react**
  - [+] Add alias for `g`.

### 🐞 Bug Fixes

- **@goldfishjs/react**
  - [^] Fix the `cache` export.

## 1.1.19

## 1.1.18

### 💡 Main Changes

- **@goldfishjs/react**
  - [+] `useMount` & `useUnmount`: Support using them in tiny app.

- [+] Add prettier.

- **@goldfishjs/requester**
  - [+] Add `cache`.
  - [+] Add `loadingCounter`.
  - [+] Add `requestingCounter`.
  - [+] Add `serial`.

- **@goldfishjs/utils**
  - [+] Add `commonError` wrapper.

## 1.1.17

### 🐞 Bug Fixes

- [^] **@goldfishjs/reactive-connect:**

  - The `$id` may be `0`.

- [^] **@goldfishjs/pre-build:**

  - Add `@goldfishjs/react`.

- [^] **@goldfishjs/react:**

  - Fix babel import config.

## 1.1.16

### 🐞 Bug Fixes

- [^] **@goldfishjs/pre-build:**
  - Avoid errors when there is no `mini.project.json`.

## 1.1.15

### 🐞 Bug Fixes

- [^] **@goldfishjs/reactive-connect:**
  - Fallback to `$viewId`.

## 1.1.14

### 🐞 Bug Fixes

- [^] **@goldfishjs/react:**
  - Put the declarations in the `.ts` file for better output.

## 1.1.13

### 🐞 Bug Fixes

- [^] **@goldfishjs/pre-build:**
  - Do not copy the `tsconfig.json`.

## 1.1.12

### 💡 Main Changes

- [+] **@goldfishjs/react:**
  - add `useRef`.
- [^] **@goldfishjs/composition-api:**
  - do not influence the `getter/setter`.

## 1.1.11

## 1.1.10

### 🐞 Bug Fixes

- [^] **@goldfishjs/reactive-connect:**
  - Reach the leaf of the Tree, break.

## 1.1.9

### 💡 Main Changes

- [^] **@goldfishjs/composition-api:**
  - put the lifecycle methods at the last execution function.

## 1.1.8

### 🐞 Bug Fixes

- [^] **@goldfishjs/reactive:**
  - `setValue` properly.
- [^] **@goldfishjs/reactive-connect**
  - use an array to record the first visit.

## 1.1.7

### 💡 Main Changes

- [^] **@goldfishjs/utils:**
  - use `customName` function for better integrations.

### 🐞 Bug Fixes

- [^] **@goldfishjs/reactive-connect:**
  - clone the value in `addNode` to avoid the `computed value` errors.

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

- [+] **@goldfishjs/react:**
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
