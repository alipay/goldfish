import path from 'path';
import fs from 'fs-extra';

export interface CreateMiniProjectOptions {
  templateName?: string;
}

export default async function createMiniProject(
  fn: (context: { projectDir: string }) => any | Promise<any>,
  options?: CreateMiniProjectOptions,
) {
  const normalizedOptions = {
    templateName: 'mini-project',
    ...options,
  };
  const sourceDir = path.resolve(__dirname, `./templates/${normalizedOptions.templateName}`);
  const targetDir = path.resolve(__dirname, `./tmp/${normalizedOptions.templateName}-${Math.random()}-${Date.now()}`);

  fs.copySync(sourceDir, targetDir);

  try {
    await fn({ projectDir: targetDir });
  } catch (e) {
    throw e;
  } finally {
    fs.rmSync(targetDir, { force: true, recursive: true });
  }
}
