import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const server = new McpServer({
    name: "PDF Reader",
    version: "1.0.0"
});

// Helper function to safely load PDF
async function loadPDF(filePath) {
    try {
        const stats = await fs.stat(filePath);
        if (stats.size > 50 * 1024 * 1024) { // 50MB limit
            throw new Error(`File too large: ${(stats.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 50MB.`);
        }
        
        const dataBuffer = await fs.readFile(filePath);
        const pdfParse = require("pdf-parse");
        return await pdfParse(dataBuffer);
    } catch (error) {
        throw new Error(`Failed to load PDF: ${error.message}`);
    }
}

// Helper function to validate file path
async function validatePDFPath(filePath) {
    try {
        await fs.access(filePath);
    } catch {
        throw new Error(`File not found: ${filePath}`);
    }
    
    if (!filePath.toLowerCase().endsWith('.pdf')) {
        throw new Error(`File must have .pdf extension: ${filePath}`);
    }
}

// Tool 1: Enhanced PDF reading with options
server.tool(
    "read-pdf",
    { 
        file: z.string().describe("Path to the PDF file to extract text from"),
        pages: z.string().optional().describe("Page range (e.g., '1-5', '1,3,5', 'all'). Default: 'all'"),
        include_metadata: z.boolean().optional().describe("Include PDF metadata in output. Default: true"),
        clean_text: z.boolean().optional().describe("Clean and normalize extracted text. Default: false")
    },
    async ({ file, pages = "all", include_metadata = true, clean_text = false }) => {
        try {
            await validatePDFPath(file);
            const data = await loadPDF(file);
            
            let extractedText = data.text;
            
            // Clean text if requested
            if (clean_text) {
                extractedText = extractedText
                    .replace(/\s+/g, ' ')  // Normalize whitespace
                    .replace(/\n\s*\n/g, '\n\n')  // Clean up line breaks
                    .trim();
            }
            
            const result = {
                filename: path.basename(file),
                fileSize: `${((await fs.stat(file)).size / 1024).toFixed(2)} KB`,
                pages: data.numpages,
                text: extractedText,
                metadata: include_metadata ? {
                    author: data.info?.Author || "Unknown",
                    title: data.info?.Title || "Unknown",
                    subject: data.info?.Subject || "Unknown",
                    creator: data.info?.Creator || "Unknown",
                    producer: data.info?.Producer || "Unknown",
                    creationDate: data.info?.CreationDate || "Unknown",
                    modificationDate: data.info?.ModDate || "Unknown",
                    keywords: data.info?.Keywords || "Unknown"
                } : null
            };

            let response = `Successfully extracted text from PDF: ${result.filename}\n`;
            response += `File size: ${result.fileSize}\n`;
            response += `Number of pages: ${result.pages}\n`;
            
            if (include_metadata && result.metadata) {
                response += `\nMetadata:\n`;
                Object.entries(result.metadata).forEach(([key, value]) => {
                    response += `- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
                });
            }
            
            response += `\nExtracted Text:\n${result.text}`;

            return {
                content: [{ 
                    type: "text", 
                    text: response
                }]
            };

        } catch (error) {
            return {
                content: [{ 
                    type: "text", 
                    text: `Error reading PDF file: ${error.message}` 
                }]
            };
        }
    }
);

// Tool 2: Search within PDF
server.tool(
    "search-pdf",
    {
        file: z.string().describe("Path to the PDF file to search in"),
        query: z.string().describe("Text to search for"),
        case_sensitive: z.boolean().optional().describe("Case sensitive search. Default: false"),
        whole_word: z.boolean().optional().describe("Match whole words only. Default: false")
    },
    async ({ file, query, case_sensitive = false, whole_word = false }) => {
        try {
            await validatePDFPath(file);
            const data = await loadPDF(file);
            
            let searchText = data.text;
            let searchQuery = query;
            
            if (!case_sensitive) {
                searchText = searchText.toLowerCase();
                searchQuery = searchQuery.toLowerCase();
            }
            
            const results = [];
            const lines = searchText.split('\n');
            
            lines.forEach((line, index) => {
                let searchLine = line;
                if (whole_word) {
                    const regex = new RegExp(`\\b${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, case_sensitive ? 'g' : 'gi');
                    if (regex.test(line)) {
                        results.push({
                            line: index + 1,
                            content: line.trim(),
                            matches: (line.match(regex) || []).length
                        });
                    }
                } else {
                    if (searchLine.includes(searchQuery)) {
                        results.push({
                            line: index + 1,
                            content: line.trim(),
                            matches: (searchLine.match(new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
                        });
                    }
                }
            });
            
            let response = `Search results for "${query}" in ${path.basename(file)}:\n`;
            response += `Found ${results.length} matching lines with ${results.reduce((sum, r) => sum + r.matches, 0)} total matches\n\n`;
            
            if (results.length > 0) {
                results.slice(0, 20).forEach(result => {  // Limit to first 20 results
                    response += `Line ${result.line} (${result.matches} matches): ${result.content}\n`;
                });
                
                if (results.length > 20) {
                    response += `\n... and ${results.length - 20} more results`;
                }
            } else {
                response += "No matches found.";
            }
            
            return {
                content: [{ 
                    type: "text", 
                    text: response
                }]
            };
            
        } catch (error) {
            return {
                content: [{ 
                    type: "text", 
                    text: `Error searching PDF file: ${error.message}` 
                }]
            };
        }
    }
);

// Tool 3: Get PDF metadata only
server.tool(
    "pdf-metadata",
    {
        file: z.string().describe("Path to the PDF file to get metadata from")
    },
    async ({ file }) => {
        try {
            await validatePDFPath(file);
            const data = await loadPDF(file);
            const stats = await fs.stat(file);
            
            const metadata = {
                filename: path.basename(file),
                fileSize: `${(stats.size / 1024).toFixed(2)} KB`,
                pages: data.numpages,
                author: data.info?.Author || "Unknown",
                title: data.info?.Title || "Unknown",
                subject: data.info?.Subject || "Unknown",
                creator: data.info?.Creator || "Unknown",
                producer: data.info?.Producer || "Unknown",
                creationDate: data.info?.CreationDate || "Unknown",
                modificationDate: data.info?.ModDate || "Unknown",
                keywords: data.info?.Keywords || "Unknown",
                encrypted: data.info?.IsEncrypted || false,
                version: data.version || "Unknown"
            };
            
            let response = `PDF Metadata for: ${metadata.filename}\n\n`;
            Object.entries(metadata).forEach(([key, value]) => {
                const displayKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                response += `${displayKey}: ${value}\n`;
            });
            
            return {
                content: [{ 
                    type: "text", 
                    text: response
                }]
            };
            
        } catch (error) {
            return {
                content: [{ 
                    type: "text", 
                    text: `Error reading PDF metadata: ${error.message}` 
                }]
            };
        }
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);
