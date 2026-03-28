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

  if (response.status !== 204) {
    throw new Error("Upload failed");
  }
};

// 3. Get analysis result (for polling)
export const getAnalysisResult = async (resumeId) => {
  const response = await axios.get(`${API_BASE_URL}analysis/${resumeId}`);
  return parseResponse(response.data);
};
