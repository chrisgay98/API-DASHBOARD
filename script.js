// helpers
function setLoading(el, msg = "Loading...") {
  if (!el) return;
  el.innerHTML = `<p class="small">${msg}</p>`;
}
function setError(el, msg = "Something went wrong.") {
  if (!el) return;
  el.innerHTML = `<p class="error">${msg}</p>`;
}
function cleanCode(str) {
  return String(str || "").trim().toUpperCase();
}

// safe binder (prevents errors if an element doesn't exist)
function onClick(id, handler) {
  const el = document.getElementById(id);
  if (!el) return; // silently skip if not on the page
  el.addEventListener("click", handler);
}
function byId(id) {
  return document.getElementById(id);
}

/* =========================
   1) GitHub Profile Search
   ========================= */
onClick("gh-btn", getGitHubProfile);

async function getGitHubProfile() {
  const username = byId("gh-user")?.value?.trim();
  const out = byId("gh-output");

  if (!out) return;
  if (!username) return setError(out, "Enter a GitHub username.");
  setLoading(out);

  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}`
    );
    if (!res.ok) throw new Error("Not found");
    const data = await res.json();

    out.innerHTML = `
      <div style="display:flex; gap:12px; align-items:center;">
        <img src="${data.avatar_url}" alt="avatar"
          style="width:70px; height:70px; border-radius:50%;" />
        <div>
          <p><strong>${data.name || data.login}</strong></p>
          <p class="small">@${data.login}</p>
          <p class="small">Repos: ${data.public_repos} | Followers: ${data.followers}</p>
          <a href="${data.html_url}" target="_blank" rel="noreferrer">Open Profile</a>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    setError(out, "Could not load that GitHub profile.");
  }
}

/* =========================
   2) Currency Converter
   ========================= */
onClick("cur-btn", convertCurrency);

async function convertCurrency() {
  const out = byId("cur-output");
  if (!out) return;

  const amount = Number(byId("cur-amount")?.value);
  const from = cleanCode(byId("cur-from")?.value);
  const to = cleanCode(byId("cur-to")?.value);

  if (!amount || amount <= 0) return setError(out, "Enter a valid amount.");
  if (!from || !to) return setError(out, "Enter currency codes like USD/EUR.");

  setLoading(out);

  try {
    const res = await fetch(
      `https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`
    );
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();

    const rate = data?.rates?.[to];
    if (!rate) throw new Error("Bad currency");

    const converted = (amount * rate).toFixed(2);

    out.innerHTML = `
      <p><strong>${amount} ${from}</strong> = <strong>${converted} ${to}</strong></p>
      <p class="small">Rate: 1 ${from} = ${rate} ${to}</p>
    `;
  } catch (err) {
    console.error(err);
    setError(out, "Conversion failed. Check your currency codes.");
  }
}

/* =========================
   3) Dictionary + Audio
   ========================= */
onClick("word-btn", defineWord);

async function defineWord() {
  const out = byId("word-output");
  if (!out) return;

  const word = byId("word-input")?.value?.trim();
  if (!word) return setError(out, "Enter a word.");
  setLoading(out);

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );
    if (!res.ok) throw new Error("No definition");
    const data = await res.json();

    const entry = data[0];
    const meaning = entry.meanings?.[0];
    const def = meaning?.definitions?.[0]?.definition || "No definition found.";
    const part = meaning?.partOfSpeech || "";

    const audioObj = entry.phonetics?.find((p) => p.audio);
    const audioUrl = audioObj?.audio || "";

    out.innerHTML = `
      <p><strong>${entry.word}</strong> ${
        entry.phonetic ? `— <em>${entry.phonetic}</em>` : ""
      }</p>
      <p><strong>${part}</strong>: ${def}</p>
      ${
        audioUrl
          ? `<audio controls src="${audioUrl}" style="width:100%;"></audio>`
          : `<p class="small">No audio available.</p>`
      }
    `;
  } catch (err) {
    console.error(err);
    setError(out, "Could not find a definition for that word.");
  }
}

/* =========================
   4) Dog Image
   IDs: dog-btn, dog-output
   ========================= */
onClick("dog-btn", getDogImage);

async function getDogImage() {
  const out = byId("dog-output");
  if (!out) return;

  setLoading(out);
  try {
    const res = await fetch("https://dog.ceo/api/breeds/image/random");
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();

    out.innerHTML = `
      <img src="${data.message}" alt="Random dog"
        style="width:100%; border-radius:12px;" />
    `;
  } catch (e) {
    console.error(e);
    setError(out, "Could not load a dog image.");
  }
}

/* =========================
   5) Cat Image
   IDs: catimg-btn, catimg-output
   ========================= */
onClick("catimg-btn", getCatImage);

async function getCatImage() {
  const out = byId("catimg-output");
  if (!out) return;

  setLoading(out);
  try {
    const res = await fetch("https://api.thecatapi.com/v1/images/search");
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();

    const img = data?.[0]?.url;
    if (!img) throw new Error("No image");

    out.innerHTML = `
      <img src="${img}" alt="Random cat"
        style="width:100%; border-radius:12px;" />
    `;
  } catch (e) {
    console.error(e);
    setError(out, "Could not load a cat image.");
  }
}

