export const defaultPackageJson = {
  name: 'root',
  private: true,
  scripts: {
    test: 'lerna run test',
    build: 'lerna run build',
    version: 'lerna run version',
  },
}
