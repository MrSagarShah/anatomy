# Graph Report - .  (2026-09-23)

## Corpus Check
- 105 files · ~144,800 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 461 nodes · 604 edges · 57 communities detected
- Extraction: 86% EXTRACTED · 12% INFERRED · 1% AMBIGUOUS · INFERRED: 75 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Draco Decoder Runtime|Draco Decoder Runtime]]
- [[_COMMUNITY_Basis Transcoder Runtime|Basis Transcoder Runtime]]
- [[_COMMUNITY_Eye Kidney Gut Illustrations|Eye Kidney Gut Illustrations]]
- [[_COMMUNITY_Brain Pancreas Liver Illustrations|Brain Pancreas Liver Illustrations]]
- [[_COMMUNITY_Three.js Anatomy Viewer|Three.js Anatomy Viewer]]
- [[_COMMUNITY_Heart Lung Skin Illustrations|Heart Lung Skin Illustrations]]
- [[_COMMUNITY_Draco WebAssembly Wrapper|Draco WebAssembly Wrapper]]
- [[_COMMUNITY_Interactive Hotspot Layer|Interactive Hotspot Layer]]
- [[_COMMUNITY_GLTF Asset Loading|GLTF Asset Loading]]
- [[_COMMUNITY_Basis Exception Bindings|Basis Exception Bindings]]
- [[_COMMUNITY_Brand and App Assets|Brand and App Assets]]
- [[_COMMUNITY_ChatGPT Sign-In Helpers|ChatGPT Sign-In Helpers]]
- [[_COMMUNITY_Starter and Hosting Guide|Starter and Hosting Guide]]
- [[_COMMUNITY_Localized Metadata Layout|Localized Metadata Layout]]
- [[_COMMUNITY_Anatomy Learning Interface|Anatomy Learning Interface]]
- [[_COMMUNITY_D1 Notes Example API|D1 Notes Example API]]
- [[_COMMUNITY_Viewer Quiz Interface|Viewer Quiz Interface]]
- [[_COMMUNITY_Locale Configuration|Locale Configuration]]
- [[_COMMUNITY_Anatomy Translation Merge|Anatomy Translation Merge]]
- [[_COMMUNITY_Localized Home Route|Localized Home Route]]
- [[_COMMUNITY_Three.js Resource Disposal|Three.js Resource Disposal]]
- [[_COMMUNITY_Script-Aware Font Loading|Script-Aware Font Loading]]
- [[_COMMUNITY_Lazy Dictionary Loading|Lazy Dictionary Loading]]
- [[_COMMUNITY_Translation Types and Formatting|Translation Types and Formatting]]
- [[_COMMUNITY_Cloudflare D1 Access|Cloudflare D1 Access]]
- [[_COMMUNITY_Drizzle Configuration|Drizzle Configuration]]
- [[_COMMUNITY_Vinext Vite Configuration|Vinext Vite Configuration]]
- [[_COMMUNITY_Next.js Configuration|Next.js Configuration]]
- [[_COMMUNITY_Canonical Anatomy Structure|Canonical Anatomy Structure]]
- [[_COMMUNITY_Medical Rim Material|Medical Rim Material]]
- [[_COMMUNITY_German UI Copy|German UI Copy]]
- [[_COMMUNITY_Arabic UI Copy|Arabic UI Copy]]
- [[_COMMUNITY_Spanish UI Copy|Spanish UI Copy]]
- [[_COMMUNITY_English UI Copy|English UI Copy]]
- [[_COMMUNITY_Chinese UI Copy|Chinese UI Copy]]
- [[_COMMUNITY_Hindi UI Copy|Hindi UI Copy]]
- [[_COMMUNITY_French UI Copy|French UI Copy]]
- [[_COMMUNITY_Russian UI Copy|Russian UI Copy]]
- [[_COMMUNITY_Portuguese UI Copy|Portuguese UI Copy]]
- [[_COMMUNITY_Korean UI Copy|Korean UI Copy]]
- [[_COMMUNITY_Indonesian UI Copy|Indonesian UI Copy]]
- [[_COMMUNITY_Japanese UI Copy|Japanese UI Copy]]
- [[_COMMUNITY_German Organ Content|German Organ Content]]
- [[_COMMUNITY_Arabic Organ Content|Arabic Organ Content]]
- [[_COMMUNITY_Spanish Organ Content|Spanish Organ Content]]
- [[_COMMUNITY_English Organ Content|English Organ Content]]
- [[_COMMUNITY_Chinese Organ Content|Chinese Organ Content]]
- [[_COMMUNITY_Hindi Organ Content|Hindi Organ Content]]
- [[_COMMUNITY_French Organ Content|French Organ Content]]
- [[_COMMUNITY_Russian Organ Content|Russian Organ Content]]
- [[_COMMUNITY_Portuguese Organ Content|Portuguese Organ Content]]
- [[_COMMUNITY_Korean Organ Content|Korean Organ Content]]
- [[_COMMUNITY_Indonesian Organ Content|Indonesian Organ Content]]
- [[_COMMUNITY_Japanese Organ Content|Japanese Organ Content]]
- [[_COMMUNITY_Example D1 Schema|Example D1 Schema]]
- [[_COMMUNITY_Production Database Schema|Production Database Schema]]
- [[_COMMUNITY_Cloudflare Worker Entrypoint|Cloudflare Worker Entrypoint]]

