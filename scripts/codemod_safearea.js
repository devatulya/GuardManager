const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, '../src/screens');
const filesToUpdate = [
    'SitesListScreen.js', 'SettingsScreen.js', 'ReportsScreen.js',
    'ReportResultsScreen.js', 'NotificationsScreen.js', 'GuardsListScreen.js',
    'AttendanceScreen.js', 'AttendanceReviewScreen.js', 'AdvancesScreen.js',
    'AdvancesListScreen.js', 'AddSiteScreen.js', 'AddGuardScreen.js'
];

for (const file of filesToUpdate) {
    const filePath = path.join(screensDir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');

    // Replace import
    if (content.includes("import { SafeAreaView } from 'react-native-safe-area-context';")) {
        content = content.replace(
            "import { SafeAreaView } from 'react-native-safe-area-context';",
            "import ScreenWrapper from '../components/ScreenWrapper';"
        );
    } else if (content.includes("import { SafeAreaView")) {
        // If there's a destructured import we leave it but add ScreenWrapper
        content = content.replace(
            /import {([^}]*)SafeAreaView([^}]*)} from 'react-native-safe-area-context';/g,
            "import { $1 $2 } from 'react-native-safe-area-context';\nimport ScreenWrapper from '../components/ScreenWrapper';"
        );
        content = content.replace("import {  } from 'react-native-safe-area-context';", "");
        content = content.replace("import {,} from 'react-native-safe-area-context';", "");
    }

    // Check if useSafeAreaInsets is already imported, if not and it's needed, it might be.
    // ScreenWrapper doesn't need useSafeAreaInsets, it handles it internally.

    // Replace <SafeAreaView> with <ScreenWrapper edges={['top', 'left', 'right']}>
    content = content.replace(
        /<SafeAreaView/g,
        "<ScreenWrapper edges={['top', 'left', 'right']}"
    );

    content = content.replace(
        /<\/SafeAreaView>/g,
        "</ScreenWrapper>"
    );

    // Fix any "import {  } from " leftovers
    content = content.replace(/import\s*{\s*,\s*}\s*from\s*'react-native-safe-area-context';\s*/, '');
    content = content.replace(/import\s*{\s*}\s*from\s*'react-native-safe-area-context';\s*/, '');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
}
