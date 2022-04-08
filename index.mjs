#!/usr/bin/env node
import path from 'path'
import chalk from 'chalk'
import { getStagedFiles } from './getStagedFiles.mjs'


const stagedFiles = await getStagedFiles()

const pathToEslintConfig = path.join(process.cwd(), '.eslintrc.js')

const config = await import(pathToEslintConfig)

const targetFiles = []

config?.default?.overrides?.forEach((override) => {
  override?.files.forEach((file) => {
    const isTarget = stagedFiles.some((f) => f.includes(file) || file.includes(f))

    if (isTarget) {
      targetFiles.push(file)
    }
  })
})


if(targetFiles.length) {
  console.log(chalk.red(`======================\nYou must to remove from .eslintrc.js files:\n${targetFiles.join('\n')}\n======================`))
  process.exit(1);
}
