/**
 * Cleans the user input by splitting and lowercasing.
 * @param input the user input to clean
 * @returns An array of strings split on whitespace and converted to lowercase
 */
export function cleanInput(input: string): string[] {
  return input.trim().toLowerCase().split(/\s+/);
}