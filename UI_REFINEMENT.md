# Dashboard refinement

The visual and UX update applies to Overview, Analyze Traffic, Model Lab, Dataset, History, and Settings. Model artifacts, prediction logic, risk levels, and API endpoints are unchanged.

## Completed changes

1. **Visual design:** shared navy/teal palette, typography, spacing, cards, controls, badges, loading states, and feedback. The compact purpose banner keeps the project motivation visible without dominating the overview.
2. **Simpler content:** shorter headings and descriptions, four overview metrics, four recent results, and expandable help instead of repeated text boxes. Exact comparison scores, feature importance, confusion matrix, and evaluation notes remain available on demand.
3. **Usability:** a focused primary action, searchable flow fields, grouped measurements, missing-field feedback, stale-result clearing, and a clear separation between saved and unsaved API addresses. History supports search, risk filters, filtered CSV export, and a cancellable clear action.
4. **Performance and responsiveness:** routes load on demand; native SVG/CSS charts replace Recharts (39 installed packages removed). Metadata requests are shared and cached for 60 seconds per endpoint, failed requests can retry immediately, and changing the endpoint invalidates the cache. Requests are cancelled when their pages unmount. Health polling pauses in hidden tabs. Closed measurement groups do not mount their numeric inputs. History renders 20 rows per page and caches its search index/date formatter.
5. **Consistency across pages:** the same shell, headers, tables, form controls, help disclosures, and empty/error states are used throughout. The mobile drawer supports Escape, focus trapping, focus restoration, and background isolation. Reduced-motion preferences are respected; wide tables scroll within their cards.

## Measured frontend build

| Main JavaScript entry | Before | After |
| --- | ---: | ---: |
| Minified, before compression | 659.42 kB | 246.84 kB |
| Gzip | 195.51 kB | 79.68 kB |

The entry is about 63% smaller before compression. Page code is delivered in separate chunks. These are build sizes, not measured network load times or frame-rate claims. The previous large-bundle warning is gone.

## Verification

- Nine frontend client tests pass, covering history, corrupted storage, endpoint use, errors, shared metadata requests, cache invalidation, retry, and cancellation.
- TypeScript/Vite production build and ESLint pass.
- Browser checks covered all six pages: sample loading, prediction, input edits clearing stale results, required-field validation/correction, field search/disclosure, dataset filtering/empty states, history filters/reset, clear cancellation, actual CSV download, connection testing, and confusion-matrix disclosure.
- Checked desktop at 1440 px, mobile at 390 px, and the narrow layout at 320 px. Mobile menu Escape/focus behavior and page-width checks pass. The temporary viewport overrides were reset after testing.

Run from `frontend/`:

```powershell
npm test
npm run build
npm run lint
```

Screenshots: `artifacts/dashboard-desktop-refined.jpg` and `artifacts/dashboard-mobile-refined.jpg`.
