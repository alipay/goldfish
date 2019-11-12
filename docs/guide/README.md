# 介绍

Goldfish 是一个支付宝小程序开发框架，你也可以认为它是一个支付宝小程序开发解决方案的最佳实践。

Goldfish 大体上可以分为 4 个部分：

- goldfish 开发框架：基于类 Vue 3.x 的 [Composition API](https://vue-composition-api-rfc.netlify.com/#summary) 为基础的组件 API 设计和状态管理；
- goldfish-cli：贯穿开发流程的自动化工具；
- goldfish-devtool：强大的小程序调试工具；
- 开发流程的规范指引：包含小程序开发、测试、构建、部署等相关开发流程。

Goldfish 是经过长达一年时间的积累，从跨境游小程序业务提炼出来的，目前已经在心想狮城、退税小程序、中行货币预约兑换等实际业务中使用，不过还处在打磨阶段，后续还会有更多落地的业务实践不断打磨，也欢迎有小程序业务的开发同学一起落地业务，技术共建。

## 特性

- 📦开箱即用，完善的开发流程，根据模板框架、样例等快速构建自己的应用；
- 📐完善的 TypeScript 支持，整个项目可以方便的用 TypeScript 进行开发；
- 🚀Composition API 完备：
  - 能够更好的进行逻辑组合与复用；
  - 更强力的类型推导；
  - 更小的打包尺寸。

## 为什么要用

目前在小程序开发体系中还有还有很多痛点与不足，比如：TypeScript 的支持不够友好、状态管理的框架不够好用、整体的开发流程自动化程度较低等问题。
直接带来的影响就是开发效率不够、代码质量不足后期维护复杂等问题，而 Goldfish 就是由此而来。

Goldfish 会实时转化 TypeScript 代码为小程序支持的 JavaScript 代码，你的整个项目可以方便的完全用 TypeScript 开发，而带来的好处就是更高的代码质量和可维护性。

另外 Goldfish 的框架是基于 Composition API 设计的，其设计理念来自于 [Vue 3.x 设计 RFC](https://vue-composition-api-rfc.netlify.com/#summary)，所以状态管理类似于 React Hooks，更加的清晰、好用，并且易于类型推导和测试。
