# Hair Flattening Preferences Storage

User preferences system for the Smart Hair Flattening feature. Allows users to customize their default adjustment mode, auto-flatten threshold, and UI message preferences.

## Overview

The preferences system stores user settings in localStorage, providing a persistent experience across AR sessions. Users can customize:

- **Default Mode**: Which adjustment mode to use when starting an AR session
- **Auto-Flatten Threshold**: Volume score threshold for automatic flattening
- **Show Info Message**: Whether to display the info message when flattening is applied
- **Enable Comparison**: Whether comparison view is enabled by default

## Requirements

**Validates Requirements:**
- 3.1: User preferences for info message display
- 4.1: Default adjustment mode selection

## Architecture

```
┌─────────────────────────────────────────┐
│   React Components / Hooks              │
│   - useHairFlattening                   │
│   - useHairFlatteningPreferences        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   HairFlatteningPreferencesManager      │
│   - Load/Save/Update/Reset              │
│   - Validation                          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   localStorage                          │
│   Key: spooky-wigs-hair-flattening-    │
│        preferences                      │
└─────────────────────────────────────────┘
```

## Data Structure

```typescript
interface HairAdjustmentPreferences {
  defaultMode: AdjustmentMode;        // 'normal' | 'flattened' | 'bald'
  autoFlattenThreshold: number;       // 0-100
  showInfoMessage: boolean;           // true | false
  enableComparison: boolean;          // true | false
}
```

## Default Values

```typescript
{
  defaultMode: AdjustmentMode.FLATTENED,
  autoFlattenThreshold: 40,
  showInfoMessage: true,
  enableComparison: false
}
```

## Usage

### Using the Manager Class

```typescript
import { HairFlatteningPreferencesManager } from '../utils/hairFlatteningPreferences';

// Load preferences
const preferences = HairFlatteningPreferencesManager.loadPreferences();

// Save preferences
const success = HairFlatteningPreferencesManager.savePreferences({
  defaultMode: AdjustmentMode.NORMAL,
  autoFlattenThreshold: 50,
  showInfoMessage: false,
  enableComparison: true
});

// Update a single field
HairFlatteningPreferencesManager.updatePreference('showInfoMessage', false);

// Reset to defaults
HairFlatteningPreferencesManager.resetPreferences();

// Check if preferences exist
const hasPrefs = HairFlatteningPreferencesManager.hasPreferences();

// Get defaults
const defaults = HairFlatteningPreferencesManager.getDefaults();
```

### Using Convenience Functions

```typescript
import {
  loadHairFlatteningPreferences,
  saveHairFlatteningPreferences,
  updateHairFlatteningPreference,
  resetHairFlatteningPreferences
} from '../utils/hairFlatteningPreferences';

// Load
const prefs = loadHairFlatteningPreferences();

// Save
saveHairFlatteningPreferences(prefs);

// Update one field
updateHairFlatteningPreference('defaultMode', AdjustmentMode.BALD);

// Reset
resetHairFlatteningPreferences();
```

### Using the React Hook

```typescript
import { useHairFlatteningPreferences } from '../hooks/useHairFlatteningPreferences';

function PreferencesPanel() {
  const {
    preferences,
    updatePreference,
    resetPreferences,
    hasStoredPreferences
  } = useHairFlatteningPreferences();
  
  return (
    <div>
      <h3>Hair Flattening Preferences</h3>
      
      {/* Default Mode */}
      <select
        value={preferences.defaultMode}
        onChange={(e) => updatePreference('defaultMode', e.target.value as AdjustmentMode)}
      >
        <option value="normal">Normal</option>
        <option value="flattened">Flattened</option>
        <option value="bald">Bald</option>
      </select>
      
      {/* Auto-Flatten Threshold */}
      <input
        type="range"
        min="0"
        max="100"
        value={preferences.autoFlattenThreshold}
        onChange={(e) => updatePreference('autoFlattenThreshold', parseInt(e.target.value))}
      />
      
      {/* Show Info Message */}
      <label>
        <input
          type="checkbox"
          checked={preferences.showInfoMessage}
          onChange={(e) => updatePreference('showInfoMessage', e.target.checked)}
        />
        Show info message
      </label>
      
      {/* Enable Comparison */}
      <label>
        <input
          type="checkbox"
          checked={preferences.enableComparison}
          onChange={(e) => updatePreference('enableComparison', e.target.checked)}
        />
        Enable comparison view
      </label>
      
      {/* Reset Button */}
      {hasStoredPreferences && (
        <button onClick={resetPreferences}>
          Reset to Defaults
        </button>
      )}
    </div>
  );
}
```

