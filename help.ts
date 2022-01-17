const { writeFile } = require('fs').promises;

export const getApps = (list, tag) => {
  let apps = [];
  for (const [key, value] of Object.entries(list)) {
    if (
      value &&
      value['tags'] &&
      value['tags'].findIndex((tagValue) => {
        return tag === tagValue;
      }) >= 0
    ) {
      const num = apps.length + 1;
      apps.push({ title: num + ': ' + key, value: key });
    }
  }
  return apps;
};

export const write = async (path, env) => {
  try {
    await writeFile(path, env);
    return true;
  } catch (err) {
    return false;
  }
};

export const writeEnv = async (
  base: string,
  gtwVerso: number,
  gtwPapo: number
) => {
  const baseFile = `export const base = '${base}';
export const verso = '${gtwVerso}/verso';
export const papo = '${gtwPapo}/papo';
export const master = '${process.env.MASTER_KEY}';
export const api = '${process.env.PORT_API_VERSO}';
export const auth = '${process.env.FE_ENV_AUTH}';`;
  const envDirectory = `./env/index.ts`;
  return await write(envDirectory, baseFile);
};
