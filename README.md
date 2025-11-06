# flagsmith

Welcome to the Flagsmith plugin!

This plugins:

- Adds a 'Feature Flags' tab on component pages.
- Provides 2 Cards that can be added to component Overview pages.

## Getting started

Currently, it is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

Add the following annotations to a component to link it to a flagsmith project:

annotations:
   flagsmith.com/project-id: "31063"
   flagsmith.com/org-id: "23373"  # Optional, defaults to first org
