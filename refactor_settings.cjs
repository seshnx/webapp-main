const fs = require('fs');
const file = 'src/components/SettingsTab.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add imports
content = content.replace("import type { AccountType, UserData } from '../types';", "import type { AccountType, UserData } from '../types';\nimport { useSettingsForm } from '../hooks/useSettingsForm';\nimport type { SettingsTabId, SettingsTabDef, SettingsUser, SettingsTabProps, ExtendedSettings } from '../types/settings';");

// Remove TYPE DEFINITIONS block
content = content.replace(/\/\/ =====================================================\r?\n\/\/ TYPE DEFINITIONS\r?\n\/\/ =====================================================[\s\S]*?\/\/ =====================================================\r?\n\/\/ HELPER COMPONENT TYPES\r?\n\/\/ =====================================================/, '// =====================================================\n// HELPER COMPONENT TYPES\n// =====================================================');

// The main component start
const mainCompRegex = /export default function SettingsTab\(\{[\s\S]*?\}\): ReactElement \{[\s\S]*?const clerk = useClerk\(\);/m;

const match = content.match(mainCompRegex);
if(match) {
  const hookCall = `
    const {
        localSettings, setLocalSettings, roles, setRoles, preferredRole, setPreferredRole,
        activeRole, setActiveRole, defaultProfileRole, setDefaultProfileRole,
        saving, setSaving, exporting, setExporting, activeSessions, setActiveSessions,
        isDeleting, setIsDeleting, deleteConfirm, setDeleteConfirm, showDeleteModal, setShowDeleteModal,
        roleToRemove, setRoleToRemove, showRoleRemoveModal, setShowRoleRemoveModal,
        showSecurityModal, setShowSecurityModal, securityAction, setSecurityAction,
        securityForm, setSecurityForm, isSecurityLoading, setIsSecurityLoading,
        handleToggle, handleValueChange, handleThemeChange, saveSettings, updateAccountTypes,
        toggleRole, confirmRoleRemoval, cancelRoleRemoval, openSecurityModal, handleSecurityUpdate,
        handleDataExport, handleDeleteAccount, clearCache, settingsLoading
    } = useSettingsForm({ user: user as any, userData, onUpdate, onRoleSwitch, subProfiles }, clerk);
`;
  
  // replace the huge body up to HELPER COMPONENTS
  const bodyStart = match.index + match[0].length;
  const helperStr = '    // =====================================================\n    // HELPER COMPONENTS';
  const helperIndex = content.indexOf(helperStr, bodyStart);
  const fallbackStr = '    // =====================================================\r\n    // HELPER COMPONENTS';
  const helperIndex2 = content.indexOf(fallbackStr, bodyStart);
  const finalIndex = helperIndex !== -1 ? helperIndex : helperIndex2;
  
  if (finalIndex !== -1) {
     content = content.substring(0, bodyStart) + hookCall + '\n' + content.substring(finalIndex);
  } else {
     console.log('HELPER COMPONENTS not found');
  }
} else {
  console.log('Main component regex not found');
}

fs.writeFileSync(file, content);
console.log('done');
