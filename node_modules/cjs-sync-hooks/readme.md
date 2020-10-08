CJS-SYNC-HOOKS
===
Make Your Code Extendable By Creating Hooks for Modifying Behavior and Values
---
[![npm version](https://badge.fury.io/js/cjs-sync-hooks.svg)](https://badge.fury.io/js/cjs-sync-hooks)
[![Build Status](https://travis-ci.org/Akamaozu/cjs-sync-hooks.svg?branch=master)](https://travis-ci.org/Akamaozu/cjs-sync-hooks)
[![Coverage Status](https://coveralls.io/repos/github/Akamaozu/cjs-sync-hooks/badge.svg?branch=master)](https://coveralls.io/github/Akamaozu/cjs-sync-hooks?branch=master)

## Install
```js
npm install --save cjs-sync-hooks
```

## Basic Usage

### Create a Hook Instance

```js
var hook = require( 'cjs-sync-hooks' )();
```

### Add Middleware to a Hook Stack
- **Middleware**: function that executes whenever its associated hook is run.
- **Hook Stack**: collection of hook middleware.

```js
// add 'prepend-subsystem-name' middleware to output hook

  hook.add( 'output', 'prepend-subsystem-name', function( output ){
    var subsystem = 'heroku-formatting-12345',
        prefix = '['+ subsystem + '] ';

    return prefix + output; 
  });
```

### Run Hook Stack

```js
// run "hello world!" through output hook

  var output = hook.run( 'output', 'hello world!' );
  console.log( output ); 
// [heroku-formatting-12345] hello world!
```

## Advanced Usage

### Prematurely Stop Running Hook Stack
#### You can exit a running hook stack early using `hook.end`.
#### Why?
- **Pattern-Matching**: exit stack when compatible middleware is found.

```js
// add middleware to handle strings

  hook.add( 'stdin', 'handle-string', function( input ){
    if( typeof input !== 'string' ) return;

    // do something with string then
    hook.end();
  });


// add middleware to handle numbers

  hook.add( 'stdin', 'handle-number', function( input ){
    if( typeof input !== 'number' ) return;

    // do something with number then
    hook.end();
  });


// run data from stdin through hook

  process.on( 'data', function( data ){
    hook.run( 'stdin', data );
  });
```

### Nested Hooks
#### I heard you like hooks so I made it possible to run hooks in middleware running while hooks are running
```js
// add middleware that converts markdown to html

  hook.add( 'message-to-send', 'markdown-to-html', function( message ){
    var pre_markdown_expanded_message = hook.run( 'pre-markdown-to-html', message );

    // convert markdown to html
    return markdown_expanded_message;
  });


// add middleware to hook that runs in middleware of another hook running

  hook.add( 'pre-markdown-to-html', 'convert-url-to-markdown-link', function( message ){

    // replace urls with markdown links
    return url_to_markdown_message;
  });


// pass outbound messages through nested hooks

  app.send( hook.run( 'message-to-send', {
    to: 'timmy',
    from: 'tommy',
    content: 'you should check *this* out https://youtu.be/dQw4w9WgXcQ'
  }));
```