import { createReadStream } from 'fs';
import { FileService } from 'medusa-interfaces';
import { StorageClient } from '@supabase/storage-js';

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

  constructor({}, options: Options) {
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
  async getUploadStreamDescriptor({ name, ext, isPrivate = false }: { name: string; ext: string; isPrivate: boolean}) {
    const filePath = `${isPrivate ? 'protected' : 'public'}/exports/${name}.${ext}`;
    const writeStream = createReadStream(filePath);

    return {
      writeStream,
      promise: Promise.resolve(),
      url: `${this.storage_url}/${this.bucket_name}/${filePath}`,
      fileKey: filePath,
    };
  }

  // @ts-ignore
  async upload(file: { path: string; originalname: string }) {
    const { data, error } = await this.storageClient()
      .from(this.bucket_name)
        // @ts-ignore
        .upload(file.path, createReadStream(file.path), { duplex: "half" });

    if (error) {
      console.log(error);
      throw error;
    }

    return {
      url: `${this.storage_url}/${this.bucket_name}/${data.path}`,
    };
  }

  // @ts-ignore
  async delete(filepath: string) {
    try {
      await this.storageClient().from(this.bucket_name).remove([filepath]);
    } catch (error) {
      throw error;
    }
  }
}

export default SupabaseService;
