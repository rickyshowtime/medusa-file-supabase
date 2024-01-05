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

  //Implement fix for exports error: [object Object] this.fileService_.withTransaction(...).getUploadStreamDescriptor is not a function
  async getUploadStreamDescriptor(fileData: UploadStreamDescriptorType): Promise<FileServiceGetUploadStreamResult> {
    const filePath = `${fileData.isPrivate ? 'protected' : 'public'}/exports/`;
    const fileName = `${fileData.name}.${fileData.ext}`;
    const writeStream =  fs.createWriteStream(filePath);
    const { data, error } = await this.storageClient()
      .from(this.bucket_name).upload(filePath, createReadStream(fileName), { duplex: "half" });

    if (error) {
      console.log(error);
      throw error;
    }

    return {
      // @ts-ignore
      writeStream,
      promise: Promise.resolve(),
      url: `${this.storage_url}/${this.bucket_name}/${data.path}`,
      fileKey: data.path,
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

    const { data, error } = await this.storageClient()
      .from(this.bucket_name).upload(fileData.path, createReadStream(fileData.originalname), { duplex: "half" });

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
