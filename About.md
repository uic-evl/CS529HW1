# About

We rebuilt the page to make the given data **clear and fair**.We have designed the visualization where you can switch between two views: **total deaths** and **deaths per 100,000 people** (so big states don’t automatically look worse). Colors are calm and color-blind–friendly (green for totals, blue for rates). Legends are easy to read and labeled; state tooltips show **Gun deaths**, **Population**, and **Rate per 100k**. City dots still show totals, and their **area** matches the number so sizes feel right. 

Behind the scenes, we load the Slate data, **sum city records to state totals**, and compute **per-100k** using **U.S. Census** populations. The bottom panel shows a **Male vs Female** bar chart. When a state is selected, it switches to **that state’s cities**; if there are many, we show the **top 25 by deaths**, listed **alphabetically** to keep labels readable. We assume the listed city is the incident location and keep city dots as totals.

---

## Credits & Sources
- Color choices inspired by **ColorBrewer** (sequential, color-blind–friendly).
- Built with **D3**.
- **US GeoJSON** by Eric Celeste: https://eric.clst.org/tech/usgeojson/
- **U.S. Census** state populations (2010s series): https://www.census.gov/data/tables/time-series/demo/popest/2010s-state-total.html
- **Slate gun-death dataset**: https://www.slate.com/articles/news_and_politics/crime/2012/12/gun_death_tally_every_american_gun_death_since_newtown_sandy_hook_shooting.html
