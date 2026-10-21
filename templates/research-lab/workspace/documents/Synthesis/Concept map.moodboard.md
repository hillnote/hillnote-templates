---
type: moodboard
---

```moodboard
{"type":"moodboard","version":1,"board":{"bg":"paper","texture":"dots","grid":{"size":20,"snap":false},"locked":false},"viewport":{"x":0,"y":0,"zoom":1},"items":[
{"id":"m_frrest01","type":"frame","x":0,"y":360,"w":680,"h":420,"title":"Restoration and health","color":"mint"},
{"id":"m_frconn01","type":"frame","x":720,"y":360,"w":680,"h":420,"title":"Connection","color":"fog"},
{"id":"m_fracce01","type":"frame","x":0,"y":820,"w":680,"h":420,"title":"Access and exclusion","color":"coral"},
{"id":"m_frchng01","type":"frame","x":720,"y":820,"w":680,"h":420,"title":"Change","color":"dusk"},
{"id":"m_title001","type":"text","x":0,"y":0,"w":1400,"h":60,"text":"Concept map: do community gardens improve neighbourhood wellbeing?","fontSize":28},
{"id":"m_hypoth01","type":"sticky","x":560,"y":100,"w":280,"h":200,"text":"H1: gardens improve wellbeing for the whole neighbourhood, not only for gardeners","color":"sand","fontSize":20},
{"id":"m_leglbl01","type":"text","x":0,"y":100,"w":480,"h":120,"text":"Left column: claims. Right column: the sources behind them. Green arrows support H1, red dashed arrows contradict it.","fontSize":14},
{"id":"m_clc1abcd","type":"doc","x":40,"y":420,"w":280,"h":56,"path":"documents/Findings/Claims and evidence/Taking up a plot improves mental wellbeing for gardeners.md","color":"mint"},
{"id":"m_clc5abcd","type":"doc","x":40,"y":520,"w":280,"h":56,"path":"documents/Findings/Claims and evidence/Gardeners eat more fruit and vegetables, but the effect is small.md","color":"mint"},
{"id":"m_srhart01","type":"doc","x":360,"y":420,"w":280,"h":56,"path":"documents/Sources/Sources/Green prescriptions.md","color":"sage"},
{"id":"m_srmbek01","type":"doc","x":360,"y":520,"w":280,"h":56,"path":"documents/Sources/Sources/Harvest and health.md","color":"sage"},
{"id":"m_strest01","type":"sticky","x":40,"y":620,"w":600,"h":120,"text":"Strongest evidence in the set, but it is about gardeners, not neighbours.","color":"mint"},
{"id":"m_clc2abcd","type":"doc","x":760,"y":420,"w":280,"h":56,"path":"documents/Findings/Claims and evidence/Benefits reach non-gardeners through everyday contact at the fence.md","color":"fog"},
{"id":"m_clc3abcd","type":"doc","x":760,"y":500,"w":280,"h":56,"path":"documents/Findings/Claims and evidence/Gardens mostly deepen ties among people who already knew each other.md","color":"fog"},
{"id":"m_clc8abcd","type":"doc","x":760,"y":580,"w":280,"h":56,"path":"documents/Findings/Claims and evidence/Gardens work as third places where people linger without spending money.md","color":"fog"},
{"id":"m_srcast01","type":"doc","x":1080,"y":420,"w":280,"h":56,"path":"documents/Sources/Sources/Neighbours over the fence.md","color":"sage"},
{"id":"m_srokaf01","type":"doc","x":1080,"y":500,"w":280,"h":56,"path":"documents/Sources/Sources/Digging in together.md","color":"sage"},
{"id":"m_intp0401","type":"doc","x":1080,"y":580,"w":280,"h":56,"path":"documents/Findings/Interview notes - P04.md","color":"peach"},
{"id":"m_stconn01","type":"sticky","x":760,"y":660,"w":600,"h":100,"text":"The fence, not the plot, is where the neighbourhood meets the garden.","color":"sand"},
{"id":"m_clc4abcd","type":"doc","x":40,"y":880,"w":280,"h":56,"path":"documents/Findings/Claims and evidence/Waiting lists and tenure rules shut out newer and renting residents.md","color":"coral"},
{"id":"m_clc7abcd","type":"doc","x":40,"y":980,"w":280,"h":56,"path":"documents/Findings/Claims and evidence/Shared governance widens who takes part.md","color":"coral"},
{"id":"m_srrami01","type":"doc","x":360,"y":880,"w":280,"h":56,"path":"documents/Sources/Sources/Waiting for a plot.md","color":"sage"},
{"id":"m_sradey01","type":"doc","x":360,"y":980,"w":280,"h":56,"path":"documents/Sources/Sources/Cultivating the commons.md","color":"sage"},
{"id":"m_stacce01","type":"sticky","x":40,"y":1080,"w":600,"h":120,"text":"Gap: renters are almost absent from the evidence. Recruit them for P09 to P12.","color":"coral"},
{"id":"m_clc6abcd","type":"doc","x":760,"y":880,"w":280,"h":56,"path":"documents/Findings/Claims and evidence/New gardens can speed up green gentrification.md","color":"dusk"},
{"id":"m_srbroo01","type":"doc","x":1080,"y":880,"w":280,"h":56,"path":"documents/Sources/Sources/Green gentrification and the edible city.md","color":"sage"},
{"id":"m_stchng01","type":"sticky","x":760,"y":980,"w":600,"h":120,"text":"Gap: nobody has measured rents near new gardens. Ask the council for data.","color":"blossom"},
{"id":"m_litrev01","type":"doc","x":1080,"y":1100,"w":280,"h":56,"path":"documents/Synthesis/Literature review draft.md","color":"fog"}
],"connectors":[
{"from":"m_srhart01","to":"m_clc1abcd","label":"evidence"},
{"from":"m_srmbek01","to":"m_clc5abcd","label":"evidence"},
{"from":"m_srcast01","to":"m_clc2abcd","label":"evidence"},
{"from":"m_intp0401","to":"m_clc2abcd","label":"illustrates"},
{"from":"m_srokaf01","to":"m_clc3abcd","label":"evidence"},
{"from":"m_srokaf01","to":"m_clc8abcd","label":"cites","style":{"dash":"dotted"}},
{"from":"m_srrami01","to":"m_clc4abcd","label":"evidence"},
{"from":"m_sradey01","to":"m_clc7abcd","label":"evidence"},
{"from":"m_srbroo01","to":"m_clc6abcd","label":"evidence"},
{"from":"m_clc1abcd","to":"m_hypoth01","label":"supports","style":{"color":"#2f9e44"}},
{"from":"m_clc2abcd","to":"m_hypoth01","label":"supports","style":{"color":"#2f9e44"}},
{"from":"m_clc3abcd","to":"m_clc2abcd","label":"qualifies"},
{"from":"m_clc4abcd","to":"m_hypoth01","label":"contradicts","style":{"color":"#e03131","dash":"dashed"}},
{"from":"m_clc6abcd","to":"m_hypoth01","label":"contradicts","style":{"color":"#e03131","dash":"dashed"}},
{"from":"m_clc4abcd","to":"m_clc3abcd","label":"same insiders"},
{"from":"m_clc7abcd","to":"m_clc4abcd","label":"a fix?","style":{"dash":"dotted"}}
],"strokes":[]}
```
