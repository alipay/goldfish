// mock host
let host = 'http://localhost:5678/data';

export default (options) => new Promise((resolve, reject) => {
  my.request({
    ...options,
    url: `${host}${options.url}`,
    success: (res) => {
      resolve(res.data);
    },
    fail: reject,
  });
});