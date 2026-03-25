export default {
  async fetch(request, env) {
    const ADMIN_KEY = env.ADMIN_SECRET;

    const AGE_GROUPS = [
      "Méně než 17", "18 - 24", "25 - 34", "35 - 44",
      "45 - 54", "55 - 64", "65 a více"
    ];

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", 
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const urlKey = url.searchParams.get("key");

    // POMOCNÁ FUNKCE: Snadné přičítání do databáze
    async function incrementCounter(key) {
      let val = await env.eduStats.get(key);
      val = parseInt(val || 0) + 1;
      await env.eduStats.put(key, val.toString());
      return val;
    }

    try {
      // Získáme školu z URL parametru (např. /track-visit?school=muni)
      const schoolParam = url.searchParams.get("school") || "nezadano";

      // 1. Započítat návštěvu
      if (url.pathname === "/visit") {
        const total = await incrementCounter(`${schoolParam}_visits`);
        return new Response(JSON.stringify({ total }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // 2. Započítat kliknutí na Login
      if (url.pathname === "/track-login-click") {
        const total = await incrementCounter(`${schoolParam}_login_clicks`);
        return new Response(JSON.stringify({ total }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // 3. Započítat zobrazení okna
      if (url.pathname === "/track-modal-view") {
        const total = await incrementCounter(`${schoolParam}_modal_views`);
        return new Response(JSON.stringify({ total }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // 4. Uložení stažení a věku (POST /wtf)
      if (url.pathname === "/wtf" && request.method === "POST") {
        const data = await request.json();
        const selectedAge = data.age;
        const selectedSchool = data.school || "nezadano"; 

        if (selectedAge && AGE_GROUPS.includes(selectedAge)) {
          // Uložíme stažení a věk pod konkrétní školu (např. muni_downloads, muni_age_18 - 24)
          await incrementCounter(`${selectedSchool}_downloads`);
          await incrementCounter(`${selectedSchool}_age_${selectedAge}`);
          
          return new Response(JSON.stringify({ message: "Uloženo" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        return new Response("Neplatná data", { status: 400, headers: corsHeaders });
      }

      // -------------------------------------------------------------
      // ADMIN ZÓNA (Výpis a mazání)
      // -------------------------------------------------------------
      if (url.pathname === "/stats" || url.pathname === "/delete") {
        if (urlKey !== ADMIN_KEY) {
            return new Response(JSON.stringify({ error: "Špatné heslo" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // A) CHYTRÝ VÝPIS STATISTIK PODLE ŠKOL
        if (url.pathname === "/stats") {
            const list = await env.eduStats.list();
            const result = {};

            for (const keyObj of list.keys) {
                const key = keyObj.name;
                const val = parseInt(await env.eduStats.get(key) || 0);

                // Rozdělíme klíč podle prvního podtržítka (např. "muni_visits" -> "muni" a "visits")
                const firstUnderscore = key.indexOf('_');
                if (firstUnderscore === -1) continue; 

                const school = key.substring(0, firstUnderscore);
                const metric = key.substring(firstUnderscore + 1);

                // Pokud školu ještě nemáme ve výsledku, vytvoříme jí prázdný šuplík
                if (!result[school]) {
                    result[school] = {
                        visits: 0, login_clicks: 0, modal_views: 0, downloads: 0, age_breakdown: {}
                    };
                    AGE_GROUPS.forEach(a => result[school].age_breakdown[a] = 0);
                }

                // Roztřídíme hodnoty do správných chlívků
                if (metric.startsWith("age_")) {
                    const ageStr = metric.substring(4);
                    result[school].age_breakdown[ageStr] = val;
                } else if (["visits", "login_clicks", "modal_views", "downloads"].includes(metric)) {
                    result[school][metric] = val;
                }
            }
            
            return new Response(JSON.stringify(result, null, 2), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // B) BEZPEČNÉ SMAZÁNÍ VŠEHO
        if (url.pathname === "/delete") {
            const list = await env.eduStats.list();
            for (const keyObj of list.keys) {
                await env.eduStats.delete(keyObj.name);
            }
            return new Response("Databáze všech škol byla úspěšně vymazána.", { headers: corsHeaders });
        }
      }

      return new Response("Not found", { status: 404, headers: corsHeaders });

    } catch (err) {
      return new Response("Error: " + err.message, { status: 500, headers: corsHeaders });
    }
  }
};