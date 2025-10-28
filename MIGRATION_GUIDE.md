# TikTok Trainer - Migration Guide

## 🔄 How to Switch to Optimized Codebase

This guide will help you migrate from the old codebase to the optimized version.

---

## ⚡ Quick Start (5 minutes)

### Step 1: Backup Current Version
```bash
# Create backup of current App.js
cp App.js App.backup.js

# Create backup of current screens (optional)
cp -r src/screens src/screens.backup
```

### Step 2: Use Optimized App
```bash
# Replace App.js with optimized version
cp App.optimized.js App.js
```

### Step 3: Test
```bash
# Start the app
npm start

# Test on physical device
# Verify all features work
```

That's it! The optimized version is backward compatible with existing screens.

---

## 📱 Full Migration (Recommended)

### Phase 1: Setup (5 minutes)
✅ Already done! New files created:
- `src/utils/` - Utility functions
- `src/components/` - Shared components  
- `src/hooks/` - Custom hooks
- `src/context/Optimized*Provider.js` - Optimized contexts

### Phase 2: Switch App Entry Point (1 minute)
```bash
# Use optimized App.js
mv App.js App.old.js
mv App.optimized.js App.js
```

### Phase 3: Migrate Screens One by One

#### Option A: Start with HomeScreen (Recommended)
```bash
# Use the optimized HomeScreen example
mv src/screens/HomeScreen.js src/screens/HomeScreen.old.js
mv src/screens/HomeScreen.optimized.js src/screens/HomeScreen.js
```

#### Option B: Gradually Update Existing Screens
Keep existing screens and update them gradually:

**Before:**
```jsx
import { useContextData } from '../context/ContextProvider';

// Inline styles
const Card = ({ children }) => (
  <View style={{
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    // ... more styles
  }}>
    {children}
  </View>
);
```

**After:**
```jsx
import { useContextData } from '../context/OptimizedContextProvider';
import { Card, Button } from '../components';
import { COLORS, SPACING } from '../utils/constants';

// Use shared component
<Card padding={SPACING.lg}>
  {children}
</Card>
```

---

## 🔧 Screen-by-Screen Migration

### 1. HomeScreen

**Changes Needed:**
- ✅ Import optimized contexts
- ✅ Use shared `Card`, `Button`, `AchievementCard` components
- ✅ Use `COLORS` and `SPACING` from constants
- ✅ Add loading states
- ✅ Use `PromptCard` component

**Example:**
```jsx
// Old way
<View style={{
  backgroundColor: 'white',
  borderRadius: 15,
  padding: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
}}>
  <Text>Content</Text>
</View>

// New way
import { Card } from '../components';
import { SPACING } from '../utils/constants';

<Card padding={SPACING.lg}>
  <Text>Content</Text>
</Card>
```

### 2. CameraScreen

**Changes Needed:**
- ✅ Import `OptimizedCameraProvider`
- ✅ Use `useHaptics` hook
- ✅ Use `formatDuration` from helpers
- ✅ Use `Button` for controls

**Example:**
```jsx
// Old way
const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// New way
import { formatDuration } from '../utils/helpers';
// Just use it!
```

### 3. ProgressScreen

**Changes Needed:**
- ✅ Import `OptimizedProgressProvider`
- ✅ Use `StatCard` for metrics
- ✅ Use `AchievementCard` for achievements
- ✅ Use `COLORS` for charts

**Example:**
```jsx
// Old way
<View style={styles.statCard}>
  <Text style={styles.statValue}>{currentStreak}</Text>
  <Text style={styles.statTitle}>Current Streak</Text>
</View>

// New way
import { StatCard } from '../components';

<StatCard
  title="Current Streak"
  value={currentStreak}
  icon="flame"
  color={COLORS.primary}
/>
```

### 4. SettingsScreen

**Changes Needed:**
- ✅ Use `Card` for settings sections
- ✅ Use `Button` for actions
- ✅ Use storage helpers from `storage.js`

**Example:**
```jsx
// Old way
const settings = await AsyncStorage.getItem('appSettings');
if (settings) {
  setSettings(JSON.parse(settings));
}

// New way
import * as Storage from '../utils/storage';

const settings = await Storage.getAppSettings();
setSettings(settings);
```

