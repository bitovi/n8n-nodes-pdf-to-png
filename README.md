# n8n-nodes-pdf-to-png

This is an n8n community node that lets you convert PDF files to PNG images in your n8n workflows.

The PDF to PNG node converts each page of a PDF document into a separate PNG image. It works with PDF files passed as binary data through your workflow, outputting one item per page with configurable resolution.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  
[Version History](#version-history)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Manual Installation

1. Make sure to allow community nodes with `N8N_COMMUNITY_PACKAGES_ENABLED=true`
2. Once logged in to your n8n web UI, go to `/settings/community-nodes`
3. Type `@bitovi/n8n-nodes-pdf-to-png` and click install

## Operations

The PDF to PNG node converts PDF pages to PNG images with the following parameters:

**Parameters:**
- **Binary Property**: Name of the binary property containing the PDF file (default: `data`)
- **Scale**: Viewport scale factor for output resolution (default: `2.0`, range: 0.5–5.0)
- **Page Range**: Pages to convert — leave empty for all pages, or use `1-3` for a range or `1,3,5` for specific pages
- **Output Property**: Name of the binary property for the PNG output (default: `data`)

**Output per page:**
- `json.pageNumber` — the page number
- `json.width` — image width in pixels
- `json.height` — image height in pixels
- `json.totalPages` — total pages converted
- `json.sourceFile` — original PDF filename
- `binary.data` — the PNG image

## Compatibility

- **Minimum n8n version**: 1.0.0
- **Node.js**: >=18.10
- **Tested with**: n8n 2.9.4

This node uses [pdf-to-png-converter](https://www.npmjs.com/package/pdf-to-png-converter) v3 with `pdfjs-dist` for PDF rendering and `@napi-rs/canvas` for image output.

## Usage

### Basic Workflow Example

1. **Get PDF**: Use a node like "Read Binary File", "HTTP Request", or "Gmail" to get your PDF as binary data
2. **PDF to PNG**: Add the PDF to PNG node — each page becomes a separate output item
3. **Process Results**: Use the PNG images in subsequent nodes (save to disk, send via email, pass to AI vision, etc.)

### Scale Guide

| Scale | Use Case |
|-------|----------|
| 1.0 | Fast previews, small file size |
| 2.0 | Good quality for most uses (default) |
| 3.0 | High quality for OCR or printing |
| 5.0 | Maximum quality, large files |

### Working with Binary Data

The node expects the PDF file as binary data in the input. Any node that outputs a PDF (HTTP Request, Read Binary File, Gmail attachments, Google Drive, etc.) will work. The node outputs one item per page, each with a PNG binary attached.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [pdf-to-png-converter](https://www.npmjs.com/package/pdf-to-png-converter) — the underlying conversion library

## Version History

### v0.1.0
- Initial release
- Convert PDF pages to PNG images
- Configurable viewport scale (0.5x–5.0x)
- Page range selection (all, range, or specific pages)
- One output item per page with metadata

## License

[MIT](./LICENSE.md)

