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

    const stream = await client.chat.completions.create({
      model: gateway.model?.model || '',
      messages: [
        { role: 'system', content: sysPrompt },
        { role: 'user', content: prompt }
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0) {
        const s = chunk.choices[0].delta?.content
        if (s) {
          yield s
        }
      }
    }
  }

}


export function useLlm() {
  return useState<LlmService>('llmService', () => { return new LlmService() })
}