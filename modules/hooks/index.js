const create_hooks = require('cjs-sync-hooks')

module.exports = create_hooks_public_api

function create_hooks_public_api( internal_state ) {
	if (internal_state?.public_api?.hasOwnProperty( 'hooks' )) throw new Error( 'internal state already has "hooks" property' )

  internal_state.public_api.hooks = create_hooks()
}