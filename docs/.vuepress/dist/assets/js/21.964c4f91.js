(window.webpackJsonp=window.webpackJsonp||[]).push([[21],{208:function(s,t,a){"use strict";a.r(t);var n=a(0),e=Object(n.a)({},(function(){var s=this,t=s.$createElement,a=s._self._c||t;return a("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[a("h1",{attrs:{id:"数据请求插件"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#数据请求插件"}},[s._v("#")]),s._v(" 数据请求插件")]),s._v(" "),a("p",[s._v("主要处理三种类型的请求：")]),s._v(" "),a("ul",[a("li",[s._v("HTTP 请求；")]),s._v(" "),a("li",[s._v("RPC 数据请求；")]),s._v(" "),a("li",[s._v("凤蝶区块数据请求。")])]),s._v(" "),a("p",[s._v("如果全局配置中，"),a("code",[s._v("mock")]),s._v(" 配置项为 "),a("code",[s._v("true")]),s._v("，数据请求将会被定向到指定服务器（"),a("code",[s._v("mockServer")]),s._v("）。")]),s._v(" "),a("h2",{attrs:{id:"requesttwa-api-params-options"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#requesttwa-api-params-options"}},[s._v("#")]),s._v(" requestTWA(api, params?, options?)")]),s._v(" "),a("ul",[a("li",[a("p",[a("strong",[s._v("参数：")])]),s._v(" "),a("ul",[a("li",[a("code",[s._v("{string} api")]),s._v(" 要请求的 TWA 接口地址")]),s._v(" "),a("li",[a("code",[s._v("{Object} params?")]),s._v(" 请求参数")]),s._v(" "),a("li",[a("code",[s._v("{Object} options?")]),s._v(" "),a("ul",[a("li",[a("code",[s._v("{boolean} showLoading?")]),s._v(" 是否展示加载效果")]),s._v(" "),a("li",[a("code",[s._v("{number} delay?")]),s._v(" 延迟多长时间才展示加载效果")]),s._v(" "),a("li",[a("code",[s._v("{boolean} needAuthorized?")]),s._v(" 是否需要登录验证")]),s._v(" "),a("li",[a("code",[s._v("{number} timeout?")]),s._v(" 请求超时时间")]),s._v(" "),a("li",[a("code",[s._v("{string} forward?")]),s._v(" 将请求定位到指定的机器")])])])])]),s._v(" "),a("li",[a("p",[a("strong",[s._v("返回值：")]),a("code",[s._v("{Promise<T>}")])])]),s._v(" "),a("li",[a("p",[a("strong",[s._v("说明：")])]),s._v(" "),a("p",[s._v("请求 TWA 应用接口。")])]),s._v(" "),a("li",[a("p",[a("strong",[s._v("示例：")])]),s._v(" "),a("div",{staticClass:"language-ts line-numbers-mode"},[a("div",{staticClass:"highlight-lines"},[a("br"),a("br"),a("br"),a("br"),a("br"),a("br"),a("br"),a("div",{staticClass:"highlighted"},[s._v(" ")]),a("br"),a("br"),a("br"),a("br")]),a("pre",{pre:!0,attrs:{class:"language-ts"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("import")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v(" setupPage"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" usePlugins"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" usePageLifeCycle "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("from")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'@alipay/goldfish'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("Page")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" plugins "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("usePlugins")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n  "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("usePageLifeCycle")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'onLoadReady'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("async")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" res "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("await")]),s._v(" plugins"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("requester"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("requestTWA"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("IListResponse"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'passion.index.list'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n")])]),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br"),a("span",{staticClass:"line-number"},[s._v("11")]),a("br")])])])]),s._v(" "),a("h2",{attrs:{id:"requesth5data-path-basementprojectname-options"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#requesth5data-path-basementprojectname-options"}},[s._v("#")]),s._v(" requestH5Data(path, basementProjectName, options?)")]),s._v(" "),a("ul",[a("li",[a("p",[a("strong",[s._v("参数：")])]),s._v(" "),a("ul",[a("li",[a("code",[s._v("{string} path")]),s._v(" schema 文件在项目中的路径")]),s._v(" "),a("li",[a("code",[s._v("{string} basementProjectName")]),s._v(" 对应 Basement 上凤蝶区块项目名称")]),s._v(" "),a("li",[a("code",[s._v("{Object} options?")]),s._v(" "),a("ul",[a("li",[a("code",[s._v("{boolean} showLoading?")]),s._v(" 是否展示加载效果")]),s._v(" "),a("li",[a("code",[s._v("{number} delay?")]),s._v(" 延迟多长时间才展示加载效果")])])])])]),s._v(" "),a("li",[a("p",[a("strong",[s._v("说明：")])]),s._v(" "),a("p",[s._v("请求凤蝶区块数据。")])]),s._v(" "),a("li",[a("p",[a("strong",[s._v("示例：")])]),s._v(" "),a("div",{staticClass:"language-ts line-numbers-mode"},[a("div",{staticClass:"highlight-lines"},[a("br"),a("br"),a("br"),a("br"),a("br"),a("br"),a("br"),a("div",{staticClass:"highlighted"},[s._v(" ")]),a("br"),a("br"),a("br"),a("br")]),a("pre",{pre:!0,attrs:{class:"language-ts"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("import")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v(" setupPage"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" usePlugins"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" usePageLifeCycle "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("from")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'@alipay/goldfish'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("Page")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" plugins "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("usePlugins")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n  "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("usePageLifeCycle")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'onLoadReady'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("async")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" res "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("await")]),s._v(" plugins"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("requester"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("requestH5Data"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("IConfigData"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'config-h5data'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'device'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n")])]),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br"),a("span",{staticClass:"line-number"},[s._v("11")]),a("br")])])])]),s._v(" "),a("h2",{attrs:{id:"sendrequest-url"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#sendrequest-url"}},[s._v("#")]),s._v(" sendRequest(url)")])])}),[],!1,null,null,null);t.default=e.exports}}]);