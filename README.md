# 📄 Serverless AI Resume Analyzer

An intelligent, AWS-powered, serverless web application that analyzes PDF resumes against job roles, providing actionable feedback, ATS scores, and skill match percentages. Built with a modern React frontend and a completely serverless AWS backend architecture.

## ✨ Features

- **Direct-to-S3 Uploads**: Secure, high-performance file uploading directly to AWS S3 using presigned POST URLs (bypassing the API gateway to support large files and reduce latency).
- **AI-Powered Analysis**: Extracts skills, checks for critical missing keywords, and automatically scores resumes for ATS (Applicant Tracking System) compatibility.
- **Asynchronous Processing**: Non-blocking architecture that leverages a polling mechanism to retrieve data securely only after AWS Lambda has finished processing.
- **Dynamic Scoring Dashboard**: Displays ATS scores, role matching percentages, skills found, missing skills, and detailed suggestions for improvement.
- **Modern UI/UX**: Responsive, interactive, and beautifully designed user interface built with Tailwind CSS.

## 🏗️ Architecture Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios & Fetch API (for seamless FormData S3 uploads)

### Backend (AWS Serverless)
- **AWS S3**: Storage of uploaded raw PDF resumes.
- **AWS Lambda**: Serverless compute executing extraction, upload presigning, and database retrieval.
- **Amazon DynamoDB**: NoSQL database storing analysis metrics and extracted insights.
- **API Gateway**: Exposes secure endpoints for frontend interaction.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- Configure your AWS Backend and obtain your API Gateway/Function URL

<!-- ### Installation

1. Clone the repository
   ```bash
   git clone <your-repository-url>
   cd Resume_analyzer
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure Environment Variables
   Create a `.env` file in the root directory and add your backend API URL:
   ```env
   VITE_BACKEND_URL=https://your-api-id.execute-api.region.amazonaws.com/
   ```
   *(Note: The `.env` file is included in `.gitignore` to keep credentials secure)*

4. Start the development server
   ```bash
   npm run dev
   ```

## 🔌 API Integration Details

The frontend interfaces with three primary backend endpoints:
1. `POST /upload`: Securely requests an S3 Presigned URL for the PDF upload.
2. **S3 Direct Upload**: Frontend directly pushes the document via `FormData` to the Amazon S3 bucket.
3. `GET /analysis/{resume_id}`: Frontend systematically polls this endpoint to fetch the JSON report containing ATS scores, missing/found skills, and actionable recommendations directly from DynamoDB.

## 🤝 Contribution Guidelines
This project is open for exploration and improvements. Feel free to fork, optimize the UI, or expand the AI features by submitting a pull request! -->
