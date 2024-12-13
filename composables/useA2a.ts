import type { A2AConfig } from "./useSysConfig";


class A2AServices {

  async initialize() {
  }

  async runJSON(req: any, gateway: A2AConfig) : Promise<any> {
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
}

export function useA2a() {
  return useState<A2AServices>('a2aService', () => { return new A2AServices() })
}