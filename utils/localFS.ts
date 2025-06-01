import Dexie, { type EntityTable } from 'dexie';


type LocalFile = {
  name: string;
  date: number;
  content: any;
}


const db = new Dexie('localFile') as Dexie & {
  files: EntityTable<
    LocalFile,
    'name'
  >;
};

db.version(1).stores({
  files: '&name, date'
});

function isUseRemoteFS() {
  const config = useRuntimeConfig()
  return config.public.remoteFS === true;
}

type WorkspaceFile = {
  path: string;
  content?: string;
}

type ReadOperation = {
  kind: 'read';
  payload: WorkspaceFile;
}
type WriteOperation = {
  kind: 'write';
  payload: WorkspaceFile;
}
type ListOperation = {
  kind: 'list';
  payload: string
}
type DeleteOperation = {
  kind: 'delete';
  payload: WorkspaceFile;
}

type WorkspaceRequest = {
  kind: 'workspace'
  data: ReadOperation | WriteOperation | ListOperation | DeleteOperation;
}

type FileResponse = {
  kind: 'file';
  payload: WorkspaceFile;
}
type FileListResponse = {
  kind: 'list';
  payload: WorkspaceFile[];
}
type WorkspaceResponse = FileResponse | FileListResponse;


class RemoteFS {
  constructor() {
  }

  async saveFile(path: string, content: any): Promise<void> {
    this.sendRequest({
      kind: 'workspace',
      data: {
        kind: 'write',
        payload: { path, content: JSON.stringify(content) }
      }
    });
  }

  async loadFile(path: string): Promise<LocalFile | undefined> {
    const response = await this.sendRequest({
      kind: 'workspace',
      data: {
        kind: 'read',
        payload: { path }
      }
    });
    if (response.kind === 'file') {
      return {
        name: response.payload.path,
        date: Date.now(),
        content: JSON.parse(response.payload.content ?? '{}')
      };
    } else {
      return undefined;
    }
  }

  async deleteFile(path: string): Promise<void> {
    await this.sendRequest({
      kind: 'workspace',
      data: {
        kind: 'delete',
        payload: { path }
      }
    });
  }

  async listFiles(path: string): Promise<string[]> {
    const response = await this.sendRequest({
      kind: 'workspace',
      data: {
        kind: 'list',
        payload: path.startsWith('/') ? path.slice(1) : path
      }
    });
    if (response.kind === 'list') {
      return response.payload.map(file => file.path);
    } else {
      return [];
    }
  }

  private async sendRequest(req: WorkspaceRequest): Promise<WorkspaceResponse> {
    const config = useSysConfig();
    const a2aService = useA2a();
    return await a2aService.value.admin(req, config.value.a2a);
  }
}

export async function saveFile(name: string, content: any) {
  if (isUseRemoteFS()) {
    const remoteFS = new RemoteFS();
    await remoteFS.saveFile(name, content);
    return;
  } else {
    await db.files.put({
      name,
      date: Date.now(),
      content
    });
  }
}

export async function loadFile(name: string) {
  if (isUseRemoteFS()) {
    const remoteFS = new RemoteFS();
    return await remoteFS.loadFile(name);
  } else {
    return await db.files.get(name);
  }
}

export async function loadFileContent(name: string) {
  if (isUseRemoteFS()) {
    const remoteFS = new RemoteFS();
    const file = await remoteFS.loadFile(name);
    return file?.content;
  } else {
    const file = await db.files.get(name);
    return file?.content;
  }
}

export async function deleteFile(name: string) {
  if (isUseRemoteFS()) {
    const remoteFS = new RemoteFS();
    await remoteFS.deleteFile(name);
    return;
  } else {
    await db.files.delete(name);
  }

}

export async function listFiles(prefix: string): Promise<string[]> {
  if (isUseRemoteFS()) {
    const remoteFS = new RemoteFS();
    return await remoteFS.listFiles(prefix);
  } else {
    return await db.files
      .where('name')
      .startsWithAnyOfIgnoreCase(prefix)
      .primaryKeys()
  }
}