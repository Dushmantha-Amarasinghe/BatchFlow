const fs = require('fs');

async function merge() {
    const src = fs.readFileSync('src/index.css', 'utf8');
    const exp = fs.readFileSync('C:/Users/dsbam/Downloads/deploy-69b98e545d1c9b09493699d1/assets/index-iuau-ntb.css', 'utf8');
    
    // The exact marker where new features start in src/index.css
    const markerText = 'BUTTON MICRO-INTERACTIONS';
    let newFeatures = '';
    
    const lines = src.split('\n');
    let found = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(markerText)) {
            // Include everything from the previous line (the comment start)
            found = true;
            newFeatures = lines.slice(i - 1).join('\n');
            break;
        }
    }
    
    if (!found) {
        console.error('Could not find new features block.');
        process.exit(1);
    }
    
    fs.writeFileSync('src/index.css', exp + '\n\n' + newFeatures);
    console.log('Successfully merged exported CSS and new features!');
}

merge();
