import 'dotenv/config';
import { Octokit } from '@octokit/rest';
import { createPrompt } from './utils/cms-client.js';
import { uploadImageToCMS } from './utils/image-uploader.js';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

interface IssueFields {
  prompt_title?: string;
  prompt?: string;
  description?: string;
  image_urls?: string;
  author_name?: string;
  author_link?: string;
  source_link?: string;
  language?: string;
}

// 语言名称到语言代码的映射
const LANGUAGE_MAP: Record<string, string> = {
  'English': 'en',
  'Chinese (中文)': 'zh',
  'Japanese (日本語)': 'ja',
  'Korean (한국어)': 'ko',
  'Spanish (Español)': 'es',
  'French (Français)': 'fr',
  'German (Deutsch)': 'de',
  'Italian (Italiano)': 'it',
  'Portuguese (Português)': 'pt',
  'Russian (Русский)': 'ru',
  'Arabic (العربية)': 'ar',
  'Hindi (हिन्दी)': 'hi',
  'Thai (ไทย)': 'th',
  'Vietnamese (Tiếng Việt)': 'vi',
  'Indonesian (Bahasa Indonesia)': 'id',
  'Turkish (Türkçe)': 'tr',
  'Polish (Polski)': 'pl',
  'Dutch (Nederlands)': 'nl',
  'Swedish (Svenska)': 'sv',
  'Norwegian (Norsk)': 'no',
  'Danish (Dansk)': 'da',
  'Finnish (Suomi)': 'fi',
};

function parseLanguage(languageName: string): string {
  return LANGUAGE_MAP[languageName] || 'en';
}

async function parseIssue(issueBody: string): Promise<IssueFields> {
  const fields: Record<string, string> = {};
  const lines = issueBody.split('\n');

  let currentField: string | null = null;
  let currentValue: string[] = [];

  for (const line of lines) {
    if (line.startsWith('### ')) {
      if (currentField) {
        fields[currentField] = currentValue.join('\n').trim();
      }
      currentField = line.replace('### ', '').toLowerCase().replace(/\s+/g, '_');
      currentValue = [];
    } else if (currentField) {
      currentValue.push(line);
    }
  }

  if (currentField) {
    fields[currentField] = currentValue.join('\n').trim();
  }

  return fields;
}

async function main() {
  try {
    const issueNumber = process.env.ISSUE_NUMBER;
    const issueBody = process.env.ISSUE_BODY || '';

    if (!issueNumber) {
      throw new Error('ISSUE_NUMBER not provided');
    }

    console.log(`📋 Processing approved issue #${issueNumber}...`);

    const fields = await parseIssue(issueBody);

    // 解析多张图片 URL（每行一个）
    const imageUrls = (fields.image_urls || '')
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    console.log(`📸 Uploading ${imageUrls.length} image(s) to CMS...`);
    const uploadedImages = await Promise.all(
      imageUrls.map(url => uploadImageToCMS(url))
    );

    // 获取 Issue 创建时间
    const issue = await octokit.issues.get({
      owner: process.env.GITHUB_REPOSITORY?.split('/')[0] || '',
      repo: process.env.GITHUB_REPOSITORY?.split('/')[1] || '',
      issue_number: parseInt(issueNumber),
    });

    console.log('📝 Creating prompt in CMS (no draft)...');
    const prompt = await createPrompt({
      title: fields.prompt_title || '',
      content: fields.prompt || '',
      description: fields.description || '',
      sourceLink: fields.source_link || '',
      sourceMedia: uploadedImages,
      author: {
        name: fields.author_name || '',
        link: fields.author_link || '',
      },
      language: parseLanguage(fields.language || 'English'),
      sourcePublishedAt: issue.data.created_at,
      sourceMeta: {
        github_issue: issueNumber,
      },
    });

    console.log(`✅ Created prompt in CMS: ${prompt?.id}`);

    // Close the issue
    await octokit.issues.update({
      owner: process.env.GITHUB_REPOSITORY?.split('/')[0] || '',
      repo: process.env.GITHUB_REPOSITORY?.split('/')[1] || '',
      issue_number: parseInt(issueNumber),
      state: 'closed',
    });

    console.log(`✅ Closed issue #${issueNumber}`);

  } catch (error) {
    console.error('❌ Error syncing approved issue:', error);
    process.exit(1);
  }
}

main();
