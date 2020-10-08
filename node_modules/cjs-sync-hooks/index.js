var each = require( 'lodash.foreach' );

module.exports = function create_instance(){
  var map = {},
      api = {},
      running = 0,
      end = {
        val: null,
        run: false
      };

  api.run = run_stack;
  api.end = end_stack_run;
  api.add = add_middleware;
  api.del = api.delete = delete_middleware;

  return api;

  function run_stack( name ){
    if( typeof name !== 'string' || !name ) throw new Error( 'name of hook to run must be a string' );
    
    var input = Array.prototype.splice.call( arguments, 1, arguments.length - 1 ),
        multiple_user_args = input.length > 1,
        output_set = false,
        output;

    if( !multiple_user_args ){
      if( input.length == 1 ) input = input[0];
      else input = undefined;
    }

    if( !map[ name ] ) return multiple_user_args ? input[0] : input;

    var hook_stack = map[ name ];
    running += 1;

    each( hook_stack, function( middleware, name ){
      if( typeof middleware !== 'function' ) return;

      var result = multiple_user_args ? middleware.apply( null, input ) : middleware( input ),
          has_result = Object.prototype.toString.call( result ) !== '[object Undefined]';

      if( has_result ){        
        if( multiple_user_args ) input[0] = result;
        else input = result;

        output_set = true;
      }

      output = result;

      if( end.run ){
        output = end.val;
        return false;
      }
    });

    end.run = false;
    end.val = null;
    running -= 1;

    // if no middleware returned a value, use the first additional run arg passed
    if( !output_set ) output = multiple_user_args ? input[0] : input;

    return output;
  }

  function end_stack_run( final_value ){
    if( !running ) return;

    end.run = true;
    end.val = final_value;
  }

  function delete_middleware( hook, name ){
    if( typeof hook !== 'string' || !hook ) throw new Error( 'hook name must be a string' );
    if( typeof name !== 'string' || !name ) throw new Error( 'middleware name must be a string' );

    if( map[ hook ] && map[ hook ][ name ] ) delete map[ hook ][ name ];
  }

  function add_middleware( hook, name, middleware ){
    if( typeof hook !== 'string' || !hook ) throw new Error( 'hook name must be a string' );
    if( typeof name !== 'string' || !name ) throw new Error( 'middleware name must be a string' );
    if( typeof middleware !== 'function' ) throw new Error( 'middleware must be a function' );

    if( !map.hasOwnProperty( hook ) ) map[ hook ] = {};
    if( map[ hook ][ name ] ) throw new Error( 'hook "' + hook + '" already has middleware called "' + name + '"' );

    map[ hook ][ name ] = middleware;
  }
}