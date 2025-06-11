import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const server = new McpServer({
    name: "PDF Reader",
    version: "1.0.0"
});

server.tool(
    "read-pdf",
    { 
        file: z.string().describe("Path to the PDF file to extract text from")
    },
    async ({ file }) => {
        try {
            // Check if file exists
            if (!fs.existsSync(file)) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `Error: File not found: ${file}` 
                    }]
                };
            }

            // Check if file has .pdf extension
            if (!file.toLowerCase().endsWith('.pdf')) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `Error: File must have .pdf extension: ${file}` 
                    }]
                };
            }

            // Use require to load pdf-parse and avoid debug code
            const pdfParse = require("pdf-parse");

            // Read the PDF file
            const dataBuffer = fs.readFileSync(file);
            
            // Parse the PDF and extract text
            const data = await pdfParse(dataBuffer);
            
            // Return the extracted text with metadata
            const result = {
                filename: path.basename(file),
                pages: data.numpages,
                text: data.text.trim(),
                metadata: {
                    author: data.info?.Author || "Unknown",
                    title: data.info?.Title || "Unknown",
                    subject: data.info?.Subject || "Unknown",
                    creator: data.info?.Creator || "Unknown",
                    producer: data.info?.Producer || "Unknown",
                    creationDate: data.info?.CreationDate || "Unknown",
                    modificationDate: data.info?.ModDate || "Unknown"
                }
            };

            return {
                content: [{ 
                    type: "text", 
                    text: `Successfully extracted text from PDF: ${result.filename}

Number of pages: ${result.pages}

Metadata:
- Title: ${result.metadata.title}
- Author: ${result.metadata.author}
- Subject: ${result.metadata.subject}
- Creator: ${result.metadata.creator}
- Producer: ${result.metadata.producer}
- Creation Date: ${result.metadata.creationDate}
- Modification Date: ${result.metadata.modificationDate}

Extracted Text:
${result.text}` 
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

const transport = new StdioServerTransport();
await server.connect(transport);
