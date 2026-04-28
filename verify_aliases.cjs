const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function verifyAliases(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    
    fs.readdirSync(dirPath).forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            verifyAliases(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const regex = /import.*?from\s+['"]@\/([^'"]+)['"]/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                const aliasPath = match[1]; // e.g., 'hooks/useDiscover'
                
                // Possible extensions
                const possibleExts = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js'];
                let exists = false;
                
                for (const ext of possibleExts) {
                    if (fs.existsSync(path.join(srcDir, aliasPath + ext))) {
                        exists = true;
                        break;
                    }
                }
                
                if (!exists) {
                    console.log(`BROKEN ALIAS in ${fullPath}: @/${aliasPath}`);
                }
            }
        }
    });
}

verifyAliases(srcDir);
