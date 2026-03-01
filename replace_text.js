const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.js') && !fullPath.includes('Text.js') && !fullPath.includes('App.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');

            // Check if it imports Text from react-native
            if (content.match(/import\s+{([^}]*)\bText\b([^}]*)}\s+from\s+['"]react-native['"]/)) {

                // Remove Text from react-native import
                content = content.replace(/(import\s+{.*?)(?:\bText\b\s*,\s*|\s*,\s*\bText\b|\bText\b)(.*?}\s+from\s+['"]react-native['"])/g,
                    (match, p1, p2) => {
                        let newImport = p1 + p2;
                        newImport = newImport.replace(/{\s*,/, '{').replace(/,\s*}/, '}').replace(/{\s*}/, '');
                        // If it's an empty import like `import {} from 'react-native'`, let's just strip it safely or leave it.
                        if (newImport.match(/import\s+{}\s+from/)) return '';
                        return newImport;
                    }
                );

                // Calculate relative path to src/components/Text.js
                const depth = fullPath.split(path.sep).length - path.resolve('src').split(path.sep).length;
                let relativePath = './components/Text';
                if (depth === 2) relativePath = '../components/Text';
                if (depth === 3) relativePath = '../../components/Text';

                const importStatement = `import Text from '${relativePath}';\n`;

                // Add our custom text import to the top of the file
                content = importStatement + content;
                fs.writeFileSync(fullPath, content);
                console.log('Updated', fullPath);
            }
        }
    }
}

processDir(path.resolve('src'));
