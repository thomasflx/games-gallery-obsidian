const notice = (msg) => new Notice(msg, 5000);
const log = (msg) => console.log(msg);

const API_KEY_OPTION = "RAWG API Key";
const API_URL = "https://api.rawg.io/api/games";

module.exports = {
  entry: start,
  settings: {
    name: "Game Script",
    author: "Thomasflx",
    credits: "Based on Christian B. B. Houmann's movie.js",
    options: {
      [API_KEY_OPTION]: {
        type: "text",
        defaultValue: "",
        placeholder: "RAWG API Key",
      },
    },
  },
};

let QuickAdd;
let Settings;

async function start(params, settings) {
  try {
    QuickAdd = params;
    Settings = settings;

    const query = await QuickAdd.quickAddApi.inputPrompt(
      "Enter the game Title: "
    );
    if (!query) {
      notice("The title can't be empty.");
      throw new Error("The title can't be empty.");
    }

    let selectedShow;

    if (isRawgId(query)) {
      selectedShow = await getByRawgId(query);
    } else {
      const results = await getByQuery(query);

      const choice = await QuickAdd.quickAddApi.suggester(
        results.map(formatTitleForSuggestion),
        results
      );
      if (!choice) {
        notice("Game not selected.");
        throw new Error("Game not selected.");
      }

      selectedShow = choice;
    }

    QuickAdd.variables = {
      ...selectedShow,
      genresLinks: selectedShow.genres && selectedShow.genres.length > 0 ? linkifyList(selectedShow.genres.map(g => g.name), "Genres") : "N/A",
      platformsLinks: selectedShow.parent_platforms && selectedShow.parent_platforms.length > 0 ? linkifyList(selectedShow.parent_platforms.map(p => p.platform.name), "Platforms") : "N/A",
      storesLinks: selectedShow.stores && selectedShow.stores.length > 0 ? linkifyList(selectedShow.stores.map(p => p.store.name), "Stores") : "N/A",
      esrbRating: selectedShow.esrb_rating && selectedShow.esrb_rating.name ? selectedShow.esrb_rating.name : "N/A",
      fileName: replaceIllegalFileNameCharactersInString(selectedShow.name),
      playtime: selectedShow.playtime ? selectedShow : "N/A"
    };
  } catch(err) {
    notice(err.message);
    throw new Error(err.stack);
  }
}

function isRawgId(str) {
  return /^tt\d+$/.test(str);
}

function formatTitleForSuggestion(resultItem) {
  if (resultItem.released)
    return `${resultItem.name} (${
      resultItem.released.split('-')[0]
    })`;
  else
    return `${resultItem.name}`;
}

async function getByQuery(query) {
  const searchResults = await apiGet(API_URL, {
    search: query,
  });

  if (!searchResults || !searchResults.results || !searchResults.results.length) {
    notice("No results found.");
    throw new Error("No results found.");
  }

  return searchResults.results;
}

async function getByRawgId(id) {
  const res = await apiGet(API_URL, {
    id: id,
  });

  if (!res) {
    notice("No results found.");
    throw new Error("No results found.");
  }

  return res;
}

function stringfyList(list) {
  if (list.length === 0) return "";
  if (list.length === 1) return list[0];

  return list.map((item) => item.trim()).join(", ");
}

function linkifyList(list, folder = null) {
  if (list.length === 0) return "";

  if (folder && folder.length > 0) folder = `${folder}/`;
  else folder = "";

  if (list.length === 1) return `[[Games/${folder}${list[0]}]]`;

  return list.map((item) => `[[Games/${folder}${item.trim()}]]`).join(", ");
}

function replaceIllegalFileNameCharactersInString(string) {
  return string.replace(/[\\,#%&\{\}\/*<>?$\'\":@]*/g, "");
}

async function apiGet(url, data) {
  let finalURL = new URL(url);
  if (data)
    Object.keys(data).forEach((key) =>
      finalURL.searchParams.append(key, data[key])
    );

  finalURL.searchParams.append("key", Settings[API_KEY_OPTION]);

  const res = await request({
    url: finalURL.href,
    method: "GET",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return JSON.parse(res);
}
