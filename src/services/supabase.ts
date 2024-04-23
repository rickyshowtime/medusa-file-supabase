import * as fs from 'fs';
import { createReadStream } from 'fs';
import { StorageClient } from '@supabase/storage-js';
import {
  DeleteFileType,
  FileServiceGetUploadStreamResult,
  FileServiceUploadResult,
  GetUploadedFileType,
  UploadStreamDescriptorType,
} from '@medusajs/types';
import { Readable } from 'node:stream';
import { FileService } from 'medusa-interfaces';
import { parse } from 'path';
import stream from "stream"
import { finished } from 'stream/promises';

interface Options {
  api_url: string;
  storage_version: any;
  project_ref: string;
  service_key: string;
  bucket_name: string;
}

class SupabaseService extends FileService {
  project_ref: string;
  service_key: string;
  bucket_name: string;
  storage_api: string;
  storage_url: string;
  storage_version: any;

  constructor({}: any, options: Options) {
    super();
    this.project_ref = options.project_ref;
    this.service_key = options.service_key;
    this.bucket_name = options.bucket_name;
    this.storage_version = options.storage_version,
    this.storage_version = options.storage_version,
    this.storage_api = `${options.api_url}/storage/${this.storage_version}`;
    this.storage_url = `${this.storage_api}/object/public`; //ToDo: implement support for private bucket
  }

  storageClient() {
    return new StorageClient(
       this.storage_api,
      {
        apiKey: this.service_key,
        Authorization: `Bearer ${this.service_key}`,
      }
    );
  }

  async getUploadStreamDescriptor(fileData: UploadStreamDescriptorType) {
    const pass = new stream.PassThrough();
    const chunks: Buffer[] = [];

    const fileKey = `exports/${fileData.name}-${Date.now()}${fileData.ext}`;
    console.log('Initialized upload with fileKey:', fileKey);

    // Promise to handle the complete process of buffering and uploading
    const uploadPromise = new Promise(async (resolve, reject) => {
      // Collect data into a buffer
      pass.on('data', (chunk) => {
          chunks.push(chunk);
          console.log('Received chunk with length:', chunk.length);
      });

      try {
        console.log('Waiting for all data to be passed...');
        await finished(pass);
        console.log('All data has been received.');

        // Combine all chunks into a single buffer
        const buffer = Buffer.concat(chunks);
        console.log('Buffer created, size:', buffer.length);

        // Execute the upload
        console.log('Starting upload to Supabase...');
        const { data, error } = await this.storageClient()
            .from(this.bucket_name)
            .upload(fileKey, buffer, { contentType: fileData.contentType as string});

        if (error) {
            console.error('Upload failed:', error);
            reject(error);
        } else {
            console.log('Upload successful:', data.path);
            resolve({ success: true, path: data.path });
        }
    } catch (error) {
        console.error('Error during upload process:', error);
        reject(error);
    }
    });

    return {
      writeStream: pass,
      promise: uploadPromise,
      url: `${this.storage_url}/${this.bucket_name}/${fileKey}`,
      fileKey
    };
  }


  async getDownloadStream({
      fileKey,
      isPrivate = true,
    }: GetUploadedFileType
  ): Promise<NodeJS.ReadableStream> {
    const { data, error } = await this.storageClient()
      .from(this.bucket_name).download(fileKey);

    if (error) {
      console.log(error);
      throw error;
    }

    try {
      const buffer = Buffer.from(await data.arrayBuffer());
      return Readable.from(buffer);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }


  // @ts-ignore
  async upload(fileData: Express.Multer.File): Promise<FileServiceUploadResult>  {
    const parsedFilename = parse(fileData.originalname)

    const filePath = `${parsedFilename.name}-${Date.now()}${parsedFilename.ext}`

    const { data, error } = await this.storageClient()
      .from(this.bucket_name).upload(filePath, createReadStream(fileData.path), { duplex: "half" });

    if (error) {
      console.log(error);
      throw error;
    }

    return {
      url: `${this.storage_url}/${this.bucket_name}/${data.path}`,
      key: data.path
    }
  }

  // @ts-ignore
  async delete(
    fileData: DeleteFileType
  ): Promise<void> {
    try {
      await this.storageClient().from(this.bucket_name).remove([fileData.fileKey]);
    } catch (error) {
      throw error;
    }
  }
}

export default SupabaseService;
