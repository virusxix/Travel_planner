/** The whole app uses the immersive "HiddenStay night" theme.
 * Kept as a helper so chrome (navbar/footer/nav) can branch on it and so a
 * route could be opted back to light later if ever needed. */
export function isNightRoute(_pathname: string): boolean {
  return true;
}
