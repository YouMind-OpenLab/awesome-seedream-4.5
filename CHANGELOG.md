# Changelog

## 2024-11-24 - Feature Enhancements

### ✨ New Features

#### 1. Multiple Images Support
- **Issue Template**: Changed from single `image_url` input to `image_urls` textarea
- **Format**: One URL per line
- **Sync Script**: Now parses multiple URLs and uploads all images to CMS
- **Storage**: Stored in `sourceMedia` array field

**Example**:
```
https://example.com/image1.jpg
https://example.com/image2.jpg
https://example.com/image3.jpg
```

#### 2. Extended Language Support
- **Added 22 languages** (previously 7):
  - English, Chinese (中文), Japanese (日本語), Korean (한국어)
  - Spanish, French, German, Italian, Portuguese, Russian
  - Arabic, Hindi, Thai, Vietnamese, Indonesian, Turkish
  - Polish, Dutch, Swedish, Norwegian, Danish, Finnish

- **Language Mapping**: Automatically converts display names to ISO codes
  - `"Chinese (中文)"` → `"zh"`
  - `"Japanese (日本語)"` → `"ja"`
  - `"Korean (한국어)"` → `"ko"`

#### 3. Issue Timestamp as Publish Date
- **Previous**: Used `new Date().toISOString()` (sync time)
- **Now**: Uses `issue.data.created_at` (issue creation time)
- **Benefit**: Accurate tracking of when prompt was submitted

### 🔧 Technical Changes

#### Modified Files

1. **`.github/ISSUE_TEMPLATE/submit-prompt.yml`**
   - Changed `image_url` (input) → `image_urls` (textarea)
   - Expanded language dropdown from 7 to 22 languages
   - Added native language names for clarity

2. **`scripts/sync-approved-to-cms.ts`**
   - Added `LANGUAGE_MAP` constant for language code mapping
   - Added `parseLanguage()` function
   - Changed `image_url` → `image_urls` in interface
   - Parse multiple URLs with `.split('\n')`
   - Upload images in parallel with `Promise.all()`
   - Fetch issue details to get `created_at` timestamp
   - Use `parseLanguage()` for language code conversion

3. **`docs/CONTRIBUTING.md`**
   - Updated to reflect multiple images support
   - Added list of all supported languages
   - Updated image requirements section

### 📊 Impact

- ✅ Users can now submit prompts with multiple generated images
- ✅ Better language support for international community
- ✅ More accurate publish timestamps
- ✅ Improved data quality in CMS

### 🔄 Migration Notes

- Existing single-image prompts remain compatible
- Old issues with `image_url` field will need manual handling
- New language codes are backward compatible

---

## Previous Updates

### 2024-11-23 - Initial Implementation
- Repository structure setup
- TypeScript scripts for README generation
- GitHub Actions workflows
- Issue templates for submissions
- CMS integration
- Multi-language documentation
