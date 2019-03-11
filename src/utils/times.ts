// Lodash's times replacement.
// Example usage: times(3).map(x => `hi`) -> ['hi', 'hi', 'hi']
export const times = (n: number) => Array.from({ length: n }, (_, x) => x);
