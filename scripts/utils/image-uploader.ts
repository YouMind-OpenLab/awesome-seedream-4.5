import fetch from 'node-fetch';

const CMS_HOST = process.env.CMS_HOST;
const CMS_API_KEY = process.env.CMS_API_KEY;

/**
 * 上传图片到 CMS
 * @param imageUrl 原始图片 URL
 * @returns CMS 图片 URL
 */
export async function uploadImageToCMS(imageUrl: string): Promise<string> {
  try {
    // 下载图片
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // 从 URL 中提取文件名
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1].split('?')[0] || 'image.jpg';

    // 创建 FormData
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: contentType });
    formData.append('file', blob, filename);

    // 上传到 CMS
    const uploadResponse = await fetch(`${CMS_HOST}/api/media`, {
      method: 'POST',
      headers: {
        'Authorization': `users API-Key ${CMS_API_KEY}`,
      },
      body: formData as any,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Failed to upload image: ${uploadResponse.statusText} - ${errorText}`);
    }

    const data = await uploadResponse.json() as { doc: { url: string } };
    return `${CMS_HOST}${data.doc.url}`;
  } catch (error) {
    console.error('Error uploading image to CMS:', error);
    // 如果上传失败，返回原始 URL
    return imageUrl;
  }
}
