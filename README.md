# What is JetStream?

JetStream 3 is a JavaScript and WebAssembly benchmark suite.
For more information see the index and in-depth pages of the deployed benchmark.

A preview of the current main branch is available at [https://webkit-jetstream-preview.netlify.app/](https://webkit-jetstream-preview.netlify.app/).

<img src="./resources/screenshot.png">

## Open Governance

See [Governance.md](Governance.md) for more information.

## Getting Started, Setup Instructions

- Install Node.js and (optionally) [jsvu](https://github.com/GoogleChromeLabs/jsvu) for conveniently getting recent builds of engine shells.
- `npm install` the necessary dependencies.
- `npm run server` for starting a local development server, then browse to http://localhost:8010.
- `npm run test:shell` for running the benchmark in engine shells, or alternatively running directly, e.g., via `jsc cli.js`.

See [package.json](package.json) and [.github/workflows/test.yml](.github/workflows/test.yml) for more details and available commands.

### Shell Runner

For the shell runner, see the available options by passing `--help` to `cli.js`. (Note that this requires `--` for JavaScriptCore and V8 to separate VM arguments from script arguments):

```
$ v8 cli.js -- --help
JetStream Driver Help

Options:
    --help                 Print this help message.
    --iteration-count      Set the default iteration count.
    --worst-case-count     Set the default worst-case count.
    --dump-json-results    Print summary json to the console.
    --dump-test-list       Print the selected test list instead of running.
    --ramification         Enable ramification support. See RAMification.py for more details.
    --no-prefetch          Do not prefetch resources. Will add network overhead to measurements!
    --group-details        Display detailed group items
    --test                 Run a specific test or comma-separated list of tests.
    --tag                  Run tests with a specific tag or comma-separated list of tags.
    --start-automatically  Start the benchmark automatically.
    --report               Report results to a server.
    --start-delay          Delay before starting the benchmark.
    --custom-pre-iteration-code Custom code to run before each iteration.
    --custom-post-iteration-code Custom code to run after each iteration.
    --force-gc             Force garbage collection before each benchmark, requires engine support.

Available tags:
   all
...

Available tests:
   8bitbench-wasm
...
```

### Browser Runner

The browser version also supports passing parameters as URL query parameters, e.g., [https://webkit-jetstream-preview.netlify.app/?test=8bitbench-wasm](https://webkit-jetstream-preview.netlify.app/?test=8bitbench-wasm) to run only a single workload.
See [utils/params.js](utils/params.js) and [JetStreamDriver.js](JetStreamDriver.js) for more details.

## Overview for Benchmark Developers

TODO, bullet point list of most important files: `JetStreamDriver.js` which lists tests and their parameters, implements score calculation etc. Individual workloads are in subdirectories.
Compression and decompression via `npm run compress`. Because of large JS and for some workloads large resources (e.g., ML model files). In the browser decompressed via built-in APIs, in shells via Wasm zlib polyfill.


### Preloading and Compression

TODO: briefly explain and document rationale behind preloading and compression of large artifacts

### Score Calculation

TODO, maybe simply refer to in-depth.html?
