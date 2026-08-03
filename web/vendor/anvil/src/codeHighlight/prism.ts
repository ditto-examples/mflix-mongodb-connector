import Prism from 'prismjs'

// Prism language modules expect this global to exist when they are evaluated.
// Keeping the assignment in a dependency module guarantees it runs before the
// language side-effect imports in CodeHighlight.
globalThis.Prism = Prism

export default Prism
