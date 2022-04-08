import { execa } from 'execa'
import path from 'path'

import normalize from 'normalize-path'
import { exit } from 'process'

/**
 * Explicitly never recurse commands into submodules, overriding local/global configuration.
 * @see https://git-scm.com/docs/git-config#Documentation/git-config.txt-submodulerecurse
 */
const NO_SUBMODULE_RECURSE = ['-c', 'submodule.recurse=false']

// exported for tests
const GIT_GLOBAL_OPTIONS = [...NO_SUBMODULE_RECURSE]

const execGit = async (cmd, options = {}) => {
  try {
    const { stdout } = await execa('git', GIT_GLOBAL_OPTIONS.concat(cmd), {
      ...options,
      all: true,
      cwd: options.cwd || process.cwd(),
    })
    return stdout
  } catch ({ all }) {
    throw new Error(all)
  }
}

const parseGitZOutput = (input) =>
  input
    .replace(/\u0000$/, '') // eslint-disable-line no-control-regex
    .split('\u0000')

export const getStagedFiles = async ({ cwd = process.cwd() } = {}) => {
  try {
    // Docs for --diff-filter option: https://git-scm.com/docs/git-diff#Documentation/git-diff.txt---diff-filterACDMRTUXB82308203
    // Docs for -z option: https://git-scm.com/docs/git-diff#Documentation/git-diff.txt--z
    const lines = await execGit(
      ['diff', '--staged', '--diff-filter=ACMR', '--name-only', '-z'],
      {
        cwd,
      }
    )

    if (!lines) return []

    return parseGitZOutput(lines).map((file) =>
      normalize(path.resolve(cwd, file))
    )
  } catch {
    return null
  }
}
