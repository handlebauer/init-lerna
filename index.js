#!/usr/bin/env node

import { createRequire } from 'module'

import { $, cd } from 'zx'
import Enquirer from 'enquirer'
import clipboard from 'clipboardy'

// Show zx output?
$.verbose = true

// Catch uncaughts
process.once('uncaughtException', () => {
  console.log(`
      Aborting..
  `)
})

const enquirer = new Enquirer()

// Prompt
const { repo } = await enquirer.prompt({
  type: 'input',
  name: 'repo',
  message: 'Monorepo name:',
  required: true,
})

// Create new project directory
await $`mkdir ${repo}`
await cd(repo)

// Initialize git
await $`git init`

// Create empty packages directory
await $`mkdir packages`

// Copy over template
const packageRoot = createRequire(import.meta.url)
  .resolve('@hbauer/init-lerna')
  .split('/')
  .slice(0, -1)
  .join('/')
await $`cp -r ${packageRoot}/template/. .`
await $`mv default.gitignore .gitignore`

// Install dev deps
const dependencies = [
  'lerna',
  'zx',
  'shx',
  'rollup',
  'ava',
  'typescript',
  'prettier',
  '@hbauer/prettier-config',
  'eslint',
  'eslint-plugin-import',
  '@hbauer/eslint-config',
  'husky',
]
await $`yarn add -D ${dependencies}`

// First commit
await $`git add . && git commit -m "[main:root] Init"`

// Set up husky
await $`npx husky install`
await $`npm set-script prepare "husky install"`
await $`chmod +x .husky/pre-commit`
await $`chmod +x .husky/prepare-commit-msg`
await $`git add . && git commit -m "Configure husky"`

// Copy new package path to clipboard
clipboard.writeSync(`cd ${repo}`)

// Open up editor
await $`code .`
