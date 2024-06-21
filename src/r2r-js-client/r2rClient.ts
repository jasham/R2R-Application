// R2RClient.ts

import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';

import * as fs from 'fs';
import { UUID } from 'crypto';
import {
  R2RUpdatePromptRequest,
  R2RIngestDocumentsRequest,
  R2RIngestFilesRequest,
  R2RUpdateDocumentsRequest,
  R2RUpdateFilesRequest,
  R2RSearchRequest,
  R2RRAGRequest,
  R2RDeleteRequest,
  R2RAnalyticsRequest,
  R2RUsersOverviewRequest,
  R2RDocumentsOverviewRequest,
  R2RDocumentChunksRequest,
  R2RLogsRequest,
  GenerationConfig,
} from './models';

export class R2RClient {
  private axiosInstance: AxiosInstance;
  private baseUrl: string;

  constructor(baseURL: string, prefix: string = '/v1') {
    this.baseUrl = `${baseURL}${prefix}`;
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      transformRequest: [
        (data, headers) => {
          return JSON.stringify(data);
        },
      ],
    });
  }

  //TODO: This isn't implemented in the dashboard yet
  //NOQA
  async updatePrompt(request: R2RUpdatePromptRequest): Promise<any> {
    const response = await this.axiosInstance.post('/update_prompt', request);
    return response.data;
  }

  //NOQA
  async ingestDocuments(request: R2RIngestDocumentsRequest): Promise<any> {
    const response = await this.axiosInstance.post(
      '/ingest_documents',
      request
    );
    return response.data;
  }

  //NOQA
  // async ingestFiles(request: R2RIngestFilesRequest, filePaths: string[]): Promise<any> {
  //   const formData = new FormData();

  //   filePaths.forEach((filePath) => {
  //     formData.append('files', fs.createReadStream(filePath));
  //   });

  //   Object.entries(request).forEach(([key, value]) => {
  //     formData.append(key, JSON.stringify(value));
  //   });

  //   const response = await this.axiosInstance.post('/ingest_files', formData, {
  //     headers: formData.getHeaders(),
  //   });
  //   return response.data;
  // }

  //NOQA
  async updateDocuments(request: R2RUpdateDocumentsRequest): Promise<any> {
    const response = await this.axiosInstance.post(
      '/update_documents',
      request
    );
    return response.data;
  }

  // //NOQA
  async updateFiles(
    files: File[],
    documentIds: string[],
    metadatas?: Record<string, any>[]
  ): Promise<any> {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append('files', file, file.name);
    });

    const request: R2RUpdateFilesRequest = {
      metadatas: metadatas,
      document_ids: documentIds,
    };

    Object.entries(request).forEach(([key, value]) => {
      formData.append(key, JSON.stringify(value));
    });

    const response = await this.axiosInstance.post('/update_files', formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  //NOQA
  async search(request: R2RSearchRequest): Promise<any> {
    const response = await this.axiosInstance.post('/search', request);
    return response.data;
  }

  //NOQA
  async rag(request: R2RRAGRequest): Promise<any> {
    if (request.rag_generation_config?.stream) {
      return this.streamRag(request);
    } else {
      const response = await this.axiosInstance.post('/rag', request);
      return response.data;
    }
  }

  //NOQA
  private async *streamRag(
    request: R2RRAGRequest
  ): AsyncGenerator<string, void, unknown> {
    const response = await this.axiosInstance.post('/rag', request, {
      responseType: 'stream',
    });

    for await (const chunk of response.data) {
      yield chunk.toString();
    }
  }

  async delete(request: R2RDeleteRequest): Promise<any> {
    console.log('Request:', request);
    const response = await this.axiosInstance({
      method: 'delete',
      url: '/delete',
      data: {
        keys: request.keys,
        values: request.values,
      },
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  }

  async logs(request: R2RLogsRequest): Promise<any> {
    const payload = {
      ...request,
      log_type_filter:
        request.log_type_filter === undefined ? null : request.log_type_filter,
      max_runs_requested: request.max_runs_requested || 100,
    };

    const response = await this.axiosInstance.post('/logs', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  async appSettings(): Promise<any> {
    const response = await this.axiosInstance.get('/app_settings');
    return response.data;
  }

  async analytics(request: R2RAnalyticsRequest): Promise<any> {
    const response = await this.axiosInstance.post('/analytics', request, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  // TODO: This isn't implemented in the dashboard yet
  //NOQA
  async usersOverview(request: R2RUsersOverviewRequest): Promise<any> {
    const response = await this.axiosInstance.get('/users_overview', {
      params: request,
    });
    return response.data;
  }

  async documentsOverview(request: R2RDocumentsOverviewRequest): Promise<any> {
    const response = await this.axiosInstance.post(
      '/documents_overview',
      request,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async documentChunks(request: R2RDocumentChunksRequest): Promise<any> {
    const response = await this.axiosInstance.post(
      '/document_chunks',
      request,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }
}

export default R2RClient;
