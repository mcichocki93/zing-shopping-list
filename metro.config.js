const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const NATIVE_ONLY_MODULES = [
  'react-native-worklets',
];

const emptyModule = path.resolve(__dirname, 'src/utils/emptyModule.js');

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (NATIVE_ONLY_MODULES.includes(moduleName)) {
    try {
      if (originalResolveRequest) {
        return originalResolveRequest(context, moduleName, platform);
      }
      return context.resolveRequest(context, moduleName, platform);
    } catch {
      return { filePath: emptyModule, type: 'sourceFile' };
    }
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
