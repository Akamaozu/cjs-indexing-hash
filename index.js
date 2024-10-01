const load_dataset = require('./modules/load-dataset')
const create_hooks_public_api = require('./modules/hooks')
const create_core_index_public_api = require('./modules/core-index-public-api')
const create_core_dataset_public_api = require('./modules/core-dataset-public-api')
const populate_new_indexes = require('./modules/populate-new-indexes')
const reindex_changed_entries = require('./modules/reindex-changed-entries')

module.exports = indexing_hash

function indexing_hash( dataset_to_load ) {
  const internal_state = {
    public_api: {},
    dataset: {},
    indexes: {},
  }

  // create api
  create_hooks_public_api( internal_state )
  create_core_dataset_public_api( internal_state )
  create_core_index_public_api( internal_state )

  // define default indexing hash behavior
  populate_new_indexes( internal_state )
  reindex_changed_entries( internal_state )

  // load dataset, if any
  if (dataset_to_load) load_dataset({ internal_state, dataset: dataset_to_load })

  return internal_state.public_api
}
