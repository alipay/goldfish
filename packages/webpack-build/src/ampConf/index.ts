import { ampConf } from './default-conf'
import { AmpConf } from '../types'
import { merge } from '../utils'

export { platformConf } from './default-conf'

let userConf = {}

export function setConfig(conf: Partial<AmpConf>) {
  userConf = conf
}

export function parseAmpConf(): AmpConf {
  return merge(ampConf, userConf)
}
