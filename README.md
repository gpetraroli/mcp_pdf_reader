# MCP PDF Reader

A Model Context Protocol (MCP) server that provides PDF text extraction functionality.

## Features

- Extract text content from PDF files
- Retrieve PDF metadata (title, author, pages, etc.)
- Error handling for invalid files and paths

## Installation

```bash
npm install
```

## Usage

This is an MCP server designed to be used with MCP-compatible clients. The server provides a `read-pdf` tool that accepts a file path and returns extracted text and metadata.

### Tool: `read-pdf`

**Parameters:**
- `file` (string): Path to the PDF file to extract text from

**Returns:**
- Extracted text content
- Number of pages
- PDF metadata (author, title, creation date, etc.)

## Dependencies

- `@modelcontextprotocol/sdk`: MCP SDK for server implementation
- `pdf-parse`: PDF text extraction library
- `zod`: Runtime type validation

## Configuration

### Cursor Integration

To use this MCP server with Cursor, add the following configuration to your Cursor settings:

```json
{
  "mcp": {
    "servers": {
        "mcp-gp-pdf-reader": {
        "command": "node",
        "args": ["<path-to-this-project>/index.js"]
        }
    }
  }
}
```

Replace `/path/to/mcp_gp_pdf_reader` with the actual path to your project directory.

## Running

The server uses stdio transport and is typically invoked by MCP clients rather than run directly. # pdf-reader-mcp
