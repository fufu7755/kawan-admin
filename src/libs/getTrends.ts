// @ts-ignore
import googleTrends from 'google-trends-api';
import axios from 'axios';
import { validateUrl, fetchWithDomainValidation } from '@/helper/domainValidator';

const KEYWORDS_EVERYWHERE_API_KEY = process.env.KEYWORDS_EVERYWHERE_API_KEY; // 你需要在 .env 文件中配置

/**
 * 获取金融教育相关的 Google Trends 热门关键词
 */
export async function getFinanceEducationTrends(): Promise<string[]> {
  // 1. 先用 Google Trends
  const baseTopics = ['student loan', 'education loan', 'invest in education'];
  let allKeywords: Set<string> = new Set();

  const results = await googleTrends.relatedQueries({
    keyword: 'bitcoin',
    geo: 'US', // 可根据需要调整地区
    hl: 'en-US',
  });
  const data = JSON.parse(results);
  console.log(data);
  return data;
}

/**
 * 用 Keywords Everywhere API 获取关键词的搜索量等数据
 */
export async function getKeywordsEverywhereData(keywords: string[]): Promise<any[]> {
  if (!KEYWORDS_EVERYWHERE_API_KEY) throw new Error('Missing Keywords Everywhere API Key');
  
  const url = 'https://api.keywordseverywhere.com/v1/get_keyword_data';
  
  // 验证域名
  const validation = validateUrl(url);
  if (!validation.isValid) {
    throw new Error(`域名验证失败: ${validation.error}`);
  }
  
  const response = await axios.post(
    url,
    {
      country: 'us',
      currency: 'usd',
      dataSource: 'gkp',
      kw: keywords,
    },
    {
      headers: {
        'Authorization': KEYWORDS_EVERYWHERE_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.data;
}

/**
 * 综合方法：获取金融教育类热门关键词及其搜索量
 */
export async function getFinanceEducationKeywordsWithVolume() {
  const keywords = await getFinanceEducationTrends();
  if (keywords.length === 0) return [];
  const keywordData = await getKeywordsEverywhereData(keywords.slice(0, 20)); // 限制数量，防止API超限
  return keywords;
}
