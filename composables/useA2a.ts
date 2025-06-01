import type { A2AConfig } from "./useSysConfig";


class A2AServices {

  async initialize() {
  }

  async runJSON(req: any, gateway: A2AConfig): Promise<any> {
    const headers: any = {
      'Content-Type': 'application/json',
    }
    if (gateway.token) {
      headers['Authorization'] = `Bearer ${gateway.token}`
    }
    const url = `${gateway.url}/run/json`
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(req)
    })
    return await res.json()
  }

  async admin(req: any, gateway: A2AConfig): Promise<any> {
    const headers: any = {
      'Content-Type': 'application/json',
    }
    if (gateway.token) {
      headers['Authorization'] = `Bearer ${gateway.token}`
    }
    const url = `${gateway.url}/admin`
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(req)
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Error: ${res.status} ${res.statusText} - ${text}`)
    }
    const data = await res.json()
    if (data.error) {
      throw new Error(`Error: ${data.error}`)
    }
    return data
  }

  async* writeCode(req: any, gateway: A2AConfig) {
    const headers: any = {
      'Content-Type': 'application/json',
    }
    if (gateway.token) {
      headers['Authorization'] = `Bearer ${gateway.token}`
    }
    const url = `${gateway.url}/code`
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(req)
    })
    const prefix = `// Written by Provider: ${req.provider || ''} Model: ${req.model || ''}`
    yield prefix

    let t1 = Date.now()
    let usage: any = null
    const reader = res.body?.getReader()
    if (reader) {
      let decoder = new TextDecoder()
      let buffer: Uint8Array = new Uint8Array()
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }
        if (value) {
          const lastLF = value.lastIndexOf(0x0A)
          buffer = Uint8Array.from([...buffer, ...value.subarray(0, lastLF + 1)])
          const lines = decoder.decode(buffer, { stream: true }).split('\n')
          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i]
            if (!line.startsWith('data:')) {
              continue
            }
            const data = line.substring(5).trim()
            if (data === '[DONE]') {
              break
            }
            let chunk = JSON.parse(data)
            if (chunk.choices && chunk.choices.length > 0) {
              const s = chunk.choices[0].delta?.content
              if (s) {
                yield s
              }
            }
            if (chunk.usage) {
              usage = chunk.usage
              usage.time_used = ((Date.now() - t1) / 1000).toFixed(2)
            }
          }
          buffer = value.subarray(lastLF + 1)
        }
      }
    }
    if (usage) {
      const s = `//usage: ${JSON.stringify(usage)}`
      yield s
    }
  }
}

export function useA2a() {
  return useState<A2AServices>('a2aService', () => { return new A2AServices() })
}