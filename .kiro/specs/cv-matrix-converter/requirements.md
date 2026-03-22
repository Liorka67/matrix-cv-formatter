# Requirements Document

## Introduction

The CV Matrix Converter is a full-stack web application that transforms CV files (PDF or DOCX) into a standardized Matrix CV format. The system preserves all original information while restructuring it into a consistent JSON format, then generates downloadable DOCX and PDF outputs. This tool enables recruiters to standardize CVs for consistent evaluation and processing.

## Glossary

- **CV_Converter**: The main system that processes CV files
- **File_Processor**: Component that extracts text from PDF and DOCX files
- **AI_Service**: Component that calls external AI API to structure CV content
- **Template_Engine**: Component that generates DOCX files using templates
- **PDF_Generator**: Component that creates PDF files from structured data
- **Matrix_Format**: Standardized CV structure with specific JSON schema
- **Original_CV**: The uploaded PDF or DOCX file provided by user
- **Structured_CV**: The AI-processed CV in Matrix JSON format
- **Template_File**: DOCX template with placeholders for dynamic content replacement

## Requirements

### Requirement 1: File Upload and Validation

**User Story:** As a recruiter, I want to upload CV files in PDF or DOCX format, so that I can convert them to Matrix format.

#### Acceptance Criteria

1. THE CV_Converter SHALL accept only PDF and DOCX file formats
2. WHEN an unsupported file format is uploaded, THE CV_Converter SHALL display an error message
3. WHEN a valid file is uploaded, THE CV_Converter SHALL store the file temporarily for processing
4. THE CV_Converter SHALL validate file size limits to prevent system overload
5. WHEN file upload fails, THE CV_Converter SHALL provide clear error feedback to the user

### Requirement 2: Language Selection

**User Story:** As a recruiter, I want to select the CV language before processing, so that the output maintains the correct language.

#### Acceptance Criteria

1. THE CV_Converter SHALL provide Hebrew and English language options
2. THE CV_Converter SHALL require language selection before processing begins
3. WHEN language is selected, THE AI_Service SHALL maintain that language in all output
4. THE CV_Converter SHALL display the language selector prominently in the interface

### Requirement 3: Text Extraction

**User Story:** As a recruiter, I want the system to extract all text from uploaded CVs, so that no information is lost during processing.

#### Acceptance Criteria

1. WHEN a PDF file is uploaded, THE File_Processor SHALL extract all readable text content
2. WHEN a DOCX file is uploaded, THE File_Processor SHALL extract all text content including headers and footers
3. THE File_Processor SHALL preserve text formatting indicators where possible
4. WHEN text extraction fails, THE File_Processor SHALL return a descriptive error message
5. THE File_Processor SHALL handle password-protected files by requesting credentials or returning appropriate error

### Requirement 4: AI Processing and JSON Structure

**User Story:** As a recruiter, I want the AI to structure CV content into Matrix format, so that all CVs follow the same standard layout.

#### Acceptance Criteria

1. THE AI_Service SHALL process extracted text and return only valid JSON
2. THE AI_Service SHALL use the exact JSON schema: `{ "personal_details": "", "summary": "", "experience": [ { "years": "", "role": "", "description": "" } ], "skills": [], "education": "", "languages": [], "additional": "" }`
3. THE AI_Service SHALL preserve ALL information from the Original_CV
4. WHEN information does not fit standard sections, THE AI_Service SHALL include it in the "additional" field
5. THE AI_Service SHALL NOT generate or hallucinate information not present in the Original_CV
6. THE AI_Service SHALL maintain the selected language in all output fields

### Requirement 5: Content Preservation and Validation

**User Story:** As a recruiter, I want to ensure no CV information is lost during conversion, so that candidate evaluation remains complete and accurate.

#### Acceptance Criteria

1. THE CV_Converter SHALL compare original content with Structured_CV output
2. WHEN missing content is detected, THE CV_Converter SHALL retry AI processing with correction prompts
3. THE CV_Converter SHALL flag any content that cannot be categorized for manual review
4. THE CV_Converter SHALL maintain professional formatting standards in output
5. THE CV_Converter SHALL preserve dates, numbers, and technical terms exactly as written

### Requirement 6: Template Processing and Document Generation

**User Story:** As a recruiter, I want to generate standardized DOCX and PDF files, so that I can distribute consistent CV formats.

#### Acceptance Criteria

1. THE Template_Engine SHALL use DOCX templates with placeholders like {{personal_details}}, {{summary}}, {{experience}}
2. THE Template_Engine SHALL replace all placeholders with corresponding JSON data
3. THE Template_Engine SHALL handle array data (experience, skills, languages) with proper formatting
4. THE PDF_Generator SHALL create PDF files from the populated DOCX templates
5. WHEN template processing fails, THE Template_Engine SHALL return specific error details

### Requirement 7: User Interface and Preview

**User Story:** As a recruiter, I want a clean interface with preview capability, so that I can review conversions before downloading.

#### Acceptance Criteria

1. THE CV_Converter SHALL provide a clean, intuitive web interface
2. THE CV_Converter SHALL display upload button, language selector, and convert button prominently
3. WHEN conversion completes, THE CV_Converter SHALL show a preview of the Structured_CV
4. THE CV_Converter SHALL provide download buttons for both PDF and DOCX formats
5. THE CV_Converter SHALL show processing status during conversion

### Requirement 8: File Download and Output

**User Story:** As a recruiter, I want to download converted CVs in both PDF and DOCX formats, so that I can use them in different contexts.

#### Acceptance Criteria

1. WHEN conversion is complete, THE CV_Converter SHALL generate downloadable DOCX files
2. WHEN conversion is complete, THE CV_Converter SHALL generate downloadable PDF files
3. THE CV_Converter SHALL provide clear download links for both file formats
4. THE CV_Converter SHALL use descriptive filenames for downloaded files
5. WHEN download fails, THE CV_Converter SHALL display appropriate error messages

### Requirement 9: Multi-User Support and Deployment

**User Story:** As a recruitment team, I want multiple users to access the system simultaneously, so that our team can process CVs efficiently.

#### Acceptance Criteria

1. THE CV_Converter SHALL support concurrent user sessions
2. THE CV_Converter SHALL isolate user data to prevent cross-contamination
3. THE CV_Converter SHALL be deployable to cloud infrastructure
4. THE CV_Converter SHALL handle user session management securely
5. THE CV_Converter SHALL scale to accommodate multiple simultaneous conversions

### Requirement 10: Error Handling and System Reliability

**User Story:** As a recruiter, I want the system to handle errors gracefully, so that I can understand and resolve issues quickly.

#### Acceptance Criteria

1. WHEN any component fails, THE CV_Converter SHALL provide clear error messages
2. THE CV_Converter SHALL log errors for system monitoring and debugging
3. WHEN AI API calls fail, THE CV_Converter SHALL retry with exponential backoff
4. THE CV_Converter SHALL validate all inputs and outputs at system boundaries
5. WHEN system resources are exhausted, THE CV_Converter SHALL queue requests appropriately