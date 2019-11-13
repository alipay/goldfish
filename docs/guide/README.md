# 介绍

Goldfish 是一个企业级支付宝小程序开发框架，也可以认为它是一个支付宝小程序开发解决方案的最佳实践。

## 特性

- 基于响应式的状态管理；
- 📐完善的 TypeScript 支持，极致的类型提示；
- 🚀Composition API 完备（参考自 [Vue Composition API](https://vue-composition-api-rfc.netlify.com/)）：
  - 更灵活的逻辑复用；
  - 更强力的类型推导；
  - 更小的打包尺寸。

## 为什么要用

* 引入响应式能力，使代码更富表达力，省去大量状态同步代码，让状态管理更轻松。
* 在原生支付宝小程序的基础上增加了对 TypeScript 的深度支持，极大提升了开发体验和开发效率。
* 借鉴 [Vue Composition API](https://vue-composition-api-rfc.netlify.com/)，使用全新的方式组织状态逻辑代码，相比于传统的 Redux，样板代码几近于无，对 TypeScript 的支持也更友好。
* 基于 Composition API 的函数编码方式，天然支持 [Tree-Shaking](https://webpack.js.org/guides/tree-shaking/)，“摇掉”无用代码。