### Integration with useHairFlattening

The `useHairFlattening` hook automatically loads preferences on initialization:

```typescript
import { useHairFlattening } from '../hooks/useHairFlattening';

function ARTryOnComponent() {
  const {
    preferences,
    currentMode,
    updatePreferences,
    changeMode
  } = useHairFlattening(hairProcessingState, setAdjustmentMode, {
    loadPreferences: true  // Default: true
  });
  
  // Preferences are automatically loaded and applied
  // Current mode will be set to preferences.defaultMode on initialization
  
  // Update preferences
  const handleDisableMessage = () => {
    updatePreferences({ showInfoMessage: false });
  };
  
  return (
    <div>
      {preferences.showInfoMessage && (
        <HairAdjustmentMessage onDismiss={handleDisableMessage} />
      )}
    </div>
  );
}
```

## Validation

The preferences system includes automatic validation:

### Adjustment Mode Validation
- Must be one of: `'normal'`, `'flattened'`, `'bald'`
- Invalid values default to `AdjustmentMode.FLATTENED`

### Threshold Validation
- Must be a number between 0 and 100 (inclusive)
- Invalid values default to `40`

### Boolean Validation
- `showInfoMessage` and `enableComparison` must be boolean
- Invalid values default to `true` and `false` respectively

## Error Handling

The preferences system handles errors gracefully:

```typescript
// If localStorage is unavailable
const prefs = loadHairFlatteningPreferences();
// Returns default preferences

// If stored data is corrupted
const prefs = loadHairFlatteningPreferences();
// Returns default preferences

// If save fails
const success = saveHairFlatteningPreferences(prefs);
// Returns false, logs error to console
```

## Storage Format

Preferences are stored in localStorage as JSON:

```json
{
  "defaultMode": "flattened",
  "autoFlattenThreshold": 40,
  "showInfoMessage": true,
  "enableComparison": false
}
```

**Storage Key:** `spooky-wigs-hair-flattening-preferences`

## Best Practices

### 1. Load Preferences Early
```typescript
// Load preferences when AR session starts
useEffect(() => {
  if (isARInitialized) {
    const prefs = loadHairFlatteningPreferences();
    setAdjustmentMode(prefs.defaultMode);
  }
}, [isARInitialized]);
```

### 2. Save Preferences Immediately
```typescript
// Save when user changes a setting
const handleModeChange = (mode: AdjustmentMode) => {
  changeMode(mode);
  updateHairFlatteningPreference('defaultMode', mode);
};
```

### 3. Respect User Preferences
```typescript
// Check showInfoMessage before displaying
if (preferences.showInfoMessage && shouldShowMessage) {
  setShowMessage(true);
}
```

### 4. Provide Reset Option
```typescript
// Allow users to reset to defaults
<button onClick={resetHairFlatteningPreferences}>
  Reset to Defaults
</button>
```

## Testing

The preferences system includes comprehensive unit tests:

```bash
npm test -- hairFlatteningPreferences.test.ts
```

Tests cover:
- Loading and saving preferences
- Validation of invalid values
- Updating individual fields
- Resetting to defaults
- Edge cases and error handling

## Performance

- **Load Time**: < 1ms (synchronous localStorage read)
- **Save Time**: < 1ms (synchronous localStorage write)
- **Memory**: ~200 bytes per preferences object
- **Storage**: ~150 bytes in localStorage

## Browser Compatibility

Requires localStorage support:
- Chrome 4+
- Firefox 3.5+
- Safari 4+
- Edge (all versions)
- IE 8+

Falls back to defaults if localStorage is unavailable.

## Privacy

- All preferences are stored locally in the browser
- No data is sent to servers
- Preferences are cleared when user clears browser data
- No personally identifiable information is stored

## Future Enhancements

Potential improvements:
- Cloud sync for logged-in users
- Per-wig preferences
- Advanced customization options
- Import/export preferences
- Preference presets

## Related Files

- `frontend/src/utils/hairFlatteningPreferences.ts` - Core implementation
- `frontend/src/hooks/useHairFlatteningPreferences.ts` - React hook
- `frontend/src/hooks/useHairFlattening.ts` - Integration with AR engine
- `frontend/src/utils/__tests__/hairFlatteningPreferences.test.ts` - Unit tests

## Support

For issues or questions:
1. Check the unit tests for usage examples
2. Review the inline documentation
3. Consult the design document at `.kiro/specs/smart-hair-flattening/design.md`
