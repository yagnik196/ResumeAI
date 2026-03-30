import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Helper to parse Lambda Proxy responses.
 * Proxies wrap the actual response in a 'body' string.
 */
const parseResponse = (data) => {
  if (!data) return null;

  // Handle API Gateway Proxy structure
  if (data.body) {
    if (typeof data.body === 'string') {
      try {
        return JSON.parse(data.body);
      } catch (e) {
        console.warn('Failed to parse response body string:', e);
        return data.body;
      }
    }
    return data.body;
  }

  // Handle direct string response
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }

  return data;
};

/**
 * Normalizes DynamoDB string values (e.g., { S: "value" })
 */
const extractDynamoString = (item) => {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    // Check common DynamoDB JSON formats
    return item.S || item.s || Object.values(item)[0] || JSON.stringify(item);
  }
  return String(item);
};

/**
 * DTO standardizer for cleaning API response values.
 * Only formats data properties if they are present.
 */
const formatAnalysisResult = (rawResponse) => {
  const data = parseResponse(rawResponse);
  if (!data || data.error) return data;

  // If status is not completed, return early without defaulting values
  // This allows the poller to wait for the actual data.
  if (data.status && data.status !== 'completed') {
    return data;
  }

  // If we are here, either status is 'completed' or status is missing but we have some data
  return {
    ...data,
    skills_found: Array.isArray(data.skills_found) ? data.skills_found.map(extractDynamoString) : [],
    missing_skills: Array.isArray(data.missing_skills) ? data.missing_skills.map(extractDynamoString) : [],
    suggestions: Array.isArray(data.suggestions) ? data.suggestions.map(extractDynamoString) : [],
    skill_match: data.skill_match !== undefined ? Math.round(Number(data.skill_match)) : 0,
    ats_score: data.ats_score !== undefined ? Math.round(Number(data.ats_score)) : 0,
    status: data.status || 'completed' // Default to completed if data is present
  };
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

// 2. Upload directly to S3 using fetch
export const uploadToS3 = async (url, fields, file) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("file", file);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed: " + response.statusText);
  }
};

// 3. Get analysis result (for polling)
export const getAnalysisResult = async (resumeId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}analysis/${resumeId}`);
    return formatAnalysisResult(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      return { status: 'processing' }; // Treat 404 as still processing (not created yet)
    }
    throw error;
  }
};
