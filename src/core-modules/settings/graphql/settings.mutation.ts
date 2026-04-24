export const UPDATE_SETTINGS_BULK = `
  mutation UpdateSettingsBulk($settings: AWSJSON!) {
    updateSettingsBulk(settings: $settings) {
      success
      message
    }
  }
`

export const UPDATE_SETTING = `
  mutation UpdateSetting($key: String!, $value: String!) {
    updateSetting(key: $key, value: $value) {
      success
      message
    }
  }
`
