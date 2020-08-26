import * as db from 'mongoose'
import { Argv } from 'yargs'
import helper from '../core/helper'
import { MongooseMeta, MongooseMetaSchema } from '../core/migrator'
import { baseOptions } from '../core/yargs'

const SEPARATOR = '\n * '

export function builder(yargs: Argv): Promise<Argv> {
  // @ts-ignore
  return baseOptions(yargs).argv
}

export function handler(argv: any): void {
  const configs = helper.getConfigs(argv)
  helper.infoLogger(`Using environment "${process.env.NODE_ENV}"`)

  if (helper.isEmpty(configs.config)) {
    helper.errorLogger(
      'No config file exists. Please run "mongoose-cli init" to initializes project'
    )
    process.exit(1)
  }

  const mongoose = db.createConnection(
    configs.config.url,
    configs.config.options
  )

  mongoose.on('error', err => {
    helper.errorLogger(err.message)
    process.exit(1)
  })

  mongoose.on('connected', async () => {
    const model = mongoose.model<MongooseMeta>(
      'MongooseMeta',
      MongooseMetaSchema
    )
    const migrated = await model.find()

    if (helper.isEmpty(migrated)) {
      helper.infoLogger('No migration records exists')
    } else {
      helper.infoLogger(
        `Migrated records:${SEPARATOR}${migrated
          .map(m => m.name)
          .join(SEPARATOR)}`
      )
    }

    process.exit(0)
  })
}
