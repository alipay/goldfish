import utils from '../../utils.sjs';

const message = 'hello alipay';
const getMsg = x => utils.format(x);

export default {
  message,
  getMsg,
};
