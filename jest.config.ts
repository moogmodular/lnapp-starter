import { compilerOptions } from './tsconfig.json'
import type { Config } from '@jest/types'

function makeModuleNameMapperFromTsConfig(srcPath: string) {
    // Get paths from tsconfig
    const { paths }: { paths: Record<string, string[]> } = compilerOptions

    const aliases: { [key: string]: string } = {}

    // Iterate over paths and convert them into moduleNameMapper format
    Object.keys(paths).forEach((item) => {
        const key = item.replace('/*', '/(.*)')
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const path = paths[item]![0]!.replace('/*', '/$1')
        aliases[key] = srcPath + '/' + path
    })
    return aliases
}

const config: Config.InitialOptions = {
    setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
    verbose: true,
    roots: ['<rootDir>'],
    testMatch: ['**/tests/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
    testPathIgnorePatterns: ['<rootDir>/.next', '<rootDir>/playwright/'],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
    },
    transformIgnorePatterns: ['/node_modules/', '^.+\\.module\\.(css|sass|scss)$'],
    testEnvironment: 'jsdom',
    moduleNameMapper: makeModuleNameMapperFromTsConfig('<rootDir>'),
}

export default config
