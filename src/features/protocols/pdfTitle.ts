// ==================================================
// BENCHFLOW — READABLE TAB TITLE FOR THE OPENED PDF
// ==================================================
//
// A PDF opened from IndexedDB lives at a `blob:` address whose last
// part is a random UUID, and the browser names the tab after it.
// Writing a title inside the PDF does not help (Edge ignores it for
// blob addresses), so on a computer we open a small page that WE
// title and that shows the PDF with the browser's own viewer.

import { formatSessionName } from "../sessions/sessionLabel";

/**
 * Name shown in the browser tab:
 * "20261111-1429 · Protocol title" when the date of import is known,
 * the plain title otherwise (e.g. a demo protocol with an attached PDF).
 */
export function pdfDisplayName(
  title: string,
  importedAt?: number
): string {
  return importedAt === undefined
    ? title
    : formatSessionName(importedAt, title);
}

/**
 * True on phones and tablets, where browsers cannot show a PDF
 * inside a page. The browser's own "mobile" flag is used when it
 * exists; the device name covers the others. (Not the pointer type:
 * a touch-screen laptop is still a computer.)
 */
function isPhoneOrTablet(): boolean {
  const nav = navigator as Navigator & {
    userAgentData?: { mobile?: boolean };
  };

  return (
    nav.userAgentData?.mobile === true ||
    /Android|iPhone|iPad|iPod/i.test(nav.userAgent) ||
    // iPadOS announces itself as a Mac, but has a touch screen.
    (nav.platform === "MacIntel" && nav.maxTouchPoints > 1)
  );
}

/**
 * Open the PDF in a new tab named `title`.
 * Returns false when this is not possible (phone or tablet;
 * popup blocked), so the caller can open the PDF directly instead.
 */
export function openPdfInTitledTab(
  pdfUrl: string,
  title: string
): boolean {
  if (isPhoneOrTablet()) return false;

  const tab = window.open("", "_blank");

  if (!tab) return false;

  tab.document.title = title;
  tab.document.body.style.margin = "0";

  const viewer = tab.document.createElement("embed");

  viewer.type = "application/pdf";
  viewer.src = pdfUrl;
  viewer.style.cssText =
    "display:block;width:100vw;height:100vh;border:0";

  tab.document.body.append(viewer);

  return true;
}