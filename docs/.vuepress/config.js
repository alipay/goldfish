const { join } = require('path');
const { description } = require('../../package');

module.exports = {
  base: '/goldfish/',
  title: 'Goldfish',
  description: description,

  locales: {
    '/': {
      lang: 'en-US',
      description: 'A development framework for Alipay mini programs.',
    },
  },

  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    [
      'meta',
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
    ],
    [
      'link',
      {
        rel: 'icon',
        href:
          'https://gw-office.alipayobjects.com/basement_prod/dc20c631-5c76-4c71-880a-155ec0b108de.png',
      },
    ],
  ],

  stylus: {
    import: [join(__dirname, './styles/global.styl')],
  },

  markdown: {
    lineNumbers: true,
  },

  themeConfig: {
    repo: 'alipay/goldfish',
    docsDir: 'docs',
    editLinks: true,
    lastUpdated: '',
    locales: {
      '/': {
        selectText: 'Languages',
        label: 'English',
        editLinkText: 'Edit this page on GitHub',
        serviceWorker: {
          updatePopup: {
            message: 'New content is available.',
            buttonText: 'Refresh',
          },
        },
        algolia: {},
        nav: [
          { text: 'Guide', link: '/guide/' },
          { text: 'API', link: '/api/' },
        ],
        sidebar: {
          '/guide/': [
            {
              title: 'Guide',
              collapsable: false,
              children: [
                'getting-start',
                'reactive',
                'reactive-progressive',
                'dive-in-reactive',
              ],
            },
          ],
          '/api/': [
            {
              title: 'API',
              collapsable: false,
              children: [
                '',
                'stores',
                'reactivity',
                'plugins',
              ],
            },
          ],
        },
      },
      '/zh/': {
        // 多语言下拉菜单的标题
        selectText: '选择语言',
        // 该语言在下拉菜单中的标签
        label: '简体中文',
        // 编辑链接文字
        editLinkText: '在 GitHub 上编辑此页',
        // Service Worker 的配置
        serviceWorker: {
          updatePopup: {
            message: '发现新内容可用.',
            buttonText: '刷新',
          },
        },
        // 当前 locale 的 algolia docsearch 选项
        algolia: {},
        nav: [
          { text: 'Guide', link: '/zh/guide/' },
          { text: 'API', link: '/zh/api/' },
        ],
        sidebar: {
          '/zh/guide/': [
            {
              title: '指南',
              collapsable: false,
              children: [
                '',
                'getting-start',
                'dirs',
                'concept',
                'cli',
                'state',
                'dive-in-reactive',
                'plugin',
              ],
            },
          ],
          '/zh/api/': [
            {
              title: 'API',
              collapsable: false,
              children: [
                '',
                'globalConfig',
                'Page',
                'Component',
                'plugins',
                'utils',
              ],
            },
          ],
        },
      },
    },
  },

  plugins: ['@vuepress/plugin-back-to-top', '@vuepress/plugin-medium-zoom'],
};
