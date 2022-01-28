import { CodeJar } from '/assets/js/vendors/codejar.js'

const highlight = (editor) => {
  const code = editor.textContent
  editor.innerHTML = Prism.highlight(code, Prism.languages.json, 'json');
}

document.DeploymentsConfigEditor = CodeJar(document.querySelector('#deployments-config-editor'), highlight)