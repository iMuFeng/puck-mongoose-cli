import * as yargs from 'yargs'
import helper from '../core/helper'

function loadRCFile(optionsPath?: string): Object {
  const rcFile = optionsPath || helper.resolve(helper.cwd(), helper.RCFILENAME)
  const rcFileResolved = helper.resolve(rcFile)
  return helper.existsSync(rcFileResolved) ? require(rcFileResolved) : {}
}

const args = yargs
  // @ts-ignore
  .help(false)
  // @ts-ignore
  .version(false)
  .config(loadRCFile(yargs.argv.optionsPath as string))

export function getYArgs() {
  return args
}

export function baseOptions(yargs: yargs.Argv): yargs.Argv {
  return yargs
    .option('env', {
      describe: 'The environment to run the command in',
      default: 'local',
      type: 'string'
    })
    .option('typescript', {
      describe: 'Whether to use typescript format',
      default: false,
      type: 'boolean'
    })
    .option('config', {
      describe: 'The path to the config file',
      type: 'string'
    })
    .option('options-path', {
      describe: 'The path to a JSON file with additional options',
      type: 'string'
    })
    .option('migrations-path', {
      describe: 'The path to the migrations folder',
      default: 'migrations',
      type: 'string'
    })
    .option('seeders-path', {
      describe: 'The path to the seeders folder',
      default: 'seeders',
      type: 'string'
    })
    .option('debug', {
      describe: 'When available show various debug information',
      default: false,
      type: 'boolean'
    })
}
