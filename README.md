
---

# Supabase File Service for Medusa

This service allows Medusa to use Supabase as a file storage solution. With the recent updates, it now also supports self-hosted instances of Supabase.

## Configuration

To configure the Supabase File Service, you need to provide the following environment variables (options):

- `project_ref`: Your Supabase project reference.
- `service_key`: Your Supabase service key.
- `bucket_name`: The name of your Supabase storage bucket.
- **New!** `api_url`: The base URL for your Supabase API. This allows for flexibility in pointing to self-hosted Supabase instances.
- **New!** `storage_version`: The version of the storage being used with Supabase.

Example:

```javascript
const options = {
  project_ref: 'YOUR_PROJECT_REF',
  service_key: 'YOUR_SERVICE_KEY',
  bucket_name: 'YOUR_BUCKET_NAME',
  api_url: 'YOUR_API_URL', // e.g., https://your-supabase-instance.com
  storage_version: 'v1' // or whichever version you're using
};

const supabaseService = new SupabaseService({}, options);
```

## Usage

Once configured, you can use the service to upload and delete files:

```javascript
// Upload a file
const result = await supabaseService.upload({
  path: 'path_to_file',
  originalname: 'filename.ext'
});

// Delete a file
await supabaseService.delete('path_to_file');
```

## Future Enhancements

- Support for private buckets is planned for future releases. This will allow users to have more control over their file accessibility.

---
