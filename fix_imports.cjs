const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'src');

function fixImports(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    
    // Calculate depth from src directory
    const relativePath = path.relative(rootDir, dirPath);
    const depth = relativePath === '' ? 0 : relativePath.split(path.sep).length;
    // To go from the file directory to root (where convex is), we need (depth + 1) times '../'
    const convexPrefix = '../'.repeat(depth + 1);
    
    fs.readdirSync(dirPath).forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixImports(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content;
            
            // Replace relative imports to src folders with alias @/...
            newContent = newContent.replace(/(["'])(\.\.\/)+(hooks|config|components|services|utils|types|contexts|assets)(.*?)(["'])/g, '$1@/$3$4$5');
            
            // Replace shared
            newContent = newContent.replace(/(["'])(\.\.\/)+shared\/(.*?)(["'])/g, '$1@/components/shared/$3$4');
            
            // Replace convex
            newContent = newContent.replace(/(["'])(\.\.\/)+convex\/(.*?)(["'])/g, `$1${convexPrefix}convex/$3$4`);
            
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Fixed aliases in', fullPath);
            }
        }
    });
}

fixImports(rootDir);
