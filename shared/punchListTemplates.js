/**
 * Final walkthrough punch list — sections follow finish | find | funds (same three-beat ring as
 * plan | prep | permits on the Prep task).
 */

export const PUNCH_LIST_SECTION_KEYS = ['finish', 'find', 'funds'];

/** @typedef {'finish' | 'find' | 'funds'} PunchListSectionKey */

/** @type {Array<{ key: PunchListSectionKey, label: string, hint: string }>} */
export const PUNCH_LIST_SECTIONS = [
  { key: 'finish', label: 'Finish work', hint: 'Finish work (trim, paint)' },
  { key: 'find', label: 'Check quality', hint: 'Walk through and double-check' },
  { key: 'funds', label: 'Confirm billing', hint: 'Bill and get paid' },
];

/** Default empty sections for a new punch list document. */
export function defaultPunchListSections() {
  return PUNCH_LIST_SECTIONS.map((section) => ({
    key: section.key,
    label: section.label,
    items: [],
  }));
}

export const PUNCH_LIST_TITLE = 'Final walkthrough';
