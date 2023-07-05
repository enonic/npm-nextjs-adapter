export const getShortcutQuery = `
  query($path:ID!){
    guillotine {
      get(key:$path) {
        ... on base_Shortcut {
          data {
            target {
              pageUrl(type: absolute)
            }
          }
        }
      }
    }
  }`;
