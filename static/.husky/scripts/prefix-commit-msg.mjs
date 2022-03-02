#!/bin/sh node

import { $ } from 'zx'

$.verbose = false

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

  /**
   * Format scopes:
   *  1. [<branch>:root] if only root has been affected
   *  2. [<branch>:*] if all packages have been affected
   *  3. [<branch>:<a>,<b>,+<n>] if > 2 packages have been affected
   *  4. [<branch>:<a>,<b>] otherwise
   */
  const formattedScopes =
    (scopes.length === 1 && scopes[0] === 'root' && 'root') ||
    ((shallowEqualUnsortedArrays(scopes, allPackages) ||
      shallowEqualUnsortedArrays(scopes, ['root', ...allPackages])) &&
      '*') ||
    (scopes.length > 2 &&
      [...scopes.slice(0, 2), `+${scopes.length - 2}`].join(',')) ||
    scopes.join(',')

  const prefix = `[${BRANCH_NAME}:${formattedScopes}]`

  // Replace commit message with prefixed one
  const replace = `1s~^~${prefix} ~`
  await $`sed -i.bak -e ${replace} ${COMMIT_EDITMSG_PATH}`
}
