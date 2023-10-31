import {queryGuillotineWithPath} from '../guillotine/getMetaData';

export const getShortcutQuery = queryGuillotineWithPath(`get(key:$path) {
    ... on base_Shortcut {
      data {
        target {
          pageUrl
        }
      }
    }
  }`);
