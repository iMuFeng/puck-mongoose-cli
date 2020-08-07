import * as db from 'mongoose'
import helper, { ActionsEnum, Files, TypesEnum } from '../core/helper'

export interface MongooseMeta extends db.Document {
  name: string
}

export const MongooseMetaSchema = new db.Schema(
  {
    name: { type: String, required: true, unique: true }
  },
  {
    collection: 'MongooseMeta'
  }
)

export function migrator(
  argv: any,
  type: TypesEnum,
  action: ActionsEnum
): void {
  const configs = helper.getConfigs(argv)
  helper.infoLogger(`Using environment "${configs.env}"`)

  // Enable transpile typescript file
  if (configs.typescript) {
    require('ts-node').register({
      disableWarnings: true,
      transpileOnly: true
    })
  }

  const mongoose = db.createConnection(
    configs.config.url,
    configs.config.options
  )

  // Enable mongoose debug
  if (configs.debug) {
    db.set('debug', true)
  }

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

    let pending = helper.globbyArgvFiles(argv, type, configs.name)

    if (action === ActionsEnum.migrate) {
      pending = pending.filter((file: any) => {
        return !migrated.find(row => row.name === file.name)
      })
    }

    if (helper.isEmpty(pending)) {
      helper.infoLogger(
        'No migrations were executed, database schema was already up to date'
      )
      process.exit(0)
    }

    switch (type) {
      case TypesEnum.migration:
        directoryExists(configs.migrationsAbsPath)
        break

      case TypesEnum.seed:
        directoryExists(configs.seedersAbsPath)
        break
    }

    switch (action) {
      case ActionsEnum.migrate:
        await migrate(mongoose, model, pending)
        break

      case ActionsEnum.undo:
        await migrate(mongoose, model, pending, true)
        break
    }

    process.exit(0)
  })
}

async function migrate(
  mongoose: db.Connection,
  model: db.Model<MongooseMeta, {}>,
  files: Files[],
  onlyUndo = false
): Promise<void> {
  for (const file of files) {
    const starts = Date.now()
    helper.infoLogger(`${file.name}: migrating`)

    let functions: any

    try {
      functions = require(file.path)

      if (functions.default) {
        functions = functions.default
      }
    } catch (err) {
      helper.errorLogger(err.message)
      process.exit(1)
    }

    if (!functions.up || (onlyUndo && !functions.down)) {
      continue
    }

    try {
      if (onlyUndo) {
        if (functions.down) {
          await functions.down(mongoose)
        }

        await model.deleteOne({
          name: file.name
        })
      } else {
        if (functions.up) {
          await functions.up(mongoose)
        }

        await model.create({
          name: file.name
        })
      }
    } catch (err) {
      if (!onlyUndo) {
        if (functions.down) {
          await functions.down(mongoose)
        }

        await model.deleteOne({
          name: file.name
        })
      }

      helper.errorLogger(err.message)
      process.exit(1)
    }

    helper.successLogger(`${file.name}: migrated (${Date.now() - starts}ms)`)
  }
}

function directoryExists(dir: string) {
  if (!helper.existsSync(dir)) {
    helper.errorLogger(`No such directory: "${dir}"`)
    process.exit(1)
  }
}
