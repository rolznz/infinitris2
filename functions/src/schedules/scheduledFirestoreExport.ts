import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export function scheduledFirestoreExport() {
  const bucketUrl = functions.config().webhooks.export_bucket;
  if (!bucketUrl) {
    console.warn('No export bucket URL set, backup not executed');
    return;
  }
  const client = new admin.firestore.v1.FirestoreAdminClient();
  const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
  if (!projectId) {
    console.warn('No GCP_PROJECT or GLOUD_PROJECT set');
    return;
  }
  const databaseName = client.databasePath(projectId, '(default)');
  console.log('Executing firestore export', databaseName);

  return client
    .exportDocuments({
      name: databaseName,
      outputUriPrefix: bucketUrl,
      // Leave collectionIds empty to export all collections
      // or set to a list of collection IDs to export,
      // collectionIds: ['users', 'posts']
      collectionIds: [],
    })
    .then((responses) => {
      const response = responses[0];
      console.log(`Operation Name: ${response['name']}`);
    })
    .catch((err) => {
      console.error(err);
      throw new Error('Export operation failed');
    });
}
