#!/usr/bin/env zx

import { $, fs, path, cd } from 'zx'

$.verbose = false

import Enquirer from 'enquirer'
import copy from 'clipboardy'

import '@hbauer/init-lerna/src/process-error.js'

import { defaultModules } from '@hbauer/init-lerna/src/default-modules.js'
import { defaultGitignore } from '@hbauer/init-lerna/src/default-gitignore.js'
import { defaultPackageJson } from './src/default-package-json.js'
import { defaultLernaJson } from './src/default-lerna-json.js'
import { getPwd } from '@hbauer/init-lerna/src/utils/get-pwd.js'

const enquirer = new Enquirer()

const { repo } = await enquirer.prompt({
  type: 'input',
  name: 'repo',
  message: 'Monorepo name:',
  required: true,
})

// Create new project directory
await $`mkdir ${repo}`
await cd(repo)

// Create packages directory
await $`mkdir packages`

// Initialize git
await $`git init`

// Write default files
const pwd = await getPwd()
const pathTo = to => path.join(pwd, to)

const packageJson = JSON.stringify(defaultPackageJson, null, 2)
fs.writeFileSync(pathTo('package.json'), packageJson)
fs.writeFileSync(pathTo('lerna.json'), defaultLernaJson)
fs.writeFileSync(pathTo('.gitignore'), defaultGitignore)

// Finish up
await $`yarn add -D ${defaultModules}`

copy.writeSync(`cd ${repo}`)

await $`code .`
