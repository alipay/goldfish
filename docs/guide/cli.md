# 命令行工具

goldfish-cli 是 Goldfish 配套的命令行工具。

### boot

```bash
# 将 code 代码编译到 src 中
$ goldfish boot
```

### dev

```bash
# 启动 mock 服务，动态监听 code 代码变化编译到 src 中
$ goldfish dev
```

### bundle

```bash
# 构建打包代码
$ goldfish bundle
```

### 启动模拟器

```bash
# 启动 ios、android、qrcode
$ goldfish run-ios
$ goldfish run-android
$ goldfish run-qr
```
