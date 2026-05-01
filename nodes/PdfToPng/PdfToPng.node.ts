import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { pdfToPng } from 'pdf-to-png-converter';

export class PdfToPng implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PDF to PNG',
		name: 'pdfToPng',
		icon: 'file:pdfToPng.svg',
		group: ['transform'],
		version: 1,
		description: 'Convert PDF pages to PNG images',
		defaults: {
			name: 'PDF to PNG',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		properties: [
			{
				displayName: 'Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				description: 'Name of the binary property containing the PDF file',
			},
			{
				displayName: 'Scale',
				name: 'viewportScale',
				type: 'number',
				default: 2.0,
				description: 'Viewport scale factor. 1.0 = native resolution, 2.0 = double (sharper), 3.0 = triple.',
				typeOptions: {
					minValue: 0.5,
					maxValue: 5.0,
					numberStepSize: 0.5,
				},
			},
			{
				displayName: 'Output Property',
				name: 'outputPropertyName',
				type: 'string',
				default: 'data',
				description: 'Name of the binary property to write the PNG output to',
			},
			{
				displayName: 'Page Range',
				name: 'pageRange',
				type: 'string',
				default: '',
				placeholder: '1-3 or 1,3,5',
				description: 'Pages to convert. Leave empty for all pages. Use "1-3" for a range or "1,3,5" for specific pages.',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const results: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex, 'data') as string;
				const viewportScale = this.getNodeParameter('viewportScale', itemIndex, 2.0) as number;
				const outputPropertyName = this.getNodeParameter('outputPropertyName', itemIndex, 'data') as string;
				const pageRange = this.getNodeParameter('pageRange', itemIndex, '') as string;

				const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
				const pdfBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);

				const options: { viewportScale: number; pagesToProcess?: number[] } = {
					viewportScale,
				};

				// Parse page range if provided
				if (pageRange.trim()) {
					const pages: number[] = [];
					const parts = pageRange.split(',');
					for (const part of parts) {
						const trimmed = part.trim();
						if (trimmed.includes('-')) {
							const [start, end] = trimmed.split('-').map(Number);
							if (!isNaN(start) && !isNaN(end)) {
								for (let i = start; i <= end; i++) {
									pages.push(i);
								}
							}
						} else {
							const num = Number(trimmed);
							if (!isNaN(num)) {
								pages.push(num);
							}
						}
					}
					if (pages.length > 0) {
						options.pagesToProcess = pages;
					}
				}

				const pngPages = await pdfToPng(pdfBuffer, options);

				const baseName = binaryData.fileName?.replace(/\.pdf$/i, '') || 'page';

				for (const page of pngPages) {
					const content = page.content ?? Buffer.alloc(0);
					const binary = await this.helpers.prepareBinaryData(
						Buffer.from(content),
						`${baseName}_${page.pageNumber}.png`,
						'image/png',
					);

					results.push({
						json: {
							pageNumber: page.pageNumber,
							width: page.width,
							height: page.height,
							totalPages: pngPages.length,
							sourceFile: binaryData.fileName || '',
						},
						binary: {
							[outputPropertyName]: binary,
						},
						pairedItem: { item: itemIndex },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					results.push({
						json: { error: (error as Error).message },
						pairedItem: { item: itemIndex },
					});
				} else {
					throw new NodeOperationError(this.getNode(), error as Error, {
						itemIndex,
					});
				}
			}
		}

		return [results];
	}
}
