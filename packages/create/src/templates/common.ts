export const GITIGNORE = `node_modules/
dist/
out/
`

export const VSCODE_SETTINGS = `{
  "files.associations": {
    "*.slua": "lua"
  },
  "editor.formatOnSave": true,
  "editor.formatOnSaveMode": "file",
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "oxc.oxc-vscode"
  }
}
`

export const VSCODE_EXTENSIONS = `{
  "recommendations": ["oxc.oxc-vscode"]
}
`

export const EDITORCONFIG = `root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
`
