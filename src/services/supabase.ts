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

    const fileKey = `exports/${fileData.name}-${Date.now()}${fileData.ext}`;
    const uploadPromise = this.storageClient()
      .from(this.bucket_name)
      .upload(fileKey, pass, { contentType: fileData.contentType as string })
      .then((response) => {
        if (response.error) throw response.error;
        return { success: true, path: response.data.path };
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