## God Nodes (most connected - your core abstractions)
1. `AnatomyViewer` - 33 edges
2. `getCache()` - 21 edges
3. `x()` - 18 edges
4. `ExceptionInfo` - 14 edges
5. `HotspotLayer` - 13 edges
6. `AnatomyAssetManager` - 13 edges
7. `v()` - 8 edges
8. `E()` - 7 edges
9. `Skin` - 7 edges
10. `Intestines` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Skin` --comparison_basis_unspecified--> `Intestines`  [AMBIGUOUS]
  public/anatomy/skin/organ.webp → public/anatomy/skin/compare.webp
- `Heart` --comparison_basis_unspecified--> `Brain`  [AMBIGUOUS]
  public/anatomy/heart/organ.webp → public/anatomy/heart/compare.webp
- `Brain` --comparison_rationale_unclear--> `Eyeball`  [AMBIGUOUS]
  public/anatomy/heart/compare.webp → public/anatomy/brain/compare.webp
- `Liver` --comparison_rationale_unclear--> `Stomach and intestines`  [AMBIGUOUS]
  public/anatomy/liver/organ.webp → public/anatomy/liver/compare.webp
- `skin microscopic image` --depicts_tissue_of--> `Skin`  [INFERRED]
  public/anatomy/skin/microscopic.webp → public/anatomy/skin/organ.webp

## Hyperedges (group relationships)
- **Eyeball visual asset set** — anatomy_eyeball, public_anatomy_eyeball_compare_webp, public_anatomy_eyeball_location_webp, public_anatomy_eyeball_microscopic_webp, public_anatomy_eyeball_organ_webp, public_anatomy_eyeball_thumb_webp [EXTRACTED 0.99]
- **Kidneys visual asset set** — anatomy_kidneys, public_anatomy_kidneys_compare_webp, public_anatomy_kidneys_location_webp, public_anatomy_kidneys_microscopic_webp, public_anatomy_kidneys_organ_webp, public_anatomy_kidneys_thumb_webp [EXTRACTED 0.99]
- **Intestines visual asset set** — anatomy_intestines, public_anatomy_intestine_compare_webp, public_anatomy_intestine_location_webp, public_anatomy_intestine_microscopic_webp, public_anatomy_intestine_organ_webp, public_anatomy_intestine_thumb_webp [EXTRACTED 0.99]
- **Recurring five-role anatomy teaching image system** — visual_role_organ_portrait, visual_role_body_location, visual_role_microscopic_view, visual_role_organ_comparison, visual_role_thumbnail, brain_organ_image, brain_location_image, brain_microscopic_image, brain_compare_image, brain_thumbnail_image, pancreas_organ_image, pancreas_location_image, pancreas_microscopic_image, pancreas_compare_image, pancreas_thumbnail_image, liver_organ_image, liver_location_image, liver_microscopic_image, liver_compare_image, liver_thumbnail_image [INFERRED 0.96]
- **Anatomy Atelier application icon suite** — anatomy_atelier_heart_mark, apple_touch_icon_asset, pwa_icon_192_asset, pwa_icon_512_asset, favicon_asset [INFERRED 0.98]
- **Anatomy Atelier social identity composition** — social_preview_asset, anatomy_atelier_brand, anatomy_atelier_tagline, anatomy_atelier_heart_mark [INFERRED 0.85]

## Communities

### Community 0 - "Draco Decoder Runtime"
Cohesion: 0.04
Nodes (55): c(), l(), p(), ma(), assert(), UTF8ArrayToString(), UTF8ToString(), stringToUTF8Array() (+47 more)

### Community 1 - "Basis Transcoder Runtime"
Cohesion: 0.05
Nodes (23): locateFile(), preRun(), postRun(), addOnPreRun(), addOnPostRun(), addRunDependency(), findWasmBinary(), getBinaryPromise() (+15 more)

### Community 2 - "Eye Kidney Gut Illustrations"
Cohesion: 0.06
Nodes (47): Eyeball comparison image, Eyeball body-location image, Eyeball microscopic image, Eyeball organ image, Kidneys comparison image, Kidneys body-location image, Kidneys microscopic image, Kidneys organ image (+39 more)

### Community 3 - "Brain Pancreas Liver Illustrations"
Cohesion: 0.06
Nodes (43): organ comparison illustration, Intestines, Brain, skin comparison image, lungs comparison image, heart comparison image, Eyeball thumbnail, Kidneys thumbnail (+35 more)

### Community 4 - "Three.js Anatomy Viewer"
Cohesion: 0.11
Nodes (2): AnatomyViewer, contactShadowTexture()

### Community 5 - "Heart Lung Skin Illustrations"
Cohesion: 0.07
Nodes (34): organ illustration, body-location illustration, microscopic tissue illustration, thumbnail illustration, Skin, Epidermis, Dermis, Subcutaneous adipose tissue (+26 more)

### Community 6 - "Draco WebAssembly Wrapper"
Cohesion: 0.16
Nodes (26): n(), l(), f(), v(), ba(), p(), h(), A() (+18 more)

### Community 7 - "Interactive Hotspot Layer"
Cohesion: 0.16
Nodes (4): rgba(), dotTexture(), HotspotLayer, snapToSurface()

### Community 8 - "GLTF Asset Loading"
Cohesion: 0.2
Nodes (1): AnatomyAssetManager

### Community 9 - "Basis Exception Bindings"
Cohesion: 0.2
Nodes (1): ExceptionInfo

### Community 10 - "Brand and App Assets"
Cohesion: 0.2
Nodes (12): Anatomy Atelier, Learn anatomy like an artist, Stylized heart brand mark, Apple touch icon, 192px application icon, 512px application icon, SVG favicon, Anatomy Atelier social preview (+4 more)

### Community 11 - "ChatGPT Sign-In Helpers"
Cohesion: 0.46
Nodes (7): getChatGPTUser(), requireChatGPTUser(), chatGPTSignInPath(), chatGPTSignOutPath(), safeRelativeReturnPath(), isReservedAuthPath(), safeDecodeURIComponent()

### Community 12 - "Starter and Hosting Guide"
Cohesion: 0.33
Nodes (6): Project README, vinext full-stack starter, Node.js >=22.13.0, Optional Cloudflare D1 and Drizzle support, Workspace identity headers and SIWC, Server-side workspace access control

### Community 13 - "Localized Metadata Layout"
Cohesion: 0.5
Nodes (0):

### Community 14 - "Anatomy Learning Interface"
Cohesion: 0.4
Nodes (0):

### Community 15 - "D1 Notes Example API"
Cohesion: 0.83
Nodes (3): toRouteErrorMessage(), GET(), POST()

### Community 16 - "Viewer Quiz Interface"
Cohesion: 0.5
Nodes (0):

### Community 17 - "Locale Configuration"
Cohesion: 0.67
Nodes (0):

### Community 18 - "Anatomy Translation Merge"
Cohesion: 0.67
Nodes (0):

### Community 19 - "Localized Home Route"
Cohesion: 1.0
Nodes (0):

### Community 20 - "Three.js Resource Disposal"
Cohesion: 1.0
Nodes (0):

### Community 21 - "Script-Aware Font Loading"
Cohesion: 1.0
Nodes (0):

### Community 22 - "Lazy Dictionary Loading"
Cohesion: 1.0
Nodes (0):

### Community 23 - "Translation Types and Formatting"
Cohesion: 1.0
Nodes (0):

### Community 24 - "Cloudflare D1 Access"
Cohesion: 1.0
Nodes (0):

### Community 25 - "Drizzle Configuration"
Cohesion: 1.0
Nodes (0):

### Community 26 - "Vinext Vite Configuration"
Cohesion: 1.0
Nodes (0):

### Community 27 - "Next.js Configuration"
Cohesion: 1.0
Nodes (0):

### Community 28 - "Canonical Anatomy Structure"
Cohesion: 1.0
Nodes (0):

### Community 29 - "Medical Rim Material"
Cohesion: 1.0
Nodes (0):

### Community 30 - "German UI Copy"
Cohesion: 1.0
Nodes (0):

### Community 31 - "Arabic UI Copy"
Cohesion: 1.0
Nodes (0):

### Community 32 - "Spanish UI Copy"
Cohesion: 1.0
Nodes (0):

### Community 33 - "English UI Copy"
Cohesion: 1.0
Nodes (0):

### Community 34 - "Chinese UI Copy"
Cohesion: 1.0
Nodes (0):

### Community 35 - "Hindi UI Copy"
Cohesion: 1.0
Nodes (0):

### Community 36 - "French UI Copy"
Cohesion: 1.0
Nodes (0):

### Community 37 - "Russian UI Copy"
Cohesion: 1.0
Nodes (0):

### Community 38 - "Portuguese UI Copy"
Cohesion: 1.0
Nodes (0):

### Community 39 - "Korean UI Copy"
Cohesion: 1.0
Nodes (0):

### Community 40 - "Indonesian UI Copy"
Cohesion: 1.0
Nodes (0):

### Community 41 - "Japanese UI Copy"
Cohesion: 1.0
Nodes (0):

### Community 42 - "German Organ Content"
Cohesion: 1.0
Nodes (0):

### Community 43 - "Arabic Organ Content"
Cohesion: 1.0
Nodes (0):

### Community 44 - "Spanish Organ Content"
Cohesion: 1.0
Nodes (0):

### Community 45 - "English Organ Content"
Cohesion: 1.0
Nodes (0):

### Community 46 - "Chinese Organ Content"
Cohesion: 1.0
Nodes (0):

### Community 47 - "Hindi Organ Content"
Cohesion: 1.0
Nodes (0):

### Community 48 - "French Organ Content"
Cohesion: 1.0
Nodes (0):

### Community 49 - "Russian Organ Content"
Cohesion: 1.0
Nodes (0):

### Community 50 - "Portuguese Organ Content"
Cohesion: 1.0
Nodes (0):

### Community 51 - "Korean Organ Content"
Cohesion: 1.0
Nodes (0):

### Community 52 - "Indonesian Organ Content"
Cohesion: 1.0
Nodes (0):

### Community 53 - "Japanese Organ Content"
Cohesion: 1.0
Nodes (0):

### Community 54 - "Example D1 Schema"
Cohesion: 1.0
Nodes (0):

### Community 55 - "Production Database Schema"
Cohesion: 1.0
Nodes (0):

### Community 56 - "Cloudflare Worker Entrypoint"
Cohesion: 1.0
Nodes (0):

## Ambiguous Edges - Review These
- `Skin` → `Intestines`  [AMBIGUOUS]
  public/anatomy/skin/compare.webp · relation: comparison_basis_unspecified
- `Lungs` → `Heart`  [AMBIGUOUS]
  public/anatomy/lungs/compare.webp · relation: comparison_basis_unspecified
- `Heart` → `Brain`  [AMBIGUOUS]
  public/anatomy/heart/compare.webp · relation: comparison_basis_unspecified
- `Brain` → `Eyeball`  [AMBIGUOUS]
  public/anatomy/brain/compare.webp · relation: comparison_rationale_unclear
- `Intestines microscopic image` → `Intestinal crypts`  [AMBIGUOUS]
  public/anatomy/intestine/microscopic.webp · relation: depicts
- `Pancreas` → `Liver`  [AMBIGUOUS]
  public/anatomy/pancreas/compare.webp · relation: comparison_rationale_unclear
- `Liver` → `Stomach and intestines`  [AMBIGUOUS]
  public/anatomy/liver/compare.webp · relation: comparison_rationale_unclear

## Knowledge Gaps
- **47 isolated node(s):** `Project README`, `Node.js >=22.13.0`, `Optional Cloudflare D1 and Drizzle support`, `Server-side workspace access control`, `Epidermis` (+42 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Localized Home Route`** (2 nodes): `page.tsx`, `Home()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Three.js Resource Disposal`** (2 nodes): `dispose.ts`, `disposeObject()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Script-Aware Font Loading`** (2 nodes): `fonts.ts`, `fontClassName()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Lazy Dictionary Loading`** (2 nodes): `dictionaries.ts`, `getDictionary()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Translation Types and Formatting`** (2 nodes): `types.ts`, `format()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cloudflare D1 Access`** (2 nodes): `index.ts`, `getDb()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Drizzle Configuration`** (1 nodes): `drizzle.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vinext Vite Configuration`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Configuration`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Canonical Anatomy Structure`** (1 nodes): `anatomy-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Medical Rim Material`** (1 nodes): `tsl-materials.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `German UI Copy`** (1 nodes): `de.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Arabic UI Copy`** (1 nodes): `ar.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Spanish UI Copy`** (1 nodes): `es.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `English UI Copy`** (1 nodes): `en.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Chinese UI Copy`** (1 nodes): `zh.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Hindi UI Copy`** (1 nodes): `hi.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `French UI Copy`** (1 nodes): `fr.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Russian UI Copy`** (1 nodes): `ru.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Portuguese UI Copy`** (1 nodes): `pt.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Korean UI Copy`** (1 nodes): `ko.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Indonesian UI Copy`** (1 nodes): `id.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Japanese UI Copy`** (1 nodes): `ja.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `German Organ Content`** (1 nodes): `de.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Arabic Organ Content`** (1 nodes): `ar.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Spanish Organ Content`** (1 nodes): `es.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `English Organ Content`** (1 nodes): `en.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Chinese Organ Content`** (1 nodes): `zh.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Hindi Organ Content`** (1 nodes): `hi.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `French Organ Content`** (1 nodes): `fr.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Russian Organ Content`** (1 nodes): `ru.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Portuguese Organ Content`** (1 nodes): `pt.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Korean Organ Content`** (1 nodes): `ko.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Indonesian Organ Content`** (1 nodes): `id.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Japanese Organ Content`** (1 nodes): `ja.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Example D1 Schema`** (1 nodes): `schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Production Database Schema`** (1 nodes): `schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cloudflare Worker Entrypoint`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Skin` and `Intestines`?**
  _Edge tagged AMBIGUOUS (relation: comparison_basis_unspecified) - confidence is low._
- **What is the exact relationship between `Lungs` and `Heart`?**
  _Edge tagged AMBIGUOUS (relation: comparison_basis_unspecified) - confidence is low._
- **What is the exact relationship between `Heart` and `Brain`?**
  _Edge tagged AMBIGUOUS (relation: comparison_basis_unspecified) - confidence is low._
- **What is the exact relationship between `Brain` and `Eyeball`?**
  _Edge tagged AMBIGUOUS (relation: comparison_rationale_unclear) - confidence is low._
- **What is the exact relationship between `Intestines microscopic image` and `Intestinal crypts`?**
  _Edge tagged AMBIGUOUS (relation: depicts) - confidence is low._
- **What is the exact relationship between `Pancreas` and `Liver`?**
  _Edge tagged AMBIGUOUS (relation: comparison_rationale_unclear) - confidence is low._
- **What is the exact relationship between `Liver` and `Stomach and intestines`?**
  _Edge tagged AMBIGUOUS (relation: comparison_rationale_unclear) - confidence is low._
