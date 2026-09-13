# Datakilde - offentlige toaletter i Oslo

## Valgt kilde

**Utgiver:** Bymiljøetaten, Oslo kommune  
**Datasett:** Offentlige toaletter  
**API-lag:**

https://geodata.bymoslo.no/arcgis/rest/services/geodata/Temadata_Publikum/MapServer/4

**GeoJSON-spørring:**

https://geodata.bymoslo.no/arcgis/rest/services/geodata/Temadata_Publikum/MapServer/4/query?where=1%3D1&outFields=*&returnGeometry=true&f=geojson&outSR=4326

**Lisens:** Norsk lisens for offentlige data (NLOD).  
**Kreditering:** Bymiljøetaten, Oslo kommune.

## Hvorfor denne kilden

Toilapp bruker Oslo kommunes eget datasett som primær datakilde i første versjon. Kilden er valgt fordi den dekker offentlige toaletter i Oslo, har stabile identifikatorer og inneholder geografiske koordinater.

Kartverkets tilgjengelighetsdata ble vurdert. De har mer detaljerte tilgjengelighetsvurderinger, men er et kartleggingsdatasett for ulike områder og objekttyper. Dekningen for offentlige toaletter i Oslo er ikke dokumentert som komplett. Oslo kommunes datasett er derfor et tryggere primærgrunnlag for Toilapps første Oslo-versjon.

## Datakvalitet og begrensninger

Det tidligere uttrekket inneholdt 82 registreringer.

- `globalid` var fylt ut på alle poster.
- Koordinater var tilgjengelige.
- Ett toalett manglet navn.
- Adresse er ikke strukturert i datasettet.
- Pris og åpningstider er ikke tilgjengelige som strukturerte felt.
- Noe praktisk informasjon lå i kommentarer.

Toilapp skal derfor ikke vise eller filtrere på pris, åpningstider eller renhetsvurdering i første versjon.

## Feltmapping

| Kilde | Bruk i Toilapp | Behandling ved manglende verdi |
| --- | --- | --- |
| `globalid` | Stabil kilde-ID for import og duplikatvern | Avvis posten fra import |
| GeoJSON-geometri | Breddegrad og lengdegrad | Avvis posten fra import |
| Navnefelt fra kilden | Navn i liste og detaljvisning | Vis «Offentlig toalett» |
| `toalettype` | Toalettype i detaljvisning | Vis «Ikke oppgitt» |
| `tilgjengelighetsvurdering` | Tilgjengelighetsstatus og senere filter | Vis «Ikke oppgitt» og ikke inkluder i filteret |
| `forvalter` | Forvalter i detaljvisning | Ikke vis feltet |
| `last_edited_date` | Brukes ved import for å oppdage endringer | Ikke vis feltet til brukeren |

## Koordinater

Importen henter GeoJSON med `outSR=4326`, som bruker WGS84.

GeoJSON lagrer koordinater slik:

```text
[longitude, latitude]

## Import

Importen kjøres eksplisitt og er deaktivert under vanlig serveroppstart. Den henter først hele datasettet, kontrollerer pagineringen og mapper alle gyldige poster før databaseskrivingen begynner.

Verifisert kommando for Windows PowerShell, kjørt fra `backend`:

```powershell
.\mvnw.cmd "-Dspring-boot.run.arguments=--toilapp.import.enabled=true --spring.main.web-application-type=none" spring-boot:run