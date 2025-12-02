import 'dotenv/config';
import fs from 'fs';
import { fetchAllPrompts, sortPrompts } from './utils/cms-client.js';
import { generateMarkdown, SUPPORTED_LANGUAGES } from './utils/markdown-generator.js';

async function main() {
  try {
    // Loop through all supported languages
    for (const lang of SUPPORTED_LANGUAGES) {
      console.log(`\n🌐 Processing language: ${lang.name} (${lang.code})...`);
      
      console.log(`  📥 Fetching prompts from CMS (locale: ${lang.code})...`);
      // CMS might use different locale codes than our config, but assuming they match based on user input
      // If 'en' fails but 'en-US' works, we might need a mapping, but user provided specific list.
      const prompts = await fetchAllPrompts(lang.code);

      console.log(`  ✅ Fetched ${prompts.length} prompts`);

      console.log('  🔃 Sorting prompts...');
      const sorted = sortPrompts(prompts);

      console.log('  📝 Generating README...');
      const markdown = generateMarkdown(sorted, lang.code);

      console.log(`  💾 Writing ${lang.readmeFileName}...`);
      fs.writeFileSync(lang.readmeFileName, markdown, 'utf-8');

      console.log(`  ✅ ${lang.readmeFileName} updated successfully!`);
      console.log(`  📊 Stats: ${sorted.all.length} total, ${sorted.featured.length} featured`);
    }
    
    console.log('\n✨ All languages processed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
