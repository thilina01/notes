# Content File Ordering Guide

This guide explains how to control the order of content files in the Tech Learning Hub sidebar.

## 🎯 Ordering Methods

### 1. **Prefix Method (Recommended)**
Use three-digit prefixes in filenames to control exact order.

**Format:** `001-filename.json`, `002-filename.json`, etc.

**Examples:**
```
001-java-versions.json      # Order: 1
002-java-advanced.json      # Order: 2  
003-spring-versions.json    # Order: 3
004-kubernetes.json         # Order: 4
```

**Benefits:**
- ✅ **Exact Control** - Precise ordering
- ✅ **Easy Insertion** - Insert between existing items
- ✅ **Visual Clarity** - Order is obvious from filename
- ✅ **Version Control** - Clear in git diffs

### 2. **Alphabetical Method**
Files without prefixes are sorted alphabetically.

**Examples:**
```
content-template.json       # Order: 100 (auto-assigned)
docker-versions.json        # Order: 110 (auto-assigned)
git-commands-example.json   # Order: 120 (auto-assigned)
notes.json                  # Order: 130 (auto-assigned)
python-example.json         # Order: 140 (auto-assigned)
```

**Benefits:**
- ✅ **No Maintenance** - Automatic sorting
- ✅ **Consistent** - Same order across environments
- ✅ **Simple** - No prefix management needed

### 3. **Custom Order Method**
Manually specify order in `manifest.json`.

**Example:**
```json
{
  "ordering": {
    "method": "custom",
    "customOrder": [
      "java-versions.json",
      "kubernetes.json", 
      "spring-versions.json"
    ]
  }
}
```

## 🛠️ Implementation Details

### Automatic Order Assignment
- **Prefix Files**: Order = prefix number (001 → 1, 002 → 2)
- **Regular Files**: Order = 100 + (10 × position) (100, 110, 120...)
- **Mixed Files**: Prefix files first, then alphabetical

### Order Resolution Priority
1. **Prefix files** (001-, 002-, etc.) - sorted by prefix number
2. **Regular files** - sorted alphabetically, auto-assigned order numbers

### Manifest Structure
```json
{
  "version": "1.0",
  "lastUpdated": "2025-10-25T14:02:49.930Z",
  "ordering": {
    "method": "prefix",
    "customOrder": []
  },
  "contentFiles": [
    {
      "file": "001-java-versions.json",
      "order": 1,
      "title": "java versions"
    }
  ]
}
```

## 📋 Best Practices

### 1. **Use Prefix Method for Important Content**
```
001-java-versions.json      # Core Java content
002-java-advanced.json      # Advanced Java concepts
003-spring-versions.json    # Spring framework
004-kubernetes.json         # Kubernetes commands
```

### 2. **Leave Examples/Templates Unprefixed**
```
content-template.json       # Template (auto-sorted)
python-example.json         # Example content
git-commands-example.json   # Example commands
```

### 3. **Use Increments of 10 for Flexibility**
```
001-java-versions.json      # Order: 1
010-java-advanced.json      # Order: 10 (room for 002-009)
020-spring-versions.json    # Order: 20 (room for 011-019)
```

### 4. **Group Related Content**
```
001-java-versions.json      # Java basics
002-java-advanced.json      # Java advanced
010-spring-versions.json    # Spring basics
020-spring-advanced.json    # Spring advanced
```

## 🔄 Maintenance

### Adding New Content
1. **With Prefix**: `005-new-content.json`
2. **Without Prefix**: Just add file, auto-assigned order
3. **Update Manifest**: Run `npm run update-manifest`

### Reordering Existing Content
1. **Rename files** with new prefixes
2. **Run** `npm run update-manifest`
3. **Verify** order in sidebar

### Inserting Between Existing Items
1. **Use decimal prefixes**: `001.5-intermediate.json`
2. **Or use increments**: `005-new-content.json` (between 004 and 010)

## 🎨 Visual Examples

### Sidebar Order (with prefixes):
```
📚 Tech Learning Hub
├── ☕ Java Versions        (001-java-versions.json)
├── ☕ Java Advanced        (002-java-advanced.json)  
├── 🌱 Spring Versions     (003-spring-versions.json)
├── ☸️ Kubernetes          (004-kubernetes.json)
├── 📝 Content Template    (content-template.json)
├── 🐳 Docker Versions     (docker-versions.json)
└── 📚 Notes               (notes.json)
```

### Sidebar Order (alphabetical):
```
📚 Tech Learning Hub
├── 📝 Content Template    (content-template.json)
├── 🐳 Docker Versions     (docker-versions.json)
├── 📚 Notes               (notes.json)
└── 🐍 Python Example      (python-example.json)
```

## 🚀 Quick Start

1. **Rename important files** with prefixes:
   ```bash
   mv java-versions.json 001-java-versions.json
   mv kubernetes.json 002-kubernetes.json
   ```

2. **Update manifest**:
   ```bash
   npm run update-manifest
   ```

3. **Refresh browser** - new order appears immediately!

## 🔧 Troubleshooting

### Files Not Appearing in Correct Order
- Check manifest.json for correct order values
- Ensure prefixes are exactly 3 digits (001, not 1)
- Run `npm run update-manifest` to refresh

### Mixed Prefix and Non-Prefix Files
- Prefix files always appear first
- Non-prefix files are auto-assigned order numbers
- This is intentional behavior

### Custom Order Not Working
- Ensure `"method": "custom"` in manifest
- Check `customOrder` array contains exact filenames
- Verify files exist in content directory
