const fs = require('fs');
const path = require('path');
const { createEmbedding } = require('./embedding.util');

class SimpleVectorStore {
  constructor() {
    this.documents = [];
    this.embeddings = [];
  }

  async addDocument(id, text, metadata = {}) {
    try {
      const embedding = await createEmbedding(text);
      this.documents.push({ id, text, metadata });
      this.embeddings.push(embedding);
      return true;
    } catch (error) {
      console.error('Error adding document to vector store:', error);
      return false;
    }
  }

  async similaritySearch(query, topK = 3) {
    try {
      const queryEmbedding = await createEmbedding(query);
      
      // Calculate similarity scores
      const similarities = this.embeddings.map((docEmbedding, idx) => {
        const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);
        return { 
          document: this.documents[idx],
          score: similarity
        };
      });
      
      // Sort by similarity score (descending)
      const sortedResults = similarities.sort((a, b) => b.score - a.score);
      
      // Return top K results
      return sortedResults.slice(0, topK);
    } catch (error) {
      console.error('Error performing similarity search:', error);
      return [];
    }
  }

  cosineSimilarity(vecA, vecB) {
    // Calculate dot product
    let dotProduct = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
    }
    
    // Calculate magnitudes
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
    
    // Calculate cosine similarity
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

// Create and export singleton instance
const vectorStore = new SimpleVectorStore();

// Function to load documents from files
async function loadDocumentsFromDirectory(dirPath) {
  try {
    console.log(`📚 Loading documents from ${dirPath}...`);
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(dirPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Split content into chunks (simple paragraph-based splitting)
        const paragraphs = content.split('\n\n');
        
        for (let i = 0; i < paragraphs.length; i++) {
          const paragraph = paragraphs[i].trim();
          if (paragraph.length > 50) { // Only add substantial paragraphs
            await vectorStore.addDocument(
              `${file}-${i}`,
              paragraph,
              { source: file, chunk: i }
            );
            console.log(`✅ Added document: ${file}-${i}`);
          }
        }
      }
    }
    
    console.log(`✅ Loaded ${vectorStore.documents.length} document chunks`);
    return true;
  } catch (error) {
    console.error('❌ Error loading documents:', error);
    return false;
  }
}

module.exports = {
  vectorStore,
  loadDocumentsFromDirectory
};