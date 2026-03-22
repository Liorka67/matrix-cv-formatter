# Implementation Plan: CV Matrix Converter

## Overview

This implementation plan follows a 7-phase approach to build the CV Matrix Converter system incrementally, starting with a working MVP and gradually adding enterprise features. Each phase builds upon the previous one, ensuring a working system at every stage.

**Technology Stack**: TypeScript/Node.js backend with React frontend
**Architecture**: Modular design with clear separation between AI, validation, and template processing
**Goal**: Working MVP first, then gradual enhancement to enterprise level

## Project Structure

```
cv-matrix-converter/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── app.ts
│   ├── templates/
│   │   ├── hebrew-rtl-template.docx
│   │   └── english-template.docx
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## Tasks

### PHASE 1 – Core Backend MVP (End-to-End Working System)

- [x] 1. Set up project structure and dependencies
  - Create backend and frontend directories with TypeScript configuration
  - Install core dependencies: Express, multer, pdf-parse, docx, openai
  - Set up basic Express server with CORS and file upload middleware
  - _Requirements: 1.1, 1.3_

- [ ] 2. Implement file upload endpoint
  - [x] 2.1 Create file upload controller with format validation
    - Accept only PDF and DOCX files with size limits
    - Store files temporarily with unique identifiers
    - Return upload confirmation with file metadata
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ]* 2.2 Write unit tests for file upload validation
    - Test supported formats, file size limits, and error responses
    - _Requirements: 1.1, 1.2, 1.4_

- [ ] 3. Implement basic text extraction service
  - [x] 3.1 Create text extractor with PDF support
    - Use pdf-parse library for PDF text extraction
    - Extract text content and basic metadata
    - Handle extraction errors gracefully
    - _Requirements: 3.1, 3.4_
  
  - [x] 3.2 Add DOCX text extraction
    - Extract text from DOCX files including headers/footers
    - Preserve basic formatting indicators
    - _Requirements: 3.2, 3.3_
  
  - [ ]* 3.3 Write unit tests for text extraction
    - Test PDF and DOCX extraction with sample files
    - Test error handling for corrupted files
    - _Requirements: 3.1, 3.2, 3.4_

- [ ] 4. Implement AI service integration
  - [x] 4.1 Create OpenAI service with deterministic settings
    - Configure OpenAI client with temperature=0 for consistency
    - Implement CV structuring with Matrix JSON schema
    - Add JSON validation for AI responses
    - _Requirements: 4.1, 4.2, 4.6_
  
  - [x] 4.2 Define Matrix CV data models
    - Create TypeScript interfaces for MatrixCV schema
    - Implement JSON schema validation
    - _Requirements: 4.2_
  
  - [ ]* 4.3 Write unit tests for AI service
    - Test JSON schema validation and error handling
    - Mock OpenAI responses for consistent testing
    - _Requirements: 4.1, 4.2_

- [ ] 5. Create process CV endpoint
  - [x] 5.1 Implement main processing workflow
    - Extract text from uploaded file
    - Process with AI service to get structured CV
    - Return structured JSON response
    - _Requirements: 4.3, 4.4_
  
  - [x] 5.2 Add basic error handling
    - Handle file processing errors
    - Handle AI API failures with simple retry
    - Return appropriate error responses
    - _Requirements: 10.1, 10.3_
  
  - [ ]* 5.3 Write integration tests for processing workflow
    - Test end-to-end CV processing with sample files
    - Test error scenarios and recovery
    - _Requirements: 4.3, 4.4, 10.1_

- [x] 6. Checkpoint - Core Backend MVP Complete
  - Ensure all tests pass, verify end-to-end processing works
  - Test with sample PDF and DOCX files
  - Confirm JSON output matches Matrix schema

### PHASE 2 – Validation Layer

- [ ] 7. Implement content coverage mechanism
  - [x] 7.1 Create tokenization service
    - Implement text tokenization preserving technical terms
    - Support Hebrew and English character sets
    - Filter stop words and normalize tokens
    - _Requirements: 5.1, 5.5_
  
  - [x] 7.2 Build coverage analyzer
    - Calculate coverage score by comparing original vs structured tokens
    - Identify missing content with context
    - Determine when retry is needed (score < 95%)
    - _Requirements: 5.1, 5.2_
  
  - [ ]* 7.3 Write property test for coverage analysis
    - **Property 7: Content Coverage and Preservation**
    - **Validates: Requirements 5.1, 5.2, 5.5**
  
  - [ ]* 7.4 Write unit tests for tokenization
    - Test Hebrew and English tokenization accuracy
    - Test technical term preservation
    - _Requirements: 5.5_

- [ ] 8. Add smart retry logic for missing content
  - [x] 8.1 Implement partial retry mechanism
    - Build targeted prompts for missing content sections
    - Merge partial results without duplication
    - Limit retry attempts to prevent infinite loops
    - _Requirements: 5.2, 5.3_
  
  - [x] 8.2 Integrate coverage analysis with processing
    - Trigger retry when coverage score < 95%
    - Update processing endpoint to use coverage validation
    - _Requirements: 5.1, 5.2_
  
  - [ ]* 8.3 Write property test for smart retry logic
    - **Property 8: Smart Content Coverage Analysis**
    - **Validates: Requirements 5.1, 5.2**

- [ ] 9. Add comprehensive logging
  - [x] 9.1 Implement structured logging service
    - Log original text vs AI output comparisons
    - Track coverage scores and retry attempts
    - Log processing times and token usage
    - _Requirements: 10.2_
  
  - [x] 9.2 Add audit trail basics
    - Store processing history with timestamps
    - Track file metadata and processing results
    - _Requirements: 10.2_

- [x] 10. Checkpoint - Validation Layer Complete
  - Ensure coverage analysis works correctly
  - Verify retry logic improves content preservation
  - Test logging captures all processing steps

### PHASE 3 – Template Engine

- [ ] 11. Implement DOCX template processing
  - [ ] 11.1 Create template engine service
    - Use docxtemplater for placeholder replacement
    - Support basic placeholders like {{personal_details}}, {{summary}}
    - Handle simple text replacement
    - _Requirements: 6.1, 6.2_
  
  - [ ] 11.2 Add array data support
    - Process experience array with proper formatting
    - Handle skills, education, and languages arrays
    - Support nested object properties
    - _Requirements: 6.3_
  
  - [ ]* 11.3 Write unit tests for template processing
    - Test placeholder replacement with sample data
    - Test array formatting and nested objects
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 12. Create language-specific templates
  - [ ] 12.1 Design Hebrew RTL template
    - Create DOCX template with RTL formatting
    - Set Hebrew fonts and right-to-left alignment
    - Include all Matrix CV sections with proper placeholders
    - _Requirements: 2.1, 6.1_
  
  - [ ] 12.2 Design English LTR template
    - Create standard left-to-right DOCX template
    - Use professional fonts and formatting
    - Mirror Hebrew template structure for consistency
    - _Requirements: 2.1, 6.1_
  
  - [ ]* 12.3 Write unit tests for template selection
    - Test correct template selection based on language
    - Test RTL vs LTR formatting preservation
    - _Requirements: 2.1, 2.3_

- [ ] 13. Integrate template processing with main workflow
  - [ ] 13.1 Add document generation endpoint
    - Create endpoint to generate DOCX from structured CV
    - Support language parameter for template selection
    - Return downloadable file URL
    - _Requirements: 6.4, 8.1_
  
  - [ ] 13.2 Add file storage and cleanup
    - Store generated files temporarily
    - Implement cleanup for expired files
    - Generate unique filenames
    - _Requirements: 8.4_
  
  - [ ]* 13.3 Write integration tests for document generation
    - Test DOCX generation with Hebrew and English content
    - Test file storage and retrieval
    - _Requirements: 6.4, 8.1, 8.4_

- [ ] 14. Checkpoint - Template Engine Complete
  - Verify DOCX generation works for both languages
  - Test template placeholder replacement
  - Confirm file download functionality

### PHASE 4 – PDF Generation

- [ ] 15. Implement PDF conversion
  - [ ] 15.1 Add PDF generation service
    - Use puppeteer or similar for DOCX to PDF conversion
    - Maintain formatting consistency from DOCX
    - Handle Hebrew RTL content in PDF output
    - _Requirements: 8.2_
  
  - [ ] 15.2 Integrate PDF generation with document endpoint
    - Extend generation endpoint to support PDF format
    - Generate both DOCX and PDF simultaneously
    - Return URLs for both formats
    - _Requirements: 8.1, 8.2_
  
  - [ ]* 15.3 Write unit tests for PDF generation
    - Test PDF creation from DOCX templates
    - Test formatting preservation in PDF output
    - _Requirements: 8.2_

- [ ] 16. Add download management
  - [ ] 16.1 Implement download endpoints
    - Create secure download URLs with expiration
    - Support both DOCX and PDF downloads
    - Add proper content-type headers
    - _Requirements: 8.3, 8.4_
  
  - [ ] 16.2 Add file metadata and naming
    - Generate descriptive filenames based on CV content
    - Include language and format in filename
    - _Requirements: 8.4_
  
  - [ ]* 16.3 Write integration tests for download functionality
    - Test secure download URL generation
    - Test file expiration and cleanup
    - _Requirements: 8.3, 8.4_

- [ ] 17. Checkpoint - PDF Generation Complete
  - Verify PDF generation maintains formatting
  - Test download functionality for both formats
  - Confirm file cleanup works properly

### PHASE 5 – Frontend (React)

- [ ] 18. Set up React frontend structure
  - [x] 18.1 Create React app with TypeScript
    - Set up React project with TypeScript configuration
    - Install UI dependencies: Material-UI or similar
    - Configure API client for backend communication
    - _Requirements: 7.1, 7.2_
  
  - [x] 18.2 Create shared types and interfaces
    - Define TypeScript interfaces matching backend models
    - Create API response types
    - Set up error handling types
    - _Requirements: 7.1_

- [ ] 19. Implement file upload component
  - [x] 19.1 Create upload interface
    - Build drag-and-drop file upload component
    - Add file format validation on frontend
    - Show upload progress and status
    - _Requirements: 1.1, 1.2, 7.2_
  
  - [ ] 19.2 Add language selector
    - Create language selection component (Hebrew/English)
    - Require language selection before processing
    - Store language preference
    - _Requirements: 2.1, 2.2, 7.2_
  
  - [ ]* 19.3 Write unit tests for upload component
    - Test file validation and upload functionality
    - Test language selection requirements
    - _Requirements: 1.1, 1.2, 2.2_

- [ ] 20. Create processing and status display
  - [x] 20.1 Implement process button and status
    - Add convert button to trigger processing
    - Show processing status with progress indicators
    - Display coverage scores and retry information
    - _Requirements: 7.3, 7.5_
  
  - [ ] 20.2 Add error handling and user feedback
    - Display clear error messages for failures
    - Show retry attempts and coverage improvements
    - Provide actionable error resolution steps
    - _Requirements: 10.1, 7.5_
  
  - [ ]* 20.3 Write unit tests for processing UI
    - Test status display and progress indicators
    - Test error message display
    - _Requirements: 7.3, 7.5, 10.1_

- [ ] 21. Implement basic preview screen
  - [x] 21.1 Create CV preview component
    - Display structured CV data in readable format
    - Show coverage score and processing metadata
    - Support Hebrew RTL and English LTR display
    - _Requirements: 7.4_
  
  - [x] 21.2 Add download buttons
    - Provide download buttons for DOCX and PDF
    - Show file generation status
    - Handle download errors gracefully
    - _Requirements: 8.3, 7.4_
  
  - [ ]* 21.3 Write unit tests for preview component
    - Test CV data display and formatting
    - Test download button functionality
    - _Requirements: 7.4, 8.3_

- [x] 22. Checkpoint - Frontend MVP Complete
  - Verify complete end-to-end user workflow
  - Test file upload, processing, and download
  - Confirm UI works for both Hebrew and English

### PHASE 6 – Editable Preview

- [ ] 23. Implement editable CV fields
  - [ ] 23.1 Create editable form components
    - Convert preview display to editable form fields
    - Support text inputs for personal details and summary
    - Handle array editing for experience, skills, education
    - _Requirements: 7.4_
  
  - [ ] 23.2 Add real-time validation
    - Validate field formats (email, phone) as user types
    - Show validation errors and warnings
    - Prevent invalid data submission
    - _Requirements: 7.4_
  
  - [ ]* 23.3 Write unit tests for editable components
    - Test field editing and validation
    - Test array manipulation (add/remove items)
    - _Requirements: 7.4_

- [ ] 24. Implement coverage score updates
  - [ ] 24.1 Add edit tracking service
    - Track user modifications to CV fields
    - Recalculate coverage score after edits
    - Show coverage improvement/degradation
    - _Requirements: 5.1_
  
  - [ ] 24.2 Create edit history display
    - Show what fields were modified by user
    - Display before/after values for transparency
    - Allow reverting individual changes
    - _Requirements: 5.1_
  
  - [ ]* 24.3 Write property test for editable preview validation
    - **Property 20: Editable Preview Validation**
    - **Validates: Enterprise editable preview requirements**

- [ ] 25. Update backend for edit support
  - [ ] 25.1 Add CV update endpoint
    - Create endpoint to save edited CV data
    - Validate edited data against schema
    - Recalculate coverage score server-side
    - _Requirements: 5.1_
  
  - [ ] 25.2 Extend audit trail for edits
    - Log all user modifications with timestamps
    - Track coverage score changes
    - Store edit history for compliance
    - _Requirements: 10.2_
  
  - [ ]* 25.3 Write integration tests for edit functionality
    - Test CV updates and validation
    - Test audit trail creation for edits
    - _Requirements: 5.1, 10.2_

- [ ] 26. Checkpoint - Editable Preview Complete
  - Verify users can edit CV fields successfully
  - Test coverage score updates after edits
  - Confirm edit history tracking works

### PHASE 7 – Production Features

- [ ] 27. Implement comprehensive audit trail storage
  - [ ] 27.1 Create audit database schema
    - Design database tables for audit entries
    - Store original text, AI output, and final documents
    - Include processing metadata and timestamps
    - _Requirements: 10.2_
  
  - [ ] 27.2 Add audit trail service
    - Implement complete audit trail creation
    - Store encrypted audit data with retention policies
    - Create audit trail retrieval endpoints
    - _Requirements: 10.2_
  
  - [ ]* 27.3 Write property test for audit trail completeness
    - **Property 19: Audit Trail Completeness**
    - **Validates: Enterprise audit requirements**

- [ ] 28. Add template versioning system
  - [ ] 28.1 Implement template version management
    - Create template repository with version control
    - Support multiple template versions per language
    - Add template migration capabilities
    - _Requirements: 6.1_
  
  - [ ] 28.2 Add template compatibility checking
    - Check data compatibility with template versions
    - Automatically migrate data when needed
    - Handle migration failures gracefully
    - _Requirements: 6.1_
  
  - [ ]* 28.3 Write property test for template versioning
    - **Property 10: Template Versioning and Compatibility**
    - **Validates: Requirements 6.1, 6.2, 6.3**

- [ ] 29. Enhance error handling and monitoring
  - [ ] 29.1 Implement comprehensive error handling
    - Add structured error responses with error codes
    - Implement exponential backoff for API retries
    - Add circuit breaker pattern for external services
    - _Requirements: 10.1, 10.3, 10.5_
  
  - [ ] 29.2 Add monitoring and alerting
    - Implement health check endpoints
    - Add performance metrics collection
    - Set up error rate monitoring and alerting
    - _Requirements: 10.2_
  
  - [ ]* 29.3 Write property test for error handling
    - **Property 15: Comprehensive Error Handling and Logging**
    - **Validates: Requirements 10.1, 10.2**

- [ ] 30. Add multi-user support and session management
  - [ ] 30.1 Implement session isolation
    - Add user session management
    - Isolate user data to prevent cross-contamination
    - Support concurrent processing requests
    - _Requirements: 9.1, 9.2_
  
  - [ ] 30.2 Add user authentication (optional)
    - Implement basic authentication if required
    - Add user-specific audit trails
    - Support user preferences and history
    - _Requirements: 9.1_
  
  - [ ]* 30.3 Write property test for concurrent user support
    - **Property 14: Concurrent User Session Isolation**
    - **Validates: Requirements 9.1, 9.2**

- [ ] 31. Final system integration and testing
  - [ ] 31.1 Comprehensive integration testing
    - Test complete workflows with all features enabled
    - Verify audit trail completeness across all operations
    - Test error recovery and system resilience
    - _Requirements: All_
  
  - [ ] 31.2 Performance optimization
    - Optimize file processing and AI API calls
    - Implement caching for frequently accessed data
    - Add request queuing for high load scenarios
    - _Requirements: 10.5_
  
  - [ ]* 31.3 Write property tests for system integration
    - **Property 1: Comprehensive File Format Validation**
    - **Property 16: Deterministic AI Processing with Retry Logic**
    - **Validates: Requirements 1.1, 1.2, 10.3**

- [ ] 32. Final checkpoint - Production Ready System
  - Ensure all tests pass including property-based tests
  - Verify system handles enterprise load requirements
  - Confirm audit trail and compliance features work
  - Document deployment and configuration requirements

## Notes

- Tasks marked with `*` are optional testing tasks that can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Checkpoints ensure incremental validation and allow for user feedback
- The system is designed to be working and deployable after each phase
- Focus on minimal viable implementation in early phases, with enterprise features added progressively