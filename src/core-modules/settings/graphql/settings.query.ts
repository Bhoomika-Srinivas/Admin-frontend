export const LIST_SETTINGS = `
  query ListSettings($category: String) {
    listSettings(category: $category) {
      key
      value
      category
      sensitivity
      updated_by
      updated_at
    }
  }
`
