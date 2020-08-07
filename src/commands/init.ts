import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import { Argv } from 'yargs'
import helper from '../core/helper'
import { baseOptions } from '../core/yargs'

export function builder(yargs: Argv): Promise<Argv> {
  // @ts-ignore
  return baseOptions(yargs).argv
}

export function handler(argv: any): void {
  const configs = helper.getConfigs(argv)

  if (helper.isValid(configs.config)) {
    helper.errorLogger(
      'Config file exists. You can delete ".mongoose.js" and run this command'
    )
    process.exit(1)
  }

  mkdirp.sync(configs.migrationsAbsPath)
  mkdirp.sync(configs.seedersAbsPath)

  fs.writeFileSync(
    configs.rcFileAbsPath,
    `const path = require('path')

module.exports = {
  config: {
    url: 'mongodb://localhost'
  },
  'migrations-path': path.join(__dirname, '${helper.NAMESPACE}/${configs.migrationsPath}'),
  'seeders-path': path.join(__dirname, '${helper.NAMESPACE}/${configs.seedersPath}')
}`
  )
}
