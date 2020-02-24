import MiniDataSetter from './MiniDataSetter/index';

const miniDataSetter = new MiniDataSetter();
export default function getMiniDataSetter() {
  return miniDataSetter;
}