### 5. PromptCardScreen

**Changes Needed:**
- ✅ Use `Header` component
- ✅ Use `Button` for actions
- ✅ Use `Card` for idea cards
- ✅ Use `RECORDING_IDEAS` from constants

---

## 🎯 Context Provider Migration

### Before (Old Providers)
```jsx
import { ContextProvider } from './src/context/ContextProvider';
import { CameraProvider } from './src/context/CameraProvider';
import { ProgressProvider } from './src/context/ProgressProvider';
```

### After (Optimized Providers)
```jsx
import { OptimizedContextProvider } from './src/context/OptimizedContextProvider';
import { OptimizedCameraProvider } from './src/context/OptimizedCameraProvider';
import { OptimizedProgressProvider } from './src/context/OptimizedProgressProvider';
```

### Import Updates in Screens
```jsx
// Before
import { useContextData } from '../context/ContextProvider';
import { useCamera } from '../context/CameraProvider';
import { useProgress } from '../context/ProgressProvider';

// After
import { useContextData } from '../context/OptimizedContextProvider';
import { useCamera } from '../context/OptimizedCameraProvider';
import { useProgress } from '../context/OptimizedProgressProvider';
```

**Note:** Hook names stay the same! Only the import path changes.

---

## 📦 Component Usage Guide

### Button Component

```jsx
import { Button } from '../components';

// Primary button with icon
<Button
  title="Record Video"
  icon="camera"
  variant="primary"
  size="lg"
  onPress={handleRecord}
/>

// Gradient button
<Button
  title="Quick Record"
  icon="camera"
  gradient
  fullWidth
  onPress={handleRecord}
/>

// Outline button
<Button
  title="Cancel"
  variant="outline"
  size="md"
  onPress={handleCancel}
/>

// Loading state
<Button
  title="Saving..."
  loading={isSaving}
  disabled={isSaving}
/>
```

### Card Component

```jsx
import { Card } from '../components';
import { SPACING } from '../utils/constants';

// Basic card
<Card>
  <Text>Content here</Text>
</Card>

// Card with press handler
<Card onPress={handlePress}>
  <Text>Tap me</Text>
</Card>

// Custom padding
<Card padding={SPACING.xl}>
  <Text>More padding</Text>
</Card>

// Without elevation
<Card elevated={false}>
  <Text>Flat card</Text>
</Card>
```

### StatCard Component

```jsx
import { StatCard } from '../components';
import { COLORS } from '../utils/constants';

<StatCard
  title="Current Streak"
  value={currentStreak}
  subtitle="days"
  icon="flame"
  color={COLORS.primary}
/>
```

### Header Component

```jsx
import { Header } from '../components';

<Header
  title="Settings"
  subtitle="Customize your experience"
  leftIcon="menu"
  rightIcon="help-circle"
  onLeftPress={openMenu}
  onRightPress={showHelp}
/>
```

---

## 🛠 Utility Functions

### Storage Operations

```jsx
import * as Storage from '../utils/storage';

// Get data
const patterns = await Storage.getUserPatterns();
const zones = await Storage.getCreativeZones();
const settings = await Storage.getAppSettings();

// Set data
await Storage.setUserPatterns(patterns);
await Storage.setCreativeZones(zones);
await Storage.setAppSettings(settings);

// Generic operations
const data = await Storage.getItem('myKey', defaultValue);
await Storage.setItem('myKey', data);

// Export/Import
const allData = await Storage.exportData();
await Storage.importData(allData);
```

### Helper Functions

```jsx
import { 
  calculateDistance, 
  formatDuration, 
  formatDate,
  getTimeSlot,
  calculateStreak,
} from '../utils/helpers';

// Distance calculation
const distance = calculateDistance(lat1, lon1, lat2, lon2);

// Time formatting
const duration = formatDuration(seconds); // "5:30"
const date = formatDate(new Date()); // "Oct 28, 2025"
const timeSlot = getTimeSlot(14); // "afternoon"

// Streak calculation
const { currentStreak, longestStreak } = calculateStreak(progressData);
```

### Constants

