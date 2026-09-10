import {queryGuillotineWithPath} from '../guillotine/getMetaData';
import {pageUrlQuery} from '../guillotine/urlQueries';

export const getShortcutQuery = queryGuillotineWithPath(`get(key:$path) {
    ... on base_Shortcut {
      data {
        target {
          ${pageUrlQuery()}
        }
        parameters {
          name
          value
        }
      }
    }
  }`);
