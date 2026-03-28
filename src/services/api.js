import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
console.log(API_BASE_URL);

// Helper to parse lambda proxy response if needed
const parseResponse = (data) => {
  if (data && data.body) {
    if (typeof data.body === 'string') {
      try { return JSON.parse(data.body); } catch (e) { }
    }
    return data.body;
  }
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch (e) { }
  }
  return data;
};

// 1. Get presigned URL and resume_id
export const getUploadUrl = async (fileName, fileType) => {
  const response = await axios.post(`${API_BASE_URL}upload`, {
    file_name: fileName,
    file_type: fileType,
    fileName: fileName,
    contentType: fileType
  });
  return parseResponse(response.data);
};

// 2. Upload directly to S3 using fetch (NOT axios)
export const uploadToS3 = async (url, fields, file) => {
  const formData = new FormData();

  // ONLY use fields returned by backend
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // file MUST be last
  formData.append("file", file);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed: " + response.statusText);
  }
};

// Safely extract string values from raw DynamoDB structures in Javascript mapping
const extractDynamoString = (item) => {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    return item.S || item.s || Object.values(item)[0] || JSON.stringify(item);
  }
  return String(item);
};

// DTO standardizer for cleaning API response values before React handles it
const formatAnalysisResult = (rawResponse) => {
  const data = parseResponse(rawResponse);
  if (!data || data.error) return data;
  
  return {
    ...data,
    skills_found: (data.skills_found || []).map(extractDynamoString),
    missing_skills: (data.missing_skills || []).map(extractDynamoString),
    suggestions: (data.suggestions || []).map(extractDynamoString),
    skill_match: Math.round(Number(data.skill_match) || 0),
    ats_score: Math.round(Number(data.ats_score) || 0)
  };
};

// 3. Get analysis result (for polling)
export const getAnalysisResult = async (resumeId) => {
  const response = await axios.get(`${API_BASE_URL}analysis/${resumeId}`);
  return formatAnalysisResult(response.data);
};