```jsx
import { COLORS, SPACING, FONT_SIZES, ACHIEVEMENTS } from '../utils/constants';

// Use in styles
backgroundColor: COLORS.primary,
padding: SPACING.md,
fontSize: FONT_SIZES.lg,

// Use achievements
Object.values(ACHIEVEMENTS).forEach(achievement => {
  console.log(achievement.title);
});
```

---

## 🎨 Styling Migration

### Before (Inline Styles)
```jsx
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
});
```

### After (Using Constants)
```jsx
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, SHADOW } from '../utils/constants';

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    ...SHADOW.md,
  },
  text: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text.primary,
  },
});
```

---

## 🧪 Testing Your Migration

### Checklist

#### App Starts
- [ ] App opens without errors
- [ ] No console warnings
- [ ] All tabs visible
- [ ] Navigation works

#### Home Screen
- [ ] Streak displays correctly
- [ ] Quick Record button works
- [ ] Buzzwords load
- [ ] Achievements show
- [ ] Loading state appears

#### Camera Screen
- [ ] Camera opens
- [ ] Recording starts/stops
- [ ] Video saves to gallery
- [ ] Controls work (flip, flash)
- [ ] Progress updates

#### Progress Screen
- [ ] Stats display correctly
- [ ] Chart renders
- [ ] Calendar works
- [ ] Achievements show
- [ ] Goal settings work

#### Settings Screen
- [ ] Settings load
- [ ] Toggles work
- [ ] Buzzwords save
- [ ] Zones add/remove
- [ ] Notifications test

---

## 🐛 Common Migration Issues

### Issue: "Cannot find module"
**Solution:** Check import paths. Use `OptimizedContextProvider` not `ContextProvider`

### Issue: "undefined is not an object"
**Solution:** Make sure you're wrapping the app with all providers

### Issue: Styles look broken
**Solution:** Import and use `COLORS`, `SPACING` from constants

### Issue: Functions not defined
**Solution:** Import helpers from `../utils/helpers`

### Issue: Storage not working
**Solution:** Use storage helpers from `../utils/storage`

---

## 🔄 Rollback Plan

If something goes wrong, rollback is easy:

```bash
# Restore original App.js
mv App.old.js App.js

# Restore original screens (if needed)
mv src/screens.backup/* src/screens/

# Restart
npm start
```

---

## 📊 Migration Checklist

### Before Starting
- [ ] Read this guide completely
- [ ] Backup current code
- [ ] Test current version works
- [ ] Commit current state to git

### During Migration
- [ ] Update App.js to use optimized providers
- [ ] Test app starts
- [ ] Migrate HomeScreen (or use optimized version)
- [ ] Test HomeScreen works
- [ ] Gradually update other screens
- [ ] Test each screen after update
- [ ] Update imports to use new utilities
- [ ] Replace inline styles with constants
- [ ] Use shared components

### After Migration
- [ ] Test all features
- [ ] Check for console warnings
- [ ] Verify performance improvements
- [ ] Update documentation
- [ ] Commit optimized version

---

## 🎉 Benefits After Migration

### Code Quality
- ✅ No duplicate code
- ✅ Consistent patterns
- ✅ Better organization
- ✅ Easier to maintain

### Performance
- ✅ Fewer re-renders
- ✅ Better memory usage
- ✅ Faster operations

### Developer Experience
- ✅ Reusable components
- ✅ Utility functions
- ✅ Design system
- ✅ Better error handling

### User Experience
- ✅ Loading states
- ✅ Error boundaries
- ✅ Consistent UI
- ✅ Smooth interactions

---

## 📚 Additional Resources

- `OPTIMIZATION_GUIDE.md` - Detailed optimization information
- `IMPLEMENTATION_SUMMARY.md` - What was changed and why
- `DEMO_CHECKLIST.md` - How to demo the app
- `src/screens/HomeScreen.optimized.js` - Example refactored screen
- `src/components/` - All shared components
- `src/utils/` - All utility functions

---

## 🤝 Need Help?

If you encounter issues during migration:

1. Check this guide
2. Check `OPTIMIZATION_GUIDE.md`
3. Look at `HomeScreen.optimized.js` example
4. Review component documentation in files
5. Check console for error messages

---

**Happy Migrating! 🚀**

Remember: The optimized version is **backward compatible**. You can migrate gradually at your own pace!

