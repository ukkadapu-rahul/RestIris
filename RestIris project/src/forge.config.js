const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: path.resolve(__dirname, './assets/icon'),
    name: '20-20-20 Eye Timer',
    executableName: 'eye-strain-timer',
    appBundleId: 'com.example.eyestraintimer',
    appCategoryType: 'public.app-category.healthcare-fitness',
    win32metadata: {
      CompanyName: 'RestIris',
      ProductName: '20-20-20 Eye Strain Timer'
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'eye_strain_timer',
        setupIcon: path.resolve(__dirname, './assets/icon.ico'),
        authors: 'RestIris Team',
        loadingGif: './assets/loading.gif'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
      config: {
        icon: path.resolve(__dirname, './assets/icon.png') // Added for macOS
      }
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: path.resolve(__dirname, './assets/icon.png'),
          maintainer: 'RestIris Team',
          homepage: 'https://github.com/yourusername/rest-iris',
          categories: ['Utility']
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          icon: path.resolve(__dirname, './assets/icon.png')
        }
      },
    },
  ],
};