/* =========================
   6) Joke
   IDs: joke-btn, joke-output
   ========================= */
onClick("joke-btn", getJoke);

async function getJoke() {
  const out = byId("joke-output");
  if (!out) return;

  setLoading(out);
  try {
    const res = await fetch("https://v2.jokeapi.dev/joke/Any?safe-mode");
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();

    if (data.type === "single") {
      out.innerHTML = `<p>${data.joke}</p>`;
    } else {
      out.innerHTML = `<p><strong>${data.setup}</strong></p><p>${data.delivery}</p>`;
    }
  } catch (e) {
    console.error(e);
    setError(out, "Could not load a joke.");
  }
}

/* =========================
   7) Weather (Open-Meteo)
   city -> geocode -> weather
   IDs: wx-btn, wx-city, wx-output
   ========================= */
onClick("wx-btn", getWeather);

async function getWeather() {
  const out = byId("wx-output");
  if (!out) return;

  const city = byId("wx-city")?.value?.trim();
  if (!city) return setError(out, "Enter a city (example: San Jose).");

  setLoading(out);

  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city
      )}&count=1&language=en&format=json`
    );
    if (!geoRes.ok) throw new Error("Geo failed");

    const geo = await geoRes.json();
    const place = geo?.results?.[0];
    if (!place) throw new Error("City not found");

    const wxRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current_weather=true`
    );
    if (!wxRes.ok) throw new Error("Weather failed");

    const wx = await wxRes.json();
    const cw = wx?.current_weather;
    if (!cw) throw new Error("No weather");

    out.innerHTML = `
      <p><strong>${place.name}${
      place.admin1 ? `, ${place.admin1}` : ""
    }${place.country ? `, ${place.country}` : ""}</strong></p>
      <p>Temp: <strong>${cw.temperature}°C</strong></p>
      <p class="small">Wind: ${cw.windspeed} km/h • Time: ${cw.time}</p>
    `;
  } catch (e) {
    console.error(e);
    setError(out, "Could not load weather for that city.");
  }
}

/* =========================
   22) Cat Facts
   IDs: catfact-btn, catfact-output
   ========================= */
onClick("catfact-btn", getCatFact);

async function getCatFact() {
  const out = byId("catfact-output");
  if (!out) return;

  setLoading(out);
  try {
    const res = await fetch("https://catfact.ninja/fact");
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();

    out.innerHTML = `
      <p><strong>Cat Fact:</strong> ${data.fact}</p>
      <p class="small">Length: ${data.length}</p>
    `;
  } catch (err) {
    console.error(err);
    setError(out, "Could not load a cat fact.");
  }
}

/* =========================
   31) Rick & Morty Character
   IDs: rm-btn, rm-id, rm-output
   ========================= */
onClick("rm-btn", getRickMortyCharacter);

async function getRickMortyCharacter() {
  const out = byId("rm-output");
  if (!out) return;

  const id = String(byId("rm-id")?.value ?? "1").trim();
  if (!id) return setError(out, "Enter a character id (example: 1).");

  setLoading(out);
  try {
    const res = await fetch(
      `https://rickandmortyapi.com/api/character/${encodeURIComponent(id)}`
    );
    if (!res.ok) throw new Error("Not found");
    const c = await res.json();

    out.innerHTML = `
      <div style="display:flex; gap:12px; align-items:center;">
        <img src="${c.image}" alt="${c.name}"
          style="width:70px; height:70px; border-radius:12px; object-fit:cover;" />
        <div>
          <p><strong>${c.name}</strong></p>
          <p class="small">${c.species} • ${c.status}</p>
          <p class="small">Origin: ${c.origin?.name || "Unknown"}</p>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    setError(out, "Could not load that character.");
  }
}

/* =========================
   32) Studio Ghibli Films
   IDs: ghibli-btn, ghibli-output
   ========================= */
onClick("ghibli-btn", getGhibliFilms);

async function getGhibliFilms() {
  const out = byId("ghibli-output");
  if (!out) return;

  setLoading(out);
  try {
    const res = await fetch("https://ghibliapi.vercel.app/films");
    if (!res.ok) throw new Error("Failed");
    const films = await res.json();

    const top = films.slice(0, 5);
    out.innerHTML = `
      <p><strong>Studio Ghibli (first 5 films returned):</strong></p>
      <ul style="margin:8px 0 0 18px;">
        ${top
          .map((f) => `<li><strong>${f.title}</strong> (${f.release_date})</li>`)
          .join("")}
      </ul>
      <p class="small">Total films: ${films.length}</p>
    `;
  } catch (err) {
    console.error(err);
    setError(out, "Could not load Ghibli films.");
  }
}

/* =========================
   35) Bob’s Burgers Character
   IDs: bobs-btn, bobs-id, bobs-output
   ========================= */
onClick("bobs-btn", getBobsCharacter);

async function getBobsCharacter() {
  const out = byId("bobs-output");
  if (!out) return;

  const id = String(byId("bobs-id")?.value ?? "1").trim();
  if (!id) return setError(out, "Enter a character id (example: 1).");

  setLoading(out);
  try {
    const res = await fetch(
      `https://bobsburgers-api.herokuapp.com/characters/${encodeURIComponent(id)}`
    );
    if (!res.ok) throw new Error("Not found");
    const ch = await res.json();

    out.innerHTML = `
      <p><strong>${ch.name}</strong></p>
      <p class="small">Gender: ${ch.gender || "Unknown"}</p>
      <p class="small">Hair: ${ch.hairColor || "Unknown"} • Occupation: ${
      ch.occupation || "Unknown"
    }</p>
      ${
        ch.image
          ? `<img src="${ch.image}" alt="${ch.name}" style="width:100%; border-radius:12px; margin-top:8px;" />`
          : ""
      }
    `;
  } catch (err) {
    console.error(err);
    setError(out, "Could not load that Bob’s Burgers character.");
  }
}

