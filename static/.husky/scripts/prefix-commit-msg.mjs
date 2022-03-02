#!/bin/sh node

import { $, cd } from 'zx'

const shallowEqualUnsortedArrays = (a, b) => {
  if (a.length !== b.length) return false
  const c = new Set(a)
  return b.every(x => c.has(x) && c.delete(x))
}

const COMMIT_EDITMSG_PATH = process.argv[2]
const BRANCH_NAME = (await $`git rev-parse --abbrev-ref HEAD`).stdout.trim()

const scopes = [
  ...new Set(
    (await $`git diff --name-only --cached`).stdout
      .split('\n')
      .filter(Boolean)
      .map(
        path => (
          (path = path.split('/')), path[0] !== 'packages' ? 'root' : path[1]
        )
      )
  ),
]

if (BRANCH_NAME !== 'HEAD') {
  const allPackages = (await $`ls packages`).stdout.split('\n').filter(Boolean)

  const formattedScopes =
    (scopes.length === 1 && scopes[0] === 'root' && 'root') ||
    (shallowEqualUnsortedArrays(scopes, allPackages) && '*') ||
    (scopes.length > 2 &&
      [...scopes.slice(0, 2), `+${scopes.length - 2}`].join(',')) ||
    scopes.join(',')

  const prefix = `[${BRANCH_NAME}:${formattedScopes}]`

  // Replace commit message with prefixed one
  const replace = `1s~^~${prefix} ~`
  await $`sed -i.bak -e ${replace} ${COMMIT_EDITMSG_PATH}`
}
