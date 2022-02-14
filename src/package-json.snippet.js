export const packageJsonSnippet = {
  name: 'package',
  message: 'package.json',
  required: true,
  template: `
  {
    name: 'root',
    private: true,
    version: '0.0.0',
    author: 'Donald Geddes',
    licence: 'MIT',
    repository: 'https://github.com/{{user}}/{{repo}}.git",
    scripts: {
      test: 'lerna run test',
      build: 'lerna run build',
      version: 'lerna run version',
    },
  }
`,
}
