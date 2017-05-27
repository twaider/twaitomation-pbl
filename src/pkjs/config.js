module.exports = [
  {
    "type": "heading",
    "defaultValue": "TwaitoMation"
  },
  {
    "type": "text",
    "defaultValue": "Configuration"
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Access config"
      }, 
      {
        "type": "input",
        "messageKey": "SERVER",
        "defaultValue": "",
        "label": "Server",
        "attributes": {
          "placeholder": "Server URL",
          "type": "text"
        }
      },
      {
        "type": "input",
        "messageKey": "USERNAME",
        "defaultValue": "",
        "label": "Username",
        "attributes": {
          "placeholder": "your username",
          "type": "text"
        }
      },
      {
        "type": "input",
        "messageKey": "PASS",
        "defaultValue": "",
        "label": "Password",
        "attributes": {
          "placeholder": "your pass",
          "type": "text"
        }
      },
    ]
  },
  {
    "type": "submit",
    "defaultValue": "Save Settings"
  }
];