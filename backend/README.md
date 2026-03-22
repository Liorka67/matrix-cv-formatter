# CV Matrix Converter Backend - Phase 1 MVP

A minimal, working backend API that converts CV files (PDF/DOCX) into structured JSON format using OpenAI.

## Features

- ✅ File upload endpoint (PDF/DOCX only)
- ✅ Text extraction from PDF and DOCX files
- ✅ AI-powered CV structuring with OpenAI (deterministic settings)
- ✅ JSON validation and error handling
- ✅ Clean, modular architecture

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
NODE_ENV=development
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### 3. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

### 4. Test the API

Health check:
```bash
curl http://localhost:3003/api/health
```

Debug storage status:
```bash
curl http://localhost:3003/api/debug/storage
```

## API Endpoints

### 1. Health Check
```
GET /api/health
```

### 2. Upload CV File
```
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: CV file (PDF or DOCX)
- language: "he" or "en"
```

### 3. Process CV
```
POST /api/process/:uploadId
Content-Type: application/json

Body:
{
  "language": "he" or "en"
}
```

## Example Usage

### Using curl

1. **Upload a CV file:**
```bash
curl -X POST http://localhost:3003/api/upload \
  -F "file=@/path/to/cv.pdf" \
  -F "language=en"
```

Response:
```json
{
  "success": true,
  "uploadId": "123e4567-e89b-12d3-a456-426614174000",
  "filename": "cv.pdf",
  "size": 245760,
  "type": "application/pdf"
}
```

2. **Process the uploaded CV:**
```bash
curl -X POST http://localhost:3003/api/process/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{"language": "en"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "personal_details": {
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "+1-555-0123",
      "address": "123 Main St, City, State",
      "linkedin": "linkedin.com/in/johndoe"
    },
    "summary": "Experienced software developer with 5+ years...",
    "experience": [
      {
        "years": "2020-2023",
        "role": "Senior Software Developer",
        "company": "Tech Corp",
        "description": "Led development of web applications..."
      }
    ],
    "skills": ["JavaScript", "Python", "React", "Node.js"],
    "education": [
      {
        "degree": "Bachelor of Computer Science",
        "institution": "University of Technology",
        "year": "2019",
        "details": "Graduated Magna Cum Laude"
      }
    ],
    "languages": [
      {
        "name": "English",
        "level": "Native"
      }
    ],
    "additional": "Additional certifications and achievements..."
  },
  "metadata": {
    "processId": "456e7890-e89b-12d3-a456-426614174001",
    "language": "en",
    "processingTime": 3500,
    "extractedTextLength": 1250
  }
}
```

### Using Postman

1. **Upload CV:**
   - Method: POST
   - URL: `http://localhost:3003/api/upload`
   - Body: form-data
     - Key: `file`, Type: File, Value: Select your CV file
     - Key: `language`, Type: Text, Value: `en` or `he`

2. **Process CV:**
   - Method: POST
   - URL: `http://localhost:3003/api/process/{uploadId}`
   - Headers: `Content-Type: application/json`
   - Body: raw JSON
     ```json
     {
       "language": "en"
     }
     ```

3. **Debug Storage (optional):**
   - Method: GET
   - URL: `http://localhost:3003/api/debug/storage`
   - Shows current file storage status

## Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── uploadController.ts    # File upload handling
│   │   └── processController.ts   # CV processing workflow
│   ├── services/
│   │   ├── textExtractor.ts       # PDF/DOCX text extraction
│   │   └── aiService.ts           # OpenAI integration
│   ├── middleware/
│   │   ├── upload.ts              # Multer file upload config
│   │   └── errorHandler.ts        # Error handling middleware
│   ├── routes/
│   │   └── index.ts               # API routes
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   └── app.ts                     # Express app setup
├── uploads/                       # Temporary file storage
├── package.json
├── tsconfig.json
└── README.md
```

## Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common error codes:
- `400`: Bad request (invalid file format, missing parameters)
- `404`: File not found
- `413`: File too large (>10MB)
- `422`: Unprocessable entity (empty or corrupted file)
- `500`: Internal server error

## Development Notes

- Files are temporarily stored in `./uploads` directory
- Uploaded files are automatically cleaned up after processing
- OpenAI API uses deterministic settings (temperature=0) for consistent results
- All processing steps are logged to console for debugging
- The system supports both Hebrew and English CVs

## Next Steps (Future Phases)

- Content coverage validation
- Template engine for DOCX/PDF generation
- Frontend React application
- Audit trail and logging
- Production deployment features

## Troubleshooting

1. **"OPENAI_API_KEY environment variable is required"**
   - Make sure you've set your OpenAI API key in the `.env` file

2. **"Only PDF and DOCX files are allowed"**
   - Ensure you're uploading files with correct MIME types

3. **"Extracted text is too short or empty"**
   - The uploaded file might be corrupted or contain only images
   - Try with a different CV file that contains readable text

4. **Port already in use**
   - Change the PORT in `.env` file or stop other services using port 3003