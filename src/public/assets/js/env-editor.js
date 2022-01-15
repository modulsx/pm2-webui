import { CodeJar } from '/assets/js/vendors/codejar.js'

const highlight = (editor) => {
  const code = editor.textContent
  editor.innerHTML = Prism.highlight(code, Prism.languages.bash, 'bash');
}

document.EnvEditor = CodeJar(document.querySelector('#service-environment-editor'), highlight)