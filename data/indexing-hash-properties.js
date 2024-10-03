const INDEXING_HASH_PROPERTIES = {
  hooks: {
    key: 'hooks',
    type: 'object',
    required: true,
  },
  keys: {
    key: 'keys',
    type: 'function',
    required: true,
  },
  exists: {
    key: 'exists',
    type: 'function',
    required: true,
  },
  get: {
    key: 'get',
    type: 'function',
    required: true,
  },
  add: {
    key: 'add',
    type: 'function',
    required: true,
  },
  del: {
    key: 'del',
    type: 'function',
    required: true,
  },
  update: {
    key: 'update',
    type: 'function',
    required: true,
  },
  indexes: {
    key: 'indexes',
    type: 'function',
    required: true,
  },
  index_exists: {
    key: 'index_exists',
    type: 'function',
    required: true,
  },
  index_get: {
    key: 'index_get',
    type: 'function',
    required: true,
  },
  add_index: {
    key: 'add_index',
    type: 'function',
    required: true,
  },
  del_index: {
    key: 'del_index',
    type: 'function',
    required: true,
  },
  reindex: {
    key: 'reindex',
    type: 'function',
    required: true,
  },
  intersect_indexes: {
    key: 'intersect_indexes',
    type: 'function',
    required: true,
  },
}

module.exports = INDEXING_HASH_PROPERTIES
