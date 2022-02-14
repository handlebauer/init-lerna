import { $ } from 'zx'

const trim = output => output.stdout.trim()
export const getPwd = () => $`pwd`.then(trim)
