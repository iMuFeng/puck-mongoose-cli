import { Argv } from 'yargs'
import { ActionsEnum, TypesEnum } from '../core/helper'
import { migrator } from '../core/migrator'
import { baseOptions } from '../core/yargs'

export function builder(yargs: Argv): Promise<Argv> {
  // @ts-ignore
  return baseOptions(yargs).option('name', {
    describe: 'Select file name of the migration',
    type: 'string',
    demandOption: false
  }).argv
}

export function handler(argv: any): void {
  migrator(
    argv,
    TypesEnum.seed,
    argv._[0] === 'seed:undo' ? ActionsEnum.undo : ActionsEnum.migrate
  )
}
