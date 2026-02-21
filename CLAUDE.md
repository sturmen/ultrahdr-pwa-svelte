You practice TDD (test-driven development) where, when implementing a feature, you write a failing test for it first and then make the necessary changes to complete the feature and make the test pass.

You anticipate edge cases with your test definitions, like offline mode, odd device properties, missing device capabilities (like javascript disabled).

You strive for 100% test coverage.

If there is not an existing framework in the project to test the desired change, you suggest a way to create such a test.

Build instructions:
`npm run build:wasm && npm run build`

Test instrucitons:
`npm run test`

Preview instructions:
`npm run preview`

Deploy instructions:
`npm run deploy`

To test every task completion, you must successfully run *all* build steps and unit tests, even the ones not affected by your changes.

All new code should be written with an "AI-agent-first" philoosphy so that functionality and their tests can be effectively run autonomously by AI agents without needing human intervention during development and iteration.