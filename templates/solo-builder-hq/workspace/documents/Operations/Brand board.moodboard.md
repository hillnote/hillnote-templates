---
type: moodboard
---

```moodboard
{"type":"moodboard","version":1,"board":{"bg":"paper","texture":"dots","grid":{"size":20,"snap":false},"locked":false},"viewport":{"x":0,"y":0,"zoom":1},"items":[
{"id":"m_frpalett","type":"frame","x":0,"y":80,"w":760,"h":300,"title":"Palette","color":"fog"},
{"id":"m_frtype01","type":"frame","x":800,"y":80,"w":440,"h":300,"title":"Type","color":"sand"},
{"id":"m_frvoice1","type":"frame","x":0,"y":420,"w":760,"h":300,"title":"Voice","color":"mint"},
{"id":"m_frpages1","type":"frame","x":800,"y":420,"w":440,"h":300,"title":"Where it shows up","color":"dusk"},
{"id":"m_title001","type":"text","x":0,"y":0,"w":760,"h":56,"text":"Harbor brand board","fontSize":28},
{"id":"m_swnavy01","type":"swatch","x":40,"y":140,"hex":"#14324b","label":"Harbor navy"},
{"id":"m_swtide01","type":"swatch","x":180,"y":140,"hex":"#2c7a7b","label":"Tide"},
{"id":"m_swsignal","type":"swatch","x":320,"y":140,"hex":"#f2853a","label":"Signal"},
{"id":"m_swsand01","type":"swatch","x":460,"y":140,"hex":"#f3ece0","label":"Sand"},
{"id":"m_swink001","type":"swatch","x":600,"y":140,"hex":"#1d232a","label":"Ink"},
{"id":"m_palnote1","type":"text","x":40,"y":290,"w":680,"h":56,"fontSize":16,"text":"Navy and sand carry the page. Signal orange is only ever the pay button."},
{"id":"m_typeamt1","type":"text","x":840,"y":130,"w":360,"h":56,"fontSize":28,"text":"$1,240.00 due Friday"},
{"id":"m_typest01","type":"sticky","x":840,"y":200,"w":170,"h":150,"color":"sand","text":"System sans everywhere. Semibold for amounts, regular for the rest."},
{"id":"m_typest02","type":"sticky","x":1030,"y":200,"w":170,"h":150,"color":"peach","text":"Tabular figures, so totals line up in columns."},
{"id":"m_voice001","type":"sticky","x":40,"y":480,"w":160,"h":160,"color":"mint","text":"Calm, never pushy."},
{"id":"m_voice002","type":"sticky","x":220,"y":480,"w":160,"h":160,"color":"sand","text":"Say \"paid\", not \"remitted\"."},
{"id":"m_voice003","type":"sticky","x":400,"y":480,"w":160,"h":160,"color":"peach","text":"Reminders sound like you on a good day."},
{"id":"m_voice004","type":"sticky","x":580,"y":480,"w":160,"h":160,"color":"coral","text":"No exclamation marks in money emails."},
{"id":"m_docland1","type":"doc","x":840,"y":480,"path":"documents/Launch/Landing page copy.md","color":"fog"},
{"id":"m_docann01","type":"doc","x":840,"y":560,"path":"documents/Launch/Announcement drafts.md","color":"fog"},
{"id":"m_doctone1","type":"doc","x":840,"y":640,"path":"documents/Build/Build board/Reminder tones - friendly, firm, final.md","color":"mint"}
],"connectors":[
{"from":"m_voice003","to":"m_doctone1","label":"tones"},
{"from":"m_swsignal","to":"m_docland1","label":"pay button","style":{"dash":"dashed"}}
],"strokes":[]}
```
