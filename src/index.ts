#!/usr/bin/env node

import * as create from './commands/create'
import * as init from './commands/init'
import * as migrate from './commands/migrate'
import * as seed from './commands/seed'
import * as status from './commands/status'
import { environment } from './core/middleware'
import { getYArgs } from './core/yargs'

const yargs = getYArgs()

// tslint:disable-next-line: no-unused-expression
yargs
  .help()
  .version()
  .command('init', 'Initializes project', init)
  .command('status', 'List the status of all migrations', status)
  .command('create', 'Create migration file', create)
  .command('create:seed', 'Create seeder file', create)
  .command('migrate', 'Run pending migrations', migrate)
  .command('migrate:undo', 'Revert all migrations ran', migrate)
  .command('seed', 'Run every seeder', seed)
  .command('seed:undo', 'Deletes data from the database', seed)
  .wrap(yargs.terminalWidth())
  .demandCommand(1, 'Please specify a command')
  .help()
  .strict()
  .recommendCommands()
  .middleware([environment]).argv
