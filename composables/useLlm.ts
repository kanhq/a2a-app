import OpenAI from "openai";
import type { LlmGateway } from "./useSysConfig"





class LlmService {


  async initialize() {
  }


  async* generateCode(prompt: string, sysPrompt: string, gateway: LlmGateway) {
    const client = new OpenAI({
      apiKey: gateway.token,
      baseURL: gateway.url,
      dangerouslyAllowBrowser: true,
      fetch: async (url, options): Promise<Response> => {
        // remove openai fetch headers
        if (options) {
          options.headers = {
            "Content-Type": "application/json",
            'x-portkey-provider': gateway.model?.provider || '',
            'Authorization': `Bearer ${gateway.token}`
          }
        }
        return fetch(url, options)
      }
    });

    let t1 = Date.now()
    const stream = await client.chat.completions.create({
      model: gateway.model?.model || '',
      messages: [
        { role: 'system', content: sysPrompt },
        { role: 'user', content: prompt }
      ],
      stream: true,
      stream_options: {
        include_usage: true
      },
    });
    const prefix = `// Written by Provider: ${gateway.model?.provider || ''} Model: ${gateway.model?.model || ''}`
    yield prefix
    let usage: any = null
    for await (const chunk of stream) {
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
    if (usage) {
      const s = `//usage: ${JSON.stringify(usage)}`
      yield s
    }
  }

}


export function useLlm() {
  return useState<LlmService>('llmService', () => { return new LlmService() })
}