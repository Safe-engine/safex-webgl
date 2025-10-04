# Gemini Instruction: TypeScript Code Standardization

## Goal
Normalize and refactor all TypeScript files to follow modern ES module syntax and best practices.

## Rules
1. Use `export class`, `export function`, or `export const` instead of `module.exports` or `exports`.
2. Replace all `require()` statements with `import` syntax.
3. Add explicit type annotations (`: string`, `: number`, `: void`, etc.) wherever possible.
4. Use ES6+ features such as arrow functions, template literals, and shorthand object syntax when appropriate.
5. Preserve the original logic and comments.
6. Format the code according to common Prettier conventions:
   - 2-space indentation  
   - Semicolons at the end of statements  
   - Single quotes for strings  
   - Space after commas and around operators  
7. Remove unused imports or variables.
8. Ensure consistent class and method naming (PascalCase for classes, camelCase for functions).
9. cc.p convert to Vec2
10. use let const instead of var