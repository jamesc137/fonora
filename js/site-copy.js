/**
 * Shared site identity and page title strings.
 */

export const SITE_NAME = 'Fonora';

export const SITE_TAGLINE =
  'Open research exploring whether a language designed from first principles can be learned fast enough for practical communication between strangers.';

export const SITE_DESCRIPTION =
  'Fonora is an open-source research project exploring phonetic writing systems, constructed language design, and fast cross-linguistic communication.';

export const SITE_KEYWORDS =
  'fonora, open research, constructed language, conlang, phonetic writing system, language design, cross-linguistic communication, language learning experiment';

export const SITE_OG_URL = 'https://fonora.org/';

export const PLATFORM_HOME_TITLE = 'Fonora | Open Language Research';

export const SCRIPT_SECTION_TITLE = 'Fonora Script';

export const LANGUAGE_SECTION_TITLE = 'Fonoran';

export const LEARN_SECTION_TITLE = 'Learn';

export const TOOLS_SECTION_TITLE = 'Tools';

export const RESEARCH_SECTION_TITLE = 'Research Notebook';

export const PLATFORM_PAGE_TITLE = 'About';

export const DOCS_PAGE_TITLE = 'Documentation';

/** @param {string} sectionLabel */
export function pageTitle(sectionLabel) {
  if (!sectionLabel || sectionLabel === PLATFORM_PAGE_TITLE) {
    return PLATFORM_HOME_TITLE;
  }
  return `${sectionLabel} | ${SITE_NAME}`;
}

/** @param {string} sectionLabel */
export function documentTitleForSection(sectionLabel) {
  return pageTitle(sectionLabel);
}
