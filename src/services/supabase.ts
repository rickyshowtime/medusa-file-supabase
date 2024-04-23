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
import path from 'path';

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
    const tempPath = path.resolve('exports'); // Absolute path to avoid path confusion

    // Ensure the temporary storage directory exists
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
      console.log('Created directory:', tempPath);
    }

    const filename = fileData.name + (fileData.ext ? `.${fileData.ext}` : "");
    const filePath = path.join(tempPath, `${filename}`);

    // Ensure directory exists where the file will be stored
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
        console.log("Created missing directory:", directory);
    }

    // Collect data into a temporary file
    const writeStream = fs.createWriteStream(filePath);
    pass.pipe(writeStream);

    const uploadPromise = new Promise((resolve, reject) => {
      writeStream.on('finish', async () => {
        // Simulate a Multer file object
        const multerFile = {
          originalname: filename,
          path: filePath
        };

        // Use existing upload method
        try {
          const uploadResult = await this.upload(multerFile as Express.Multer.File);
          resolve({
            url: uploadResult.url,
            fileKey: uploadResult.key,
            writeStream: pass,
            promise: Promise.resolve()
          });
        } catch (error) {
          reject(error);
        }
      });

      writeStream.on('error', (error) => {
        console.error('Failed to write temporary file:', error);
        reject(error);
      });

      pass.on('error', (error) => {
        console.error('Error in PassThrough stream:', error);
        reject(error);
      });
    });

    return {
      writeStream: pass,
      promise: uploadPromise,
      url: `${this.storage_url}/${this.bucket_name}/${filePath}`,
      filePath
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
