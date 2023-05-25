export interface Plugin {
  name: string;
  description: string;
  modelDescription: string;
  call: (input: string) => Promise<string> | string;
}

export class Plugins extends Set<Plugin> {}
