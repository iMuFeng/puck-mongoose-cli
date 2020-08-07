import helper from '@puckjs/utils/lib/helper'
import * as chalk from 'chalk'
import * as dayjs from 'dayjs'
import { existsSync, writeFileSync } from 'fs'
import * as globby from 'globby'
import * as mkdirp from 'mkdirp'
import { basename, join, resolve } from 'path'
import { Argv } from 'yargs'

export interface Configs {
  env: 'local' | 'prod' | 'unittest'
  typescript: boolean
  name: string
  config: {
    url: string
    options: any
  }
  optionsPath?: string
  migrationsPath: string
  seedersPath: string
  rcFileAbsPath: string
  migrationsAbsPath: string
  seedersAbsPath: string
  debug: boolean
}

export interface Files {
  path: string
  name: string
}

export enum TypesEnum {
  migration,
  seed
}

export enum ActionsEnum {
  migrate,
  undo
}

const NAMESPACE = 'mongoose'
const RCFILENAME = `.${NAMESPACE}rc.js`
const DATETIMEFORMAT = 'YYYYMMDDHHmmss'
const JSTEMPLATE = `module.exports = {
  async up(mongoose) {
  },
  async down(mongoose) {
  }
}`
const TSTEMPLATE = `import { Connection } from 'mongoose'

export default {
  async up(mongoose: Connection) {
  },
  async down(mongoose: Connection) {
  }
}`

const cwd = () => process.cwd()
const mkdirpSync = mkdirp.sync

function infoLogger(message: string): void {
  console.log(chalk.blue('[mongoose-cli]'), message)
}

function errorLogger(message: string): void {
  console.log(chalk.blue('[mongoose-cli]'), chalk.red(message))
}

function successLogger(message: string): void {
  console.log(chalk.blue('[mongoose-cli]'), chalk.green(message))
}

function getConfigs(argv: Argv): Configs {
  const configs = (argv as any) as Configs
  configs.rcFileAbsPath = resolve(cwd(), RCFILENAME)
  configs.migrationsAbsPath = resolve(cwd(), NAMESPACE, configs.migrationsPath)
  configs.seedersAbsPath = resolve(cwd(), NAMESPACE, configs.seedersPath)
  return configs
}

function globbyArgvFiles(
  argv: Argv,
  type: TypesEnum,
  filename?: string
): Files[] {
  const configs = getConfigs(argv)
  const dir =
    type === TypesEnum.migration
      ? configs.migrationsAbsPath
      : configs.seedersAbsPath

  if (filename) {
    const path = resolve(dir, filename)
    const name = basename(path)
    return [{ path, name }]
  }

  const ext = extFromArgv(argv)

  return globby.sync(resolve(dir, `**/*${ext}`)).map(path => {
    return {
      path,
      name: basename(path)
    }
  })
}

function fileFormArgv(argv: Argv): string {
  const ext = extFromArgv(argv)
  const dateTime = dayjs().format(DATETIMEFORMAT)
  return `${dateTime}-${argv.name}${ext}`
}

function fileContentFormArgv(argv: Argv): string {
  const configs = getConfigs(argv)
  return configs.typescript ? TSTEMPLATE : JSTEMPLATE
}

function extFromArgv(argv: Argv): string {
  const configs = getConfigs(argv)
  return configs.typescript ? '.ts' : '.js'
}

export default {
  ...helper,
  NAMESPACE,
  RCFILENAME,
  cwd,
  basename,
  errorLogger,
  existsSync,
  extFromArgv,
  fileFormArgv,
  fileContentFormArgv,
  getConfigs,
  globbyArgvFiles,
  infoLogger,
  join,
  mkdirpSync,
  resolve,
  successLogger,
  writeFileSync
}
