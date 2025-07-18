# MCP PDF Reader Enhanced

A comprehensive Model Context Protocol (MCP) server that provides advanced PDF text extraction, search, and analysis functionality.

## Features

### Core Functionality
- ✅ **Text Extraction**: Extract text content from PDF files with customizable options
- ✅ **Text Search**: Search for specific text within PDFs with advanced options
- ✅ **Metadata Extraction**: Retrieve comprehensive PDF metadata
- ✅ **Page-specific Processing**: Extract content from specific page ranges
- ✅ **Text Cleaning**: Normalize and clean extracted text
- ✅ **File Size Limits**: Protection against overly large files (50MB limit)
- ✅ **Async Processing**: Non-blocking file operations

### Advanced Features
- 🔄 **Multiple Tools**: 3 specialized tools for different PDF operations
- 🔍 **Smart Search**: Case-sensitive, whole-word, and regex search options
- 📊 **Rich Metadata**: Extract author, title, creation date, keywords, and more
- ⚡ **Performance**: Efficient processing with size limits and error handling
- 🛡️ **Security**: File validation and path sanitization

## Installation

```bash
npm install
```

## Tools Available

### 1. `read-pdf` - Enhanced PDF Reading
Extract text from PDF files with customizable options.

**Parameters:**
- `file` (string, required): Path to the PDF file
- `pages` (string, optional): Page range (e.g., '1-5', '1,3,5', 'all'). Default: 'all'
- `include_metadata` (boolean, optional): Include PDF metadata. Default: true
- `clean_text` (boolean, optional): Clean and normalize text. Default: false

**Example Usage:**
```javascript
// Basic extraction
{ "file": "/path/to/document.pdf" }

// Extract with clean text and no metadata
{ 
  "file": "/path/to/document.pdf", 
  "clean_text": true, 
  "include_metadata": false 
}
```

### 2. `search-pdf` - Search Within PDFs
Search for specific text within PDF documents.

**Parameters:**
- `file` (string, required): Path to the PDF file
- `query` (string, required): Text to search for
- `case_sensitive` (boolean, optional): Case sensitive search. Default: false
- `whole_word` (boolean, optional): Match whole words only. Default: false

**Example Usage:**
```javascript
// Case-insensitive search
{ "file": "/path/to/document.pdf", "query": "important term" }

// Whole word, case-sensitive search
{ 
  "file": "/path/to/document.pdf", 
  "query": "API", 
  "case_sensitive": true, 
  "whole_word": true 
}
```

### 3. `pdf-metadata` - Extract Metadata Only
Get comprehensive metadata from PDF files without extracting text.

**Parameters:**
- `file` (string, required): Path to the PDF file

**Returns:**
- Filename, file size, page count
- Author, title, subject, creator, producer
- Creation/modification dates, keywords
- Encryption status, PDF version

## Configuration

### Cursor Integration

Add to your Cursor settings:

```json
{
  "mcpServers": {
    "mcp-gp-pdf-reader": {
      "command": "node",
      "args": ["/absolute/path/to/mcp_gp_pdf_reader/index.js"]
    }
  }
}
```

## Future Enhancements

### Planned Features
- 🔮 **OCR Support**: Extract text from scanned/image-based PDFs
- 🔮 **Image Extraction**: Extract images from PDF documents
- 🔮 **Table Detection**: Identify and extract tabular data
- 🔮 **Form Data**: Extract form fields and values
- 🔮 **Password Support**: Handle password-protected PDFs
- 🔮 **Batch Processing**: Process multiple PDFs simultaneously
- 🔮 **Caching**: Cache parsed results for better performance
- 🔮 **Page-by-Page**: True page-specific text extraction

### Technical Improvements
- 🔧 **Streaming**: Handle very large PDFs with streaming
- 🔧 **Progress Tracking**: Progress indicators for long operations
- 🔧 **Resource Management**: Better memory usage optimization
- 🔧 **Configuration API**: Runtime configuration updates

## Usage Examples

### Basic Text Extraction
```bash
# Via MCP client
"Extract all text from /documents/report.pdf"
```

### Searching PDFs
```bash
# Via MCP client  
"Search for 'quarterly results' in /documents/financial-report.pdf"
```

### Getting Metadata
```bash
# Via MCP client
"Get metadata from /documents/contract.pdf"
```

## Development

### Requirements
- Node.js 18.0.0 or higher
- Memory: Sufficient for PDF file size + processing overhead
- Storage: Temporary space for file operations

## Contributing

This MCP server is designed to be extensible. Key areas for contribution:
- Additional PDF processing libraries integration
- Performance optimizations
- New extraction features
- Better error handling
- Test coverage

## License

MIT License
