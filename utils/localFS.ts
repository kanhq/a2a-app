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


export async function saveFile(name: string, content: any) {
  await db.files.put({
    name,
    date: Date.now(),
    content
  });
}

export async function loadFile(name: string) {
  return await db.files.get(name);
}

export async function loadFileContent(name: string) {
  const file = await db.files.get(name);
  return file?.content;
}

export async function deleteFile(name: string) {
  await db.files.delete(name);
}

export async function listFiles(prefix: string): Promise<string[]> {
  return await db.files
    .where('name')
    .startsWithAnyOfIgnoreCase(prefix)
    .primaryKeys()
}