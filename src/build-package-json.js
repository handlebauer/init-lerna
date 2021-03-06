export const buildPackageJson = ({ user, repo }) => ({
  name: 'root',
  private: true,
  workspaces: ['packages/*'],
  version: '0.0.0',
  author: 'Donald Geddes',
  licence: 'MIT',
  repository: `https://github.com/${user}/${repo}.git`,
  scripts: {
    test: 'lerna run test',
    build: 'lerna run build',
    version: 'lerna version',
    publish: 'lerna publish',
  },
})
