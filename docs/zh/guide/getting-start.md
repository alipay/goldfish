# 快速上手

## 环境准备

### 前端环境准备

#### 安装 node

安装 [node](https://nodejs.org/en/)，并确保 node 版本是 8.x 以上。（你可以使用 [nvm](https://github.com/creationix/nvm) 来管理 node 版本）

安装完毕后，可以在命令行查看是否安装成功

```bash
$ node -v # echo 8.x.x 输出版本表示安装完毕
```

#### 安装 tnpm

[tnpm](https://npm.alibaba-inc.com/) 是内部的 npm 镜像源。

```bash
$ [sudo] npm install --registry=https://registry.npm.alibaba-inc.com -g tnpm
```

### 小程序开发环境准备

#### 安装 Xcode

- 安装 [Xcode](https://developer.apple.com/download/)
- 启动 Xcode
- 安装 Xcode command line tools：`Xcode-select --install`

#### 安装 HPM

[HPM](https://yuque.antfin-inc.com/nebula/nebulasdk/uqaf3g) 是 Hybrid-App 管理和开发工具。

```bash
$ tnpm install -g hpm
```

#### 安装 antman

[AntMan](https://yuque.antfin-inc.com/antman) 是 Mac 系统下运行的客户端开发辅助工具，可以用来调试小程序网络请求。

#### 安装小程序 IDE

安装[小程序 IDE](https://render.alipay.com/p/f/fd-jwq8nu2a/pages/home/index.html) 用于本地快速调试。

#### 准备 iOS 模拟器

如果希望在 iOS 模拟器中预览小程序，则需要准备模拟器环境。

1. 创建模拟器：

  ```bash
  # 根据需要选择合适的 iOS 系统版本
  hpm sim create
  ```

2. 安装支付宝客户端：

  ```bash
  # 根据需要选择合适的客户端版本
  hpm sim i
  ```

3. 启动模拟器：

  ```bash
  # 选择刚创建的模拟器。
  # 注意启动之前，要退出 Simulator 应用。
  hpm sim start
  ```

4. 安装证书：

  ```bash
  hpm sim i crt
  ```

5. 配置 Host：

```
127.0.0.1 my.local.alipay.net
```

6. 重启模拟器。

## 从脚手架开始

以上环境依赖安装完毕后，直接从一个 Goldfish 脚手架项目快速开始：

```bash
# clone 脚手架项目到本地
$ git clone git@gitlab.alipay-inc.com:goldfish/goldfish-boilerplate.git ./myapp

# 安装项目依赖
$ tnpm run boot

# 启动项目服务
$ tnpm start
```

项目启动过后，你可以在 Xcode 模拟器上查看效果，打开 `Xcode -> Open Developer Tool -> Simulator`，然后在项目路径运行 `tnpm run sim-ios` 即可以把当前项目运行在模拟器中。

> 后续还会直接支持小程序 IDE 以及 Android 的实践方法。

## 从伙伴小程序开始

[伙伴小程序](https://huoban.alipay.com/lite/miniapp/dashboard) 现在是内部推荐的新建小程序平台，你可以直接在上面选择 Goldfish 模板新建。

![huoban](https://gw-office.alipayobjects.com/basement_prod/fdc48d54-b00f-44bc-a0e4-38edb836d241.png)

## 如何调试

打开小程序 IDE，选取 Goldfish 项目的 `src` 目录，则会自动识别为小程序项目，可以进行本地调试。

## 构建部署

当你的项目开发完毕，运行：

```bash
$ tnpm run build
```

即可进行项目构建，如果是在 [伙伴平台](https://huoban.alipay.com/lite/miniapp/dashboard) 则更方便，直接在平台进行项目的构建发布管理。