/* =========================
   Replacement #1) Random User
   IDs: user-btn, user-output
   ========================= */
onClick("user-btn", getRandomUser);

async function getRandomUser() {
  const out = byId("user-output");
  if (!out) return;

  setLoading(out);
  try {
    const res = await fetch("https://randomuser.me/api/");
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();

    const u = data?.results?.[0];
    if (!u) throw new Error("No user");

    const name = `${u.name?.first || ""} ${u.name?.last || ""}`.trim();
    const email = u.email || "N/A";
    const city = u.location?.city || "";
    const state = u.location?.state || "";
    const country = u.location?.country || "";
    const pic = u.picture?.large || "";

    out.innerHTML = `
      <div style="display:flex; gap:12px; align-items:center;">
        ${
          pic
            ? `<img src="${pic}" alt="${name}" style="width:70px; height:70px; border-radius:12px; object-fit:cover;" />`
            : ""
        }
        <div>
          <p><strong>${name || "Random User"}</strong></p>
          <p class="small">${email}</p>
          <p class="small">${[city, state, country].filter(Boolean).join(", ")}</p>
        </div>
      </div>
    `;
  } catch (e) {
    console.error(e);
    setError(out, "Could not load a random user.");
  }
}


onClick("poke-btn", getPokemon);

async function getPokemon() {
  const out = byId("poke-output");
  if (!out) return;

  const raw = byId("poke-name")?.value ?? "";
  const nameOrId = String(raw).trim().toLowerCase();

  if (!nameOrId)
    return setError(out, "Enter a Pokémon name or ID (example: pikachu).");

  setLoading(out);

  try {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nameOrId)}`
    );
    if (!res.ok) throw new Error("Not found");
    const p = await res.json();

    const sprite = p?.sprites?.front_default || "";
    const types = (p.types || [])
      .map((t) => t.type?.name)
      .filter(Boolean)
      .join(", ");
    const height = p.height != null ? `${p.height / 10} m` : "N/A";
    const weight = p.weight != null ? `${p.weight / 10} kg` : "N/A";

    out.innerHTML = `
      <div style="display:flex; gap:12px; align-items:center;">
        ${
          sprite
            ? `<img src="${sprite}" alt="${p.name}" style="width:70px; height:70px; border-radius:12px; object-fit:contain; background:#f4f6f8;" />`
            : ""
        }
        <div>
          <p><strong>${(p.name || "").toUpperCase()}</strong> <span class="small">#${p.id}</span></p>
          <p class="small">Type: ${types || "Unknown"}</p>
          <p class="small">Height: ${height} • Weight: ${weight}</p>
        </div>
      </div>
    `;
  } catch (e) {
    console.error(e);
    setError(out, "Could not find that Pokémon. Try a different name or ID.");
  }
}


const TMDB_API_KEY = ""; 

onClick("tmdb-btn", getTrendingMovies);

async function getTrendingMovies() {
  const out = byId("tmdb-output");
  if (!out) return;

  if (!TMDB_API_KEY)
    return setError(out, "TMDB API key missing. Add it in script.js.");

  setLoading(out);

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/trending/movie/day?api_key=${encodeURIComponent(
        TMDB_API_KEY
      )}`
    );
    if (!res.ok) throw new Error("TMDB failed");
    const data = await res.json();

    const movies = (data.results || []).slice(0, 5);
    out.innerHTML = `
      <p><strong>Trending Movies (Top 5)</strong></p>
      <ul style="margin:8px 0 0 18px;">
        ${movies
          .map(
            (m) =>
              `<li><strong>${m.title}</strong> (${
                (m.release_date || "").slice(0, 4) || "N/A"
              })</li>`
          )
          .join("")}
      </ul>
    `;
  } catch (e) {
    console.error(e);
    setError(out, "Could not load trending movies.");
  }
}
