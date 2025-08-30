const { Pinecone } = require("@pinecone-database/pinecone");

// Initialize a Pinecone client
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY, 
});

// Pick your index name (must already exist in Pinecone console)
const indexName = "chat-gpt-clone"; 

// Create memory (store embeddings in Pinecone)
async function createMemory({vector, metadata, messageId }) {
  try {
    const index = pc.index(indexName);
    await index.upsert([
      {
        id : messageId,       // unique ID for each memory
        values: vector,  // embedding vector from GoogleEmbedding-001
        metadata,  // extra info like { role: "user", message: "Hello" }
      },
    ]);
    console.log("✅ Memory stored successfully!");
  } catch (err) {
    console.error("❌ Error storing memory:", err);
  }
}

// Query memory (retrieve top matches from Pinecone)
async function queryMemory({ vector, topK = 5, metadata }) {
  try {
    const index = pc.index(indexName);

    const queryResponse = await index.query({
      vector,    // the embedding vector for the new message
      topK,
      filter : metadata ? metadata : undefined, // number of results to fetch
      includeMetadata: true,
    });

    return queryResponse.matches; // returns similar past messages
  } catch (err) {
    console.error("❌ Error querying memory:", err);
    return [];
  }
}

// // Delete all memory (clear all vectors but keep index)
// async function deleteAllMemory() {
//   try {
//     const index = pc.index(indexName);
//     await index.deleteAll();   // this clears everything in the index
//     console.log("🗑️ All memories deleted successfully!");
//   } catch (err) {
//     console.error("❌ Error deleting memories:", err);
//   }
// }
// deleteAllMemory();

module.exports =  {createMemory, queryMemory};