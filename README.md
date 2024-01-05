
---

# Supabase File Service for Medusa

This service allows Medusa to use Supabase as a file storage solution. With the recent updates, it now also supports self-hosted instances of Supabase.

## Parameters

The following parameters are used by the service:

- **api_url** : `string` (Optional) Your Supabase API Url. If not provided, it will default to the Supabase cloud URL constructed using the `project_ref`.
- **project_ref** : `string` Your Supabase project reference. Defaults to "default" if not provided.
- **service_key** : `string` Your Supabase service key.
- **bucket_name** : `string` Your Supabase storage bucket.
- **storage_version** : `string` (Optional) The version of the storage being used with Supabase. Defaults to "v1".

## Create a `.env` File

To make configuration easier and more secure, you can use environment variables. Create a `.env` file in your root directory and add the following:

```javascript
SUPABASE_API_URL="<Your Supabase url>"  # Optional; will fallback to Supabase cloud URL if not provided
SUPABASE_PROJECT="<Your Supabase project reference>"
SUPABASE_SERVICE_KEY="<Your Supabase service key>"
SUPABASE_BUCKET="<Your Supabase bucket name>"
SUPABASE_STORAGE_VERSION="v1"
```

## Configuration

To configure the Supabase File Service, you can utilize environment variables for flexibility and security:

```javascript
{
    resolve: `medusa-file-supabase`,
    options: {
      api_url: process.env.SUPABASE_API_URL || `https://${process.env.SUPABASE_PROJECT}.supabase.co`,
      project_ref: process.env.SUPABASE_PROJECT || "default",
      service_key: process.env.SUPABASE_SERVICE_KEY,
      bucket_name: process.env.SUPABASE_BUCKET,
      storage_version: process.env.SUPABASE_STORAGE_VERSION || "v1",
    },
}
```

Ensure that the environment variables (`SUPABASE_PROJECT`, `SUPABASE_SERVICE_KEY`, `SUPABASE_BUCKET`) are set in your environment or deployment setup.

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
