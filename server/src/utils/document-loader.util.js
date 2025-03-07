const path = require('path');
const { loadDocumentsFromDirectory } = require('./vector-store.util');

/**
 * Initialize the document store with KUET information
 */
async function initializeDocumentStore() {
  try {
    console.log('🔄 Initializing document store...');
    const docsPath = path.join(__dirname, '..', 'data', 'documents');
    await loadDocumentsFromDirectory(docsPath);
    console.log('✅ Document store initialized successfully.');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize document store:', error);
    return false;
  }
}

module.exports = {
  initializeDocumentStore
};