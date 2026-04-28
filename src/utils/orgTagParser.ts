/**
 * Organization Tag Parser
 *
 * Utilities for parsing and managing organization name tags.
 * Tags are used to identify organization types: {[STUDIO]}, {[TECH]}, {[LABEL]}, {[EDU]}
 */

// Org type constants - the tags that appear at the end of org names
export const ORG_TAGS = {
  STUDIO: '{[STUDIO]}',
  TECH: '{[TECH]}',
  LABEL: '{[LABEL]}',
  EDU: '{[EDU]}'
} as const;

export type OrgType = keyof typeof ORG_TAGS;

/**
 * Parse org name to extract display name and type
 *
 * @param orgName - The full organization name (with or without tag)
 * @returns Object containing displayName (name without tag) and orgType (extracted type or null)
 *
 * @example
 * parseOrgTag("The Sound Farm {[STUDIO]}")
 * // => { displayName: "The Sound Farm", orgType: "STUDIO" }
 *
 * @example
 * parseOrgTag("Old Org Name")
 * // => { displayName: "Old Org Name", orgType: null }
 */
export function parseOrgTag(orgName: string): {
  displayName: string;
  orgType: OrgType | null;
} {
  if (!orgName) {
    return { displayName: '', orgType: null };
  }

  // Match tag pattern: {[WORD]} at the end of the string
  const tagMatch = orgName.match(/\{\[(\w+)\]\}$/);

  if (!tagMatch) {
    // No tag found - return original name (backward compatibility)
    return { displayName: orgName, orgType: null };
  }

  const tag = tagMatch[0]; // e.g., "{[STUDIO]}"
  const type = tagMatch[1] as OrgType; // e.g., "STUDIO"
  const displayName = orgName.replace(tag, '').trim();

  // Validate that the extracted type is a valid org type
  return {
    displayName,
    orgType: ORG_TAGS[type] ? type : null
  };
}

/**
 * Add org tag to name
 *
 * @param name - The base organization name
 * @param type - The org type to append
 * @returns Full organization name with tag
 *
 * @example
 * addOrgTag("The Sound Farm", "STUDIO")
 * // => "The Sound Farm {[STUDIO]}"
 */
export function addOrgTag(name: string, type: OrgType): string {
  if (!name || !type) {
    return name || '';
  }

  const trimmedName = name.trim();

  // Check if name already has a tag
  if (hasOrgTag(trimmedName)) {
    // Remove existing tag and add new one
    const { displayName } = parseOrgTag(trimmedName);
    return `${displayName} ${ORG_TAGS[type]}`;
  }

  return `${trimmedName} ${ORG_TAGS[type]}`;
}

/**
 * Check if org name has a tag
 *
 * @param orgName - The organization name to check
 * @returns true if the name ends with a valid tag pattern
 *
 * @example
 * hasOrgTag("The Sound Farm {[STUDIO]}") // => true
 * hasOrgTag("Old Org Name") // => false
 */
export function hasOrgTag(orgName: string): boolean {
  if (!orgName) return false;

  // Check if name ends with tag pattern
  const tagMatch = orgName.match(/\{\[(\w+)\]\}$/);
  if (!tagMatch) return false;

  // Verify it's a valid org type
  const type = tagMatch[1] as OrgType;
  return !!ORG_TAGS[type];
}

/**
 * Get org type from name
 *
 * @param orgName - The organization name
 * @returns The org type (STUDIO, TECH, LABEL, EDU) or null if no tag
 *
 * @example
 * getOrgType("The Sound Farm {[STUDIO]}") // => "STUDIO"
 * getOrgType("Old Org Name") // => null
 */
export function getOrgType(orgName: string): OrgType | null {
  return parseOrgTag(orgName).orgType;
}

/**
 * Get all valid org types
 *
 * @returns Array of all valid org type keys
 */
export function getAllOrgTypes(): OrgType[] {
  return Object.keys(ORG_TAGS) as OrgType[];
}

/**
 * Get tag for a specific org type
 *
 * @param type - The org type
 * @returns The tag string (e.g., "{[STUDIO]}")
 *
 * @example
 * getTagForType("STUDIO") // => "{[STUDIO]}"
 */
export function getTagForType(type: OrgType): string {
  return ORG_TAGS[type] || '';
}

/**
 * Check if a string is a valid org type
 *
 * @param type - The type to check
 * @returns true if the type is valid
 */
export function isValidOrgType(type: string): type is OrgType {
  return type in ORG_TAGS;
}
