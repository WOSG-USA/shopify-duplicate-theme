import {debug} from '@actions/core'
import {rmRF} from '@actions/io'
import {ExecException, exec as nativeExec} from 'child_process'

export async function execShellCommand(cmd: string): Promise<string | Buffer> {
  return new Promise((resolve, reject) => {
    nativeExec(
      cmd,
      (error: ExecException | null, stdout: string, stderr: string) => {
        if (error) {
          return reject(error)
        }
        resolve(stdout ? stdout : stderr)
      }
    )
  })
}

export const cleanRemoteFiles = async (folder: string): Promise<void> => {
  try {
    rmRF(folder)
  } catch (error) {
    if (error instanceof Error) debug(error.message)
  }
}

export const pullLiveTheme = async (
  store: string,
  folder: string
): Promise<void> => {
  await execShellCommand(
    `shopify theme pull --live --path ${folder} --store ${store}`
  )
}

export const pushUnpublishedTheme = async (
  store: string,
  folder: string,
  name: string
): Promise<void> => {
  await execShellCommand(
    `shopify theme push --unpublished --path ${folder} --store ${store} --theme ${name} --unpublished`
  )
}

// Patterh for name: [{env}] Latest Snapshot {date is in format MM.DD.YY}
export const generateThemeNameForEnv = (env: string): string => {
  const date = new Date()
  return `[${env}] Latest Snapshot ${date
    .toLocaleDateString('en-US')
    .replace(/\//g, '.')}`
}