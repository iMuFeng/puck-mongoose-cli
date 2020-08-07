export function environment(argv: any): void {
  const env = String(argv.env).toLowerCase()

  switch (env) {
    case 'prod':
      process.env.NODE_ENV = 'production'
      process.env.MONGOOSE_CLI_ENV = env
      break

    case 'unittest':
      process.env.NODE_ENV = 'test'
      process.env.MONGOOSE_CLI_ENV = env
      break

    default:
      process.env.NODE_ENV = 'development'
      process.env.MONGOOSE_CLI_ENV = 'local'
      break
  }
}
