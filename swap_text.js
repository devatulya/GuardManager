const fs = require('fs');
const path = require('path');

function replaceTextImport(dir, relativePathToText) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceTextImport(fullPath, '../' + relativePathToText);
        } else if (file.endsWith('.js') && file !== 'Text.js') {
            let content = fs.readFileSync(fullPath, 'utf8');

            // Regex to match "import { ...Text... } from 'react-native'"
            const rnImportRegex = /import\s+({[^}]*})\s+from\s+['"]react-native['"];?/g;
            let updated = false;

            content = content.replace(rnImportRegex, (match, importsBlock) => {
                if (/\bText\b/.test(importsBlock)) {
                    updated = true;
                    // Remove Text
                    let newImports = importsBlock.replace(/\bText\b/g, '')
                        .replace(/,\s*,/g, ',')
                        .replace(/{\s*,/g, '{')
                        .replace(/,\s*}/g, '}')
                        .replace(/{\s*}/g, '');

                    let newImportStmt = '';
                    if (newImports.trim() !== '') {
                        newImportStmt = `import ${newImports} from 'react-native';\n`;
                    }

                    return `${newImportStmt}import Text from '${relativePathToText}';`;
                }
                return match;
            });

            if (updated) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

replaceTextImport('./src/screens', '../components/Text');
replaceTextImport('./src/components', './Text');
