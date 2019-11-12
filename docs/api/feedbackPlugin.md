# 交互反馈插件

管理全局的 alert、toast、confirm、prompt 弹窗。

为了避免同一个时刻弹出多个全局弹窗，本模块做了可选的“串行”控制：前一个弹窗未消失之前，下一个弹窗不会弹出。

## addToast(options)

* **参数：**

  * `{Object} options`
    * `{number} duration?` 显示时长，单位为 ms，默认 2000
    * `{string} content?` 内容
    * `{Function} complete?` 显示结束后的回调函数
    * `{boolean} isBlock?` 是否阻塞下一个弹窗

* **说明：**

  显示 toast 弹窗。

## addAlert(options)

* **参数：**

  * `{Object} options`
    * `{string} title?` 标题
    * `{string} buttonText?` 按钮文字，默认为“确定”
    * `{string} content?` 内容
    * `{Function} complete?` 显示结束后的回调函数
    * `{boolean} isBlock?` 是否阻塞下一个弹窗

* **说明：**

  显示 alert 弹窗。

## addConfirm(options)

* **参数：**

  * `{Object} options`
    * `{string} title?` 标题
    * `{string} okButtonText?` 确认按钮文字，默认为“确定”
    * `{string} cancelButtonText?` 取消按钮文字，默认为“取消”
    * `{string} content?` 内容
    * `{Function} complete?` 显示结束后的回调函数
    * `{boolean} isBlock?` 是否阻塞下一个弹窗

* **说明：**

  显示 confirm 弹窗。

## addPrompt(options)

* **参数：**

  * `{Object} options`
    * `{string} title?` 标题
    * `{string} okButtonText?` 确认按钮文字，默认为“确定”
    * `{string} cancelButtonText?` 取消按钮文字，默认为“取消”
    * `{string} content?` 内容
    * `{Function} complete?` 显示结束后的回调函数
    * `{boolean} isBlock?` 是否阻塞下一个弹窗

* **说明：**

  显示 prompt 弹窗。
