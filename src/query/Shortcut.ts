export const getShortcutQuery = `
  query($path:ID!, $repo: String, $siteKey: String, $branch: String){
    guillotine(siteKey: $siteKey, repo: $repo, branch: $branch) {
      get(key:$path) {
        ... on base_Shortcut {
          data {
            target {
              pageUrl
            }
          }
        }
      }
    }
  }`;
