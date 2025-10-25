#!/usr/bin/env node

/**
 * Manifest Generator for Tech Learning Hub
 * 
 * This script automatically generates/updates the content/manifest.json file
 * by scanning the content directory for JSON files.
 * 
 * Usage:
 *   node update-manifest.js
 * 
 * Or add to package.json scripts:
 *   "scripts": {
 *     "update-manifest": "node update-manifest.js"
 *   }
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, 'content');
const MANIFEST_FILE = path.join(CONTENT_DIR, 'manifest.json');

// Ordering methods
const ORDERING_METHODS = {
    PREFIX: 'prefix',        // 001-, 002-, etc.
    ALPHABETIC: 'alphabetic', // Alphabetical order
    CUSTOM: 'custom',         // Custom order array
    NONE: 'none'             // No ordering
};

function updateManifest() {
    try {
        console.log('🔍 Scanning content directory...');
        
        // Read all files in content directory
        const files = fs.readdirSync(CONTENT_DIR);
        
        // Filter for JSON files (excluding manifest.json itself)
        const jsonFiles = files
            .filter(file => file.endsWith('.json') && file !== 'manifest.json');
        
        console.log(`📁 Found ${jsonFiles.length} JSON files:`);
        jsonFiles.forEach(file => console.log(`   - ${file}`));
        
        // Determine ordering method and create ordered content files
        const contentFiles = createOrderedContentFiles(jsonFiles);
        
        // Create manifest object
        const manifest = {
            version: "1.0",
            lastUpdated: new Date().toISOString(),
            ordering: {
                method: ORDERING_METHODS.PREFIX,
                customOrder: []
            },
            contentFiles: contentFiles
        };
        
        // Write manifest file
        fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
        
        console.log(`✅ Manifest updated successfully: ${MANIFEST_FILE}`);
        console.log(`📅 Last updated: ${manifest.lastUpdated}`);
        console.log(`📊 Ordering method: ${manifest.ordering.method}`);
        
    } catch (error) {
        console.error('❌ Error updating manifest:', error.message);
        process.exit(1);
    }
}

function createOrderedContentFiles(jsonFiles) {
    const contentFiles = [];
    let orderCounter = 100; // Start at 100 for easy insertion
    
    // Group files by ordering method
    const prefixFiles = [];
    const regularFiles = [];
    
    jsonFiles.forEach(file => {
        // Check for prefix pattern (001-, 002-, etc.)
        const prefixMatch = file.match(/^(\d{3})-(.+)$/);
        if (prefixMatch) {
            const order = parseInt(prefixMatch[1]);
            const title = prefixMatch[2].replace('.json', '').replace(/-/g, ' ');
            prefixFiles.push({
                file: file,
                order: order,
                title: title,
                hasPrefix: true
            });
        } else {
            regularFiles.push({
                file: file,
                order: orderCounter,
                title: file.replace('.json', '').replace(/-/g, ' '),
                hasPrefix: false
            });
            orderCounter += 10; // Increment by 10 for easy insertion
        }
    });
    
    // Sort prefix files by their prefix number
    prefixFiles.sort((a, b) => a.order - b.order);
    
    // Sort regular files alphabetically
    regularFiles.sort((a, b) => a.file.localeCompare(b.file));
    
    // Combine and return
    const allFiles = [...prefixFiles, ...regularFiles];
    
    console.log('📋 Content file ordering:');
    allFiles.forEach(item => {
        const prefix = item.hasPrefix ? `[${item.order.toString().padStart(3, '0')}] ` : '[auto] ';
        console.log(`   ${prefix}${item.file} → ${item.title}`);
    });
    
    return allFiles.map(item => ({
        file: item.file,
        order: item.order,
        title: item.title
    }));
}

// Run if called directly
if (require.main === module) {
    updateManifest();
}

module.exports = { updateManifest };
