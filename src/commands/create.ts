import { Argv } from 'yargs'
import helper from '../core/helper'
import { baseOptions } from '../core/yargs'

export function builder(yargs: Argv): Promise<Argv> {
  // @ts-ignore
  return baseOptions(yargs).option('name', {
    describe: 'Defines the name of the migration',
    type: 'string',
    demandOption: true
  }).argv
}

export function handler(argv: any): void {
  const configs = helper.getConfigs(argv)
  const filename = helper.fileFormArgv(argv)
  const content = helper.fileContentFormArgv(argv)
  const path =
    argv._[0] === 'create:seed'
      ? configs.seedersAbsPath
      : configs.migrationsAbsPath

  if (!helper.existsSync(path)) {
    helper.mkdirpSync(path)
  }

  helper.writeFileSync(helper.resolve(path, filename), content)
}
