# Taxi Aktiv Willingen – Website

Statische Website für **Taxi Aktiv Willingen**, 1:1 umgesetzt nach dem Claude-Design
„Taxi Aktiv Website.dc.html“ (Desktop und Mobil, inkl. Animationen, Cookie-Banner und
Unterseiten).

| Seite | Datei |
| --- | --- |
| Home | `docs/index.html` |
| Leistungen | `docs/leistungen.html` |
| Über uns | `docs/ueber-uns.html` |
| Kontakt & Fahrtanfrage | `docs/kontakt.html` |
| Impressum | `docs/impressum.html` |
| Datenschutzerklärung | `docs/datenschutz.html` |

## Aufbau

```
src/styles.css     Globale Styles, Fonts, Keyframes, Responsive-Umschaltung
src/main.js        Interaktionen (Slider, Menü, FAQ, Formulare, Cookies, Karte)
tools/build.mjs    Seitengenerator: erzeugt alle HTML-Seiten aus einer Quelle
docs/              Fertige Website (wird so veröffentlicht, z. B. GitHub Pages)
  assets/img/      Bilder (WebP, aus den Design-PNGs komprimiert: 32 MB → 1,5 MB)
  assets/fonts/    Poppins, DM Sans, Caveat – lokal gehostet (keine Google-Verbindung)
```

Header, Footer, Cookie-Banner usw. stehen nur einmal in `tools/build.mjs` und werden
in jede Seite eingesetzt. **Nicht die HTML-Dateien in `docs/` direkt bearbeiten** –
Änderungen in `tools/build.mjs`, `src/styles.css` oder `src/main.js` machen und neu bauen:

```powershell
node tools/build.mjs
```

Lokale Vorschau:

```powershell
python -m http.server 5173 --directory docs
```

Dann <http://localhost:5173> öffnen.

## Sicherheit & Datenschutz

- Content-Security-Policy per `<meta>`: nur eigene Skripte, keine Inline-Skripte, Frames nur von Google Maps.
- Schriften lokal gehostet, keine externen Tracker oder CDNs.
- Google Maps lädt erst nach Einwilligung „Externe Medien“ (Zwei-Klick-Lösung, Sandbox-iframe).
- Einwilligung wird in `localStorage` (`taxiaktiv-consent`) gespeichert und ist jederzeit änderbar.
- Solange `INDEXING = false` in `tools/build.mjs` steht, tragen alle Seiten `noindex`.

## Vor dem Livegang (offene Punkte)

- [ ] Impressum: gelb markierte Platzhalter ausfüllen (Inhaber, USt-ID, Konzessionsnummer, Genehmigungsbehörde, Bildnachweise).
- [ ] Datenschutz: Hoster (Name/Anschrift) und Log-Speicherdauer eintragen; Text rechtlich prüfen lassen.
- [ ] **Formulare anbinden** (z. B. Supabase): Aktuell zeigen „Fahrt anfragen“ und das Kontaktformular nur die Bestätigung an – es wird **nichts übertragen**. Stelle im Code: `TODO(Supabase)` in `src/main.js`.
- [ ] WhatsApp-Nummer eintragen (`data-todo="whatsapp"` in `tools/build.mjs`).
- [ ] Social-Media-Links (Instagram, Facebook, YouTube) im Footer verlinken.
- [ ] Fotos für die Platzhalter: Willingen-Panorama, Teamfoto (Über uns), Krankenfahrten und Kurierfahrten (Leistungen).
- [ ] Domain festlegen, dann `INDEXING = true` setzen und neu bauen.

## Veröffentlichen (GitHub Pages)

Repository → Settings → Pages → „Deploy from a branch“ → Branch `main`, Ordner `/docs`.
Es wird nur der Ordner `docs/` veröffentlicht, Quellcode und Notizen bleiben privat.
