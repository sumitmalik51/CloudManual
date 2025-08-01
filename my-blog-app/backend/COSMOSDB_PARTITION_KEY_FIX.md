# CosmosDB Entity Update Issue - Adaptive Partition Key Strategy

## Problem
CosmosDB operations (update, delete, increment) were failing with "Entity with the specified id does not exist in the system" error, even though documents could be successfully read.

## Root Cause
The issue occurs because:
1. Documents are retrieved successfully using queries with `type = 'post'` partition key
2. But when updating/deleting, the `item(id, partitionKey).replace()` method fails
3. This is due to partition key inconsistencies or internal CosmosDB document reference issues

## Solution - Adaptive Partition Key Strategy
Implemented a multi-strategy approach for all CRUD operations:

### Strategy 1: Direct partition key approach
```javascript
await this.container.item(post.id, post.type).replace(updatedPost);
```

### Strategy 2: Upsert fallback
```javascript
await this.container.items.upsert(updatedPost);
```

### Strategy 3: Query-based (for deletes)
```javascript
const querySpec = {
  query: 'SELECT * FROM c WHERE c.id = @id AND c.type = @type',
  parameters: [
    { name: '@id', value: id },
    { name: '@type', value: 'post' }
  ]
};
```

## Fixed Methods
1. `updatePost(id, updateData)` - Main post update method
2. `deletePost(id)` - Post deletion method  
3. `incrementLikes(postSlug)` - Like counter increment
4. `incrementViews(postSlug)` - View counter increment

## Key Points
- Always clean internal CosmosDB fields (_rid, _self, _etag, etc.) before updates
- Try multiple strategies in sequence until one succeeds
- Log detailed error information for debugging
- Maintain backward compatibility with existing code

## Usage
All existing API endpoints and methods work without changes. The adaptive strategy is transparent to calling code.

## Prevention
- This pattern should be used for ALL future CosmosDB item operations
- Always implement fallback strategies for partition key operations
- Consider using upsert when direct item operations fail

---
Date: 2025-08-01
Status: Implemented and tested
