
const commonConf: ActionConfig = {
  label: 'label.common_config',
  name: 'common',
  columns: [
    { field: 'name', label: 'label.name', style: "width:9rem" },
    { field: 'value', label: 'label.value', style: "width:9rem" },
  ],
}

const dbConf: ActionConfig = {
  label: 'label.database_config',
  name: 'db',
  columns: [
    { field: 'name', label: 'label.name', style: "width:9rem" },
    { field: 'kind', label: 'label.type', style: "width:9rem", options: [{ label: 'label.pgsql', value: 'pgsql' }, { label: 'label.mysql', value: 'mysql' }, { label: 'label.sqlite', value: 'sqlite' }], onlyOptions: true },
    { field: 'host', label: 'label.host_port', style: "width:9rem" },
    { field: 'db', label: 'label.database', style: "width:9rem" },
    { field: 'user', label: 'label.user', style: "width:9rem" },
    { field: 'password', label: 'label.password', style: "width:9rem", password: true },
  ],
  serialize: (row: any) => {
    let url = ''
    switch (row.kind) {
      case "pgsql":
        url = `${row.kind}://${row.user}:${row.password}@${row.host}/${row.db}?sslmode=disable`
      case "mysql":
        url = `${row.kind}://${row.user}:${row.password}@${row.host}/${row.db}`
      case "sqlite":
        url = `${row.kind}://${row.db}`
      default:
        url = `${row.kind}://${row.user}:${row.password}@${row.host}/${row.db}`
    }
    return {
      name: row.name,
      value: url,
    }
  },
  deserialize: (row: any) => {
    const url = new URL(row.value)
    return {
      name: row.name,
      kind: url.protocol.replace(':', ''),
      host: url.host,
      db: url.pathname.replace('/', ''),
      user: url.username,
      password: url.password,
    }
  }
}

const ossConf: ActionConfig = {
  label: 'label.oss_config',
  name: 'oss',
  columns: [
    { field: 'name', label: 'label.name', style: "width:9rem" },
    {
      field: 'kind', label: 'label.provider', style: "width:9rem",
      options: [
        { label: 'label.oss_aliyun', value: 'oss' },
        { label: 'label.aws_s3', value: 's3' },
      ]
    },
    { field: 'bucket', label: 'label.bucket', style: "width:9rem" },
    { field: 'endpoint', label: 'label.endpoint', style: "width:9rem" },
    { field: 'user', label: 'label.user', style: "width:9rem" },
    { field: 'password', label: 'label.password', style: "width:9rem" },
  ],
  //TODO: serialize/deserialize
  serialize: (row: any, _this?: any) => {
    const func = _this[row.kind]
    if (func) {
      return func(true, row)
    } else {
      return row
    }
  },

  deserialize: (row: any, _this?: any) => {
    const func = _this[row.kind]
    if (func) {
      return func(false, row)
    } else {
      return row
    }
  },

  oss: function (ser: boolean, row: any) {
    if (ser) {
      return {
        endpoint: row.endpoint,
        bucket: row.bucket,
        access_key_id: row.user,
        access_key_secret: row.password,
        name: row.name,
        kind: row.kind,
      }
    } else {
      return {
        endpoint: row.endpoint,
        bucket: row.bucket,
        user: row.access_key_id,
        password: row.access_key_secret,
        name: row.name,
        kind: row.kind,
      }
    }
  },

  s3: function (ser: boolean, row: any) {
    if (ser) {
      return {
        endpoint: row.endpoint,
        bucket: row.bucket,
        access_key_id: row.user,
        access_key_secret: row.password,
        name: row.name,
        kind: row.kind,
      }
    } else {
      return {
        endpoint: row.endpoint,
        bucket: row.bucket,
        user: row.access_key_id,
        password: row.access_key_secret,
        name: row.name,
        kind: row.kind,
      }
    }
  },
}

const mailConf: ActionConfig = {
  label: 'label.mail_config',
  name: 'mail',
  columns: [
    { field: 'name', label: 'label.name', style: "width:9rem" },
    { field: 'imap', label: 'label.imap', style: "width:9rem" },
    { field: 'smtp', label: 'label.smtp', style: "width:9rem" },
    { field: 'address', label: 'label.email', style: "width:9rem" },
    { field: 'password', label: 'label.password', style: "width:9rem", password: true },
  ],
  serialize: (row: any) => {
    const imap = row.imap.split(':')
    const smtp = row.smtp.split(':')
    return {
      "name": row.name,
      "imap": {
        "encryption": "tls",
        "host": imap[0],
        "port": imap.length > 0 ? parseInt(imap[1]) || 993 : 993,
        "login": row.address,
        "passwd": {
          "raw": row.password
        }
      },
      "smtp": {
        "encryption": "tls",
        "host": smtp[0],
        "port": smtp.length > 0 ? parseInt(smtp[1]) || 587 : 587,
        "login": row.address,
        "passwd": {
          "raw": row.password
        }
      }
    }
  },
  deserialize: (row: any) => {
    return {
      name: row.name,
      imap: `${row.imap.host}:${row.imap.port}`,
      smtp: `${row.smtp.host}:${row.smtp.port}`,
      address: row.imap.login,
      password: row.imap.passwd.raw,
    }
  }
}

const llmConf: ActionConfig = {
  label: 'label.llm_config',
  name: 'llm',
  columns: [
    { field: 'name', label: 'label.name', style: "width:9rem" },
    { field: 'url', label: 'label.url', style: "width:9rem" },
    {
      field: 'provider', label: 'label.provider', style: "width:9rem",
      options: [
        { label: 'label.vertex_ai', value: 'vertex-ai' },
        { label: 'label.azure_openai', value: 'azure-openai' },
        { label: 'label.aws_bedrock', value: 'bedrock' },
        { label: 'label.zhipu', value: 'zhipu' },
        { label: 'label.qwen', value: 'qwen' },
        { label: 'label.deepseek', value: 'deepseek' },
      ]
    },
    { field: 'model', label: 'label.model', style: "width:9rem" },
    { field: 'key', label: 'label.password', style: "width:9rem", password: true },
  ],
}

const notifyConf: ActionConfig = {
  label: 'label.notify_config',
  name: 'notify',
  columns: [
    { field: 'name', label: 'label.name', style: "width:9rem" },
    { field: 'value', label: 'label.webhook_url', style: "width:9rem" },
  ],
}

const allConfigSchemas: ActionConfig[] = [
  commonConf,
  dbConf,
  ossConf,
  mailConf,
  llmConf,
  notifyConf,
]

class ConfigService {
  async initialize() {
  }

  get configSchemas() {
    return allConfigSchemas
  }

  async mergeConfigs(): Promise<any> {
    let configs: any = {}
    for (const schema of allConfigSchemas) {
      const fileName = `/config/${schema.name}.json`
      const rows = await loadFileContent(fileName) as any[] || []
      if (schema.name === 'common') {
        for (const row of rows) {
          configs[row.name] = row.value
        }
      } else {
        for (const row of rows) {
          const key = row.name
          delete row.name
          configs[key] = row
        }
      }
    }
    return configs
  }

}

export function useConfig() {
  return useState<ConfigService>('configService', () => { return new ConfigService() })
}