# Third-Party Notices

Euroute's own source code is licensed under **AGPL-3.0-only** (see `LICENSE`).
This file lists third-party software distributed with, or required by, Euroute.
All copyrights and trademarks belong to their respective owners. Nothing in this
file transfers ownership of third-party code to the Euroute project.

Licence data below was collected from the `license` field of each installed
package's `package.json`. The authoritative licence text for any package is the
`LICENSE` file inside that package in `node_modules`.

## Summary of licence families in the dependency tree

| Licence | Packages (installed, incl. transitive) |
| --- | --- |
| MIT | 337 |
| ISC | 24 |
| Apache-2.0 | 16 |
| BSD-2-Clause | 6 |
| BSD-3-Clause | 6 |
| MPL-2.0 | 3 |
| 0BSD | 1 |
| Unlicense | 1 |
| Python-2.0 | 1 |
| CC-BY-4.0 | 1 |
| MIT AND ISC | 1 |

No GPL, AGPL, SSPL, BSL, Elastic, or non-commercial-only dependency was found.
All of the above are compatible with distributing Euroute under AGPL-3.0-only.

## MIT / ISC / 0BSD

Permissive, require preservation of copyright and licence notice. Includes,
among many others: React and React DOM, all `@radix-ui/*` packages,
`@tanstack/react-router`, `@tanstack/react-start`, `@tanstack/react-query`,
`@tanstack/router-plugin`, `@supabase/supabase-js`, `tailwindcss`,
`@tailwindcss/vite`, `tw-animate-css`, `vite`, `vite-tsconfig-paths`, `nitro`,
`zod`, `clsx`, `tailwind-merge`, `date-fns`, `react-hook-form`,
`@hookform/resolvers`, `lucide-react`, `cmdk`, `sonner`, `vaul`,
`embla-carousel-react`, `input-otp`, `react-day-picker`,
`react-resizable-panels`, `recharts`, `eslint` and its plugins, `prettier`,
`js-yaml` (4.3.1, pinned via `overrides`), `minimatch`, `glob-parent`, `which`,
the `d3-*` packages, `flatted`, `internmap`, `electron-to-chromium`, and
`tslib` (0BSD).

The `LICENSE` file shipped inside each package must be retained in any
redistribution that includes `node_modules` or a bundle derived from it.

### First-party Lovable packages (MIT)

- `@lovable.dev/cloud-auth-js` — MIT (verified in the installed package
  metadata). Provides the Supabase-backed auth client helpers.
- `@lovable.dev/vite-tanstack-config` — MIT (verified in the installed package
  metadata). Provides the shared Vite/TanStack Start build configuration.

MIT permits use, modification and redistribution, including inside an
AGPL-3.0-only project, provided the copyright and permission notice is kept.

## Apache-2.0

Apache-2.0 packages require preservation of copyright, licence and any `NOTICE`
file contents, and require that modifications be marked. Installed
Apache-2.0 packages include:

- `typescript`
- `class-variance-authority`
- `@eslint/core`, `@eslint/config-array`, `@eslint/config-helpers`,
  `@eslint/plugin-kit`, `@eslint/object-schema`
- `@humanfs/core`, `@humanfs/node`, `@humanfs/types`
- `@humanwhocodes/module-importer`, `@humanwhocodes/retry`
- `eslint-visitor-keys`

If any of these packages ship a `NOTICE` file, its contents must be reproduced
in redistributions. Apache-2.0 is one-way compatible with AGPL-3.0, so combined
distribution under AGPL-3.0-only is permitted.

## BSD-2-Clause / BSD-3-Clause

Require preservation of the copyright notice, the licence conditions and the
disclaimer; the 3-clause variant additionally forbids using the authors' names
to endorse derived works.

- BSD-2-Clause: `espree`, `eslint-scope`, `esutils`, `estraverse`, `esrecurse`,
  `uri-js`
- BSD-3-Clause: `esquery`, `source-map`, `source-map-js`, `diff`, `d3-ease`,
  `react-transition-group`

## MPL-2.0

- `lightningcss` and its platform binaries (`lightningcss-linux-x64-gnu`,
  `lightningcss-linux-x64-musl`), used by Tailwind CSS v4.

MPL-2.0 is file-level copyleft: the MPL-licensed files themselves stay under
MPL-2.0 and their source must remain available. They are consumed unmodified as
a dependency, and MPL-2.0 explicitly permits combination with AGPL-3.0 code
(MPL §3.3 secondary-licence compatibility).

## Python-2.0

- `argparse` (a JavaScript port, transitive via `js-yaml`) is distributed under
  the Python Software Foundation Licence 2.0, a permissive licence that is
  GPL/AGPL compatible. Its copyright notice must be preserved.

## Unlicense

- `isbot` — public-domain dedication, no obligations.

## CC-BY-4.0 data package

- `caniuse-lite` — browser-support **data** licensed under Creative Commons
  Attribution 4.0. Attribution is required when this data is redistributed:
  data from [caniuse.com](https://caniuse.com), © Alexis Deveria and
  contributors, licensed CC-BY-4.0. It is a build-time dependency only and is
  not shipped in the client bundle.

## Transit and geographic data (not source code)

Euroute queries the public [Transitous](https://transitous.org/) instance for
geocoding and routing. The data returned is **not** covered by Euroute's licence:

- Timetable data originates from individual public-transport operators'
  GTFS / GTFS-RT feeds. See the list of sources and their individual terms at
  <https://transitous.org/sources/>. Several feeds restrict commercial reuse or
  redistribution.
- Place and station geodata derives from
  [OpenStreetMap](https://www.openstreetmap.org/copyright), © OpenStreetMap
  contributors, licensed under the
  [Open Database License (ODbL) 1.0](https://opendatacommons.org/licenses/odbl/).

Attribution for both is displayed in the application footer. Open-sourcing
Euroute grants no rights to this data; anyone running their own instance is
responsible for complying with the terms of every data source they use.

## UI component source

Components under `src/components/ui` are derived from
[shadcn/ui](https://ui.shadcn.com), MIT licensed, copied into this repository as
source and modified for Euroute.
