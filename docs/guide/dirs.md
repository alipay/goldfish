# 目录结构

Goldfish 倾向于选择约定的方式组织文件和目录，一个标准的 Goldfish 应用目录结构如下：

```
.
├── _tmp/                          // 默认的 build 输出目录（用户无需关心）
├── code/                          // 真实业务代码的目录，Goldfish 会将此目录下的代码编译到 /src 中
    ├── .entry/                    // 编译临时文件（用户无需关心）
    ├── common/                    // 通用方法模块
    ├── components/                // 小程序业务组件
    ├── entry/                     // 入口文件，用于设置全局 AppStore 以及绑定全局配置
      ├── AppStore.ts              // 全局配置模块定义
      ├── Bridge.ts                // 容器 JSAPI 的配置
      ├── Requester.ts             // 网络请求的配置
      ├── Trace.ts                 // 数据埋点的配置
      ├── Log.ts                   // 日志信息的配置
      ├── Route.ts                 // 路由模块的配置
      ├── Feedback.ts              // 消息提示的配置
      └── index.ts                 // 入口文件
    ├── pages/                     // 小程序页面
    ├── app.acss                   // 全局样式文件
    ├── app.json                   // 小程序项目配置
    ├── app.ts                     // 入口文件
    ├── config.ts                  // 项目开发配置
    ├── package.json
    ├── tsconfig.json              // ts 配置
    └── tslint.json                // 全局布局
├── mock/                          // mock 文件所在目录，基于 express
├── src/                           // 小程序需要的源码，用户不需要关心，是通过 code 编译出来的
├── test/                          // 测试
├── .editorconfig                  // 推荐的编辑器的设定
├── .stylelintrc                   // 样式规范
├── jest.config.js
├── mobile.config.js               // 钱包容器配置
├── package.json
└── README.md
```

其中我们的编码统一在 code 中，因为小程序是读取的 src 代码，所以 goldfish-devtool 会将 code 的 TypeScript 代码编译到 src 里面。
而 code 中的目录结构跟小程序官方开发规范保持一致。
