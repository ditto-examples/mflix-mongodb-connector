const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  snapshotSerializers: ['<rootDir>/test/radixIdSnapshotSerializer.js'],
  roots: ['src'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/__mocks__/fileMock.js',
    '\\.css$': 'identity-obj-proxy',
    '^__mocks__(/?.*)$': '<rootDir>/src/__mocks__/$1',
  },
  transformIgnorePatterns: ['/node_modules/(?!(uuid)/)'],
}

export default config
