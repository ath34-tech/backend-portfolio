const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());


// Your handles (as requested)
const CODEFORCES_HANDLE = "athtripathi";
const CODECHEF_HANDLE = "secretmagician";
const ATCODER_HANDLE = "athtripathi";

// Get Codeforces rating and maxRating
async function getCodeforcesRating() {
  try {
    const url = `https://codeforces.com/api/user.info?handles=athtripathi`;
    const response = await axios.get(url);
    const user = response.data.result[0];
    return {
      current: user.rating || "Unrated",
      max: user.maxRating || "Unrated"
    };
  } catch {
    return { current: "Unavailable", max: "Unavailable" };
  }
}

// Get CodeChef rating (only current available)
async function getCodechefRating() {
  try {
    const url = `https://codechef-api.vercel.app/handle/secretmagician`;
    const response = await axios.get(url);
    return { current: response.data.rating || "Unrated", max: "N/A" };
  } catch {
    return { current: "Unavailable", max: "N/A" };
  }
}

// Get AtCoder rating and max rating (optional)
async function getAtcoderRating() {
  try {
    const url = `https://atcoder-api.herokuapp.com/user/athtripathi`;
    const response = await axios.get(url);
    return {
      current: response.data.rating || "Unrated",
      max: response.data.highest_rating || "Unrated"
    };
  } catch {
    return { current: "Unavailable", max: "Unavailable" };
  }
}

// Updated API endpoint
app.get("/api/ratings", async (req, res) => {
  try {
    const [codeforces, atcoder] = await Promise.all([
      getCodeforcesRating(),
      getAtcoderRating()
    ]);
    const codechef="1602";
    res.json({ codeforces, codechef, atcoder });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ratings." });
  }
});

app.get("/api/blogs", (req, res) => {
  const dataPath = path.join(__dirname, "blog_data.json");
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Unable to read blog data." });
    }
    try {
      const blogs = JSON.parse(data);
      res.json({ blogs });
    } catch {
      res.status(500).json({ error: "Blog data is not valid JSON." });
    }
  });
});



app.get("/api/github", async (req, res) => {
  const username = "ath34-tech";
  try {
    const url = `https://api.github.com/users/${username}/repos?per_page=100`;
    const response = await axios.get(url, {
      headers: {
        "Accept": "application/vnd.github.v3+json"
      }
    });
    const repos = response.data.map(repo => ({
      name: repo.name,
      html_url: repo.html_url,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      homepage: repo.homepage,
      created_at: repo.created_at,
      updated_at: repo.updated_at
    }));
    res.json({ repos });
  } catch {
    res.status(500).json({ error: "Failed to fetch GitHub repos." });
  }
});


// ---- Top 5 projects endpoint ----
app.get("/api/github/top", async (req, res) => {
  const username = "ath34-tech"; // your GitHub username
  const url = `https://api.github.com/users/${username}/repos?per_page=100`;

  try {
    const response = await axios.get(url, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
        // Authorization: `Bearer <optional-token>`
      }
    });

    const topRepos = response.data
      .filter(repo => !repo.fork && repo.stargazers_count > 0)
      .sort((a, b) => {
        const scoreA = a.stargazers_count * 2 + a.forks_count;
        const scoreB = b.stargazers_count * 2 + b.forks_count;
        return scoreB - scoreA;
      })
      .slice(0, 5)
      .map(repo => ({
        name: repo.name,
        html_url: repo.html_url,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        homepage: repo.homepage,
        created_at: repo.created_at,
        updated_at: repo.updated_at
      }));

    res.json({ repos: topRepos });
  } catch (error) {
    console.error("GitHub API error:", error.message);
    res.status(500).json({ error: "Failed to fetch top GitHub repos." });
  }
});



// === Start Server ===
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
