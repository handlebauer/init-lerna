#!/usr/bin/env node

import { createRequire } from 'module'

import { $, cd, fs, path } from 'zx'
import Enquirer from 'enquirer'
import clipboard from 'clipboardy'

import {
  packageJsonSnippet,
  buildPackageJson,
  getPwd,
} from '@hbauer/init-lerna/src/index.js'

// Show zx output?
$.verbose = true

// Catch uncaughts
process.once('uncaughtException', () => {
  console.log(`
      Aborting..
  `)
})

const { Snippet } = Enquirer

// Prompt
const { values: fields } = await new Snippet(packageJsonSnippet).run()

const { repo } = fields

// Build package.json
const packageJson = buildPackageJson(fields)

// Create new project directory
await $`mkdir ${repo}`
await cd(repo)

// Initialize git
await $`git init`

// Create empty packages directory
await $`mkdir packages`

// Write package.json file
const pwd = await getPwd()
const pathTo = to => path.join(pwd, to)
fs.writeFileSync(pathTo('package.json'), JSON.stringify(packageJson, null, 2))

// Copy over static files
const packageRoot = createRequire(import.meta.url)
  .resolve('@hbauer/init-lerna')
  .split('/')
  .slice(0, -1)
  .join('/')
await $`cp -r ${packageRoot}/static/. .`
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
