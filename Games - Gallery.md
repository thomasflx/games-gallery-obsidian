---
cssClass: cards, cards-16-9, table-max
---

```dataview
table without id 
	("![](" + poster + ")") as Poster,
	file.link as Title,
	string(released) as Released,
	"Genre:" + " " + genre as Genre,
	"Platform:" + " " + platform as Platform,
	"Store:" + " " + store as Store,
	"ESRB:" + " " + esrbRating as ESRB,
	"RAWG:" + " " + scoreRawg as "RAWG Rating",
	"Rating:" + " " + rating as "Personal Rating",
	"Completed:" + " " + contains(file.tags, "complete") as Completed
from "Games"
where poster != null and file.name != "Movie - Template"
```

