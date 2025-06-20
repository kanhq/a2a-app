

export type LlmModel = {
  provider: string
  model: string
}

export type LlmGateway = {
  url: string
  token: string
  model?: LlmModel
}

export type A2AConfig = {
  url: string
  token: string
  model?: LlmModel
}

export type ProjectConfig = {
  lastProjectName: string
}

export type SysConfig = {
  //llm: LlmGateway
  a2a: A2AConfig
  project: ProjectConfig
  locale?: string
}

export type A2APoject = {
  name: string
  prompt: string
  source: string
  params: any
}

export const UNTITLED_PROJECT = '/projects/untitled.json'

class SysConfigService {

  private sysConfig: SysConfig

  constructor() {
    this.sysConfig = {
      // llm: {
      //   url: '',
      //   token: ''
      // },
      a2a: {
        url: '',
        token: ''
      },
      project: {
        lastProjectName: UNTITLED_PROJECT
      }
    }
  }

  async initialize() {
    this.loadSysConfig()
  }

  // set llm(conf: LlmGateway) {
  //   this.sysConfig.llm = conf
  //   this.saveSysConfig()
  // }
  // get llm() {
  //   return this.sysConfig.llm
  // }

  set a2a(conf: A2AConfig) {
    this.sysConfig.a2a = conf
    this.saveSysConfig()
  }

  get a2a() {
    return this.sysConfig.a2a
  }

  set project(conf: ProjectConfig) {
    this.sysConfig.project = conf
    this.saveSysConfig()
  }

  get project() {
    return this.sysConfig.project
  }

  get locale(): string {
    const l = (this.sysConfig.locale || navigator.language || 'en').toLowerCase()
    if (l.startsWith('en')) {
      return 'en'
    }
    return l
  }


  loadSysConfig() {
    const sysConfig = localStorage.getItem('sysConfig')
    if (sysConfig) {
      this.sysConfig = JSON.parse(sysConfig)
      this.sysConfig.project ??= { lastProjectName: UNTITLED_PROJECT }
    }
    console.log('loaded sysConfig', this.sysConfig)
  }

  saveSysConfig() {
    console.debug('saving sysConfig', this.sysConfig)
    localStorage.setItem('sysConfig', JSON.stringify(this.sysConfig))
  }
}

export function useSysConfig() {
  return useState<SysConfigService>('sysConfig', () => { return new SysConfigService() })
}

