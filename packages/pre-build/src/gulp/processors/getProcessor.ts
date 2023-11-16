import ts from './exts/ts'
import js from './exts/js'
import less from './exts/less'
import getUserConfig from '../getUserConfig';
import prevProcessor from './prevProcessor';
import suffixProcessor from './suffixProcessor';
import { noop } from '../../utils';

const processors = { ts, js, less, dts: [] }

export default function getProcessors(type: string) {
  const { prebuild } = getUserConfig();
  const { gulp } = prebuild || {};
  const fn = gulp?.[type] || noop;
  const mainProcessor = fn(processors[type] || []);
  
  return [
    ...prevProcessor,
    ...mainProcessor,
    ...suffixProcessor 
  ]
}
