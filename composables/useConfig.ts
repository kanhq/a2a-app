
const commonConf: ActionConfig = {
  label: '通用配置',
  name: 'common',
  columns: [
    { field: 'name', label: '名称', style: "width:9rem" },
    { field: 'value', label: '值', style: "width:9rem" },
  ],
}

const dbConf: ActionConfig = {
  label: '数据库配置',
  name: 'db',
  columns: [
    { field: 'name', label: '名称', style: "width:9rem" },
    { field: 'kind', label: '类型', style: "width:9rem", options: [{ label: 'PostgreSQL', value: 'pgsql' }, { label: 'MySQL', value: 'mysql' }, { label: 'SQLite', value: 'sqlite' }], onlyOptions: true },
    { field: 'host', label: '地址:端口', style: "width:9rem" },
    { field: 'db', label: '数据库', style: "width:9rem" },
    { field: 'user', label: '用户名', style: "width:9rem" },
    { field: 'password', label: '密码', style: "width:9rem", password: true },
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
      url: url,
    }
  },
  deserialize: (row: any) => {
    const url = new URL(row.url)
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
  label: '对象存储配置',
  name: 'oss',
  columns: [
    { field: 'name', label: '名称', style: "width:9rem" },
    {
      field: 'kind', label: '服务商', style: "width:9rem",
      options: [
        { label: '阿里云OSS', value: 'oss' },
        { label: 'AWS S3', value: 's3' },
      ]
    },
    { field: 'bucket', label: 'Bucket', style: "width:9rem" },
    { field: 'endpoint', label: '接入点', style: "width:9rem" },
    { field: 'user', label: '用户名', style: "width:9rem" },
    { field: 'password', label: '密码', style: "width:9rem" },
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
  label: '邮件配置',
  name: 'mail',
  columns: [
    { field: 'name', label: '名称', style: "width:9rem" },
    { field: 'imap', label: 'IMAP地址:端口', style: "width:9rem" },
    { field: 'smtp', label: 'SMTP地址:端口', style: "width:9rem" },
    { field: 'address', label: '邮箱', style: "width:9rem" },
    { field: 'password', label: '密码', style: "width:9rem", password: true },
  ],
  serialize: (row: any) => {
    const imap = row.imap.split(':')
    const smtp = row.smtp.split(':')
    return {
      "name": row.name,
      "imap": {
        "encryption": "tls",
        "host": imap[-1],
        "port": imap.length > 0 ? parseInt(imap[1]) || 993 : 993,
        "login": row.address,
        "passwd": {
          "raw": row.password
        }
      },
      "smtp": {
        "encryption": "tls",
        "host": smtp[-1],
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
  label: '大模型配置',
  name: 'llm',
  columns: [
    { field: 'name', label: '名称', style: "width:9rem" },
    { field: 'url', label: 'URL', style: "width:9rem" },
    {
      field: 'provider', label: '服务商', style: "width:9rem",
      options: [
        { label: 'Google VertexAI', value: 'vertex-ai' },
        { label: 'Microsoft Azure OpenAI', value: 'azure-openai' },
        { label: 'AWS Bedrock', value: 'bedrock' },
        { label: '智谱清言', value: 'zhipu' },
        { label: '通义千问', value: 'qwen' },
      ]
    },
    { field: 'model', label: '模型', style: "width:9rem" },
    { field: 'key', label: '密钥', style: "width:9rem", password: true },
  ],
}

const notifyConf: ActionConfig = {
  label: '通知配置',
  name: 'notify',
  columns: [
    { field: 'name', label: '名称', style: "width:9rem" },
    { field: 'url', label: 'WebHook URL', style: "width:9rem" },
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