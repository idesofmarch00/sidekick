// reactotron.config.ts (or wherever you configure Reactotron)

// 1) Import the necessary items
import Reactotron from 'reactotron-react-native';
import mmkvPlugin from 'reactotron-react-native-mmkv';

// 2) Import your MMKV instance (make sure it's exported from '@/localStorage')
import {storage} from '@/storage';

// 3) Configure Reactotron
Reactotron.configure({
  name: 'SideKick',
})
  .useReactNative({
    networking: {
      // optionally, you can turn it off with false.
      ignoreUrls: /symbolicate/,
    },
    editor: false, // there are more options to editor
    errors: true, // or turn it off with false
    overlay: false, // just turning off overlay
    log: true, // or turn it off with false
  })
  .use(mmkvPlugin({storage}))
  .connect(); // connect to the Reactotron app

// Optional: export Reactotron if you need to use it in other files
export default Reactotron;
