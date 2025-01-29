import * as core from '@actions/core'
import {mkdirP} from '@actions/io'
import {
  pullLiveTheme,
  cleanRemoteFiles,
  pushUnpublishedTheme,
  pushTargetTheme,
  generateThemeNameForEnv
} from './utils'

const TEMP_FOLDER = 'duplicate'
async function run(): Promise<void> {
  try {
    const store: string = core.getInput('store', {
      required: true,
      trimWhitespace: true
    })

    // Add new optional input for duplicating from Prod to an existing theme
    const targetThemeId: string = core.getInput('theme')

    const env: string = core.getInput('env', {
      required: true,
      trimWhitespace: true
    })

    await mkdirP(TEMP_FOLDER)

    await pullLiveTheme(store, TEMP_FOLDER)
    if (targetThemeId) {
      core.setOutput('themeId', targetThemeId)
      await pushTargetTheme(
        targetThemeId,
        store,
        TEMP_FOLDER
      )
    } else {
      const themeID = await pushUnpublishedTheme(
        store,
        TEMP_FOLDER,
        generateThemeNameForEnv(env)
      )
      core.setOutput('themeId', themeID)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  } finally {
    await cleanRemoteFiles(TEMP_FOLDER)
  }
}

run()
