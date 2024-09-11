import 'expo-router/entry';
import { polyfill as polyfillEncoding } from 'react-native-polyfill-globals/src/encoding';
import { polyfill as polyfillFetch } from 'react-native-polyfill-globals/src/fetch';
import { polyfill as polyfillReadableStream } from 'react-native-polyfill-globals/src/readable-stream';

polyfillFetch();
polyfillEncoding();
polyfillReadableStream();