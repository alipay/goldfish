import fs from 'fs-extra'
import path from 'path'

// --- config ---
// module.exports = {
//   prebuild: {
//     gulp: {
//       ts(processors) {
//         return processors;
//       },
//       less(processors) {
//         return processors;
//       },
//       axml(processors) {
//         return processors;
//       },
//       copy(processors) {
//         return processors;
//       },
//     },
//   },
// };

export default function getCustomConfig () {
  const configPath = path.resolve(process.cwd(), 'goldfish.config.js');
  if (!fs.existsSync(configPath)) return {};
  return require(configPath);
};
