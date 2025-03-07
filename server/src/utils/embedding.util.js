/**
 * Simple embedding utility using TensorFlow.js
 * For a production system, consider using specialized embedding models
 */

// Simulated embedding function (replace with actual embeddings in production)
async function createEmbedding(text) {
    if (!text) return new Array(384).fill(0);
    
    // Simple hash-based embedding (for demo purposes only)
    // In production, use a proper embedding model
    const simpleHash = text.split('')
      .map(char => char.charCodeAt(0))
      .reduce((acc, code, i) => {
        acc[i % 384] = (acc[i % 384] || 0) + code;
        return acc;
      }, new Array(384).fill(0));
    
    // Normalize the vector
    const magnitude = Math.sqrt(simpleHash.reduce((sum, val) => sum + val * val, 0));
    const normalized = simpleHash.map(val => val / magnitude);
    
    return normalized;
  }
  
  module.exports = {
    createEmbedding
  };