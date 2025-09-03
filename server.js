const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headerit (jotta esim. selaimesta voi testata)
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Content-type", "application/json");
  next();
});

// funktio: lue sanakirja tiedostosta
function readDictionary() {
  if (!fs.existsSync("./sanakirja.txt")) {
    fs.writeFileSync("./sanakirja.txt", ""); // luodaan tyhjä tiedosto jos ei ole
  }

  const data = fs.readFileSync("./sanakirja.txt", "utf8");
  const lines = data.split(/\r?\n/).filter((line) => line.trim() !== "");
  return lines.map((line) => {
    const [fin, eng] = line.split(" ");
    return { fin, eng };
  });
}

// funktio: lisää uuden sanan tiedostoon
function addWord(fin, eng) {
  fs.appendFileSync("./sanakirja.txt", `\n${fin} ${eng}`);
}

// GET /words/:fin -> palauttaa englanninkielisen sanan
app.get("/words/:fin", (req, res) => {
  const dictionary = readDictionary();
  const word = dictionary.find((w) => w.fin === req.params.fin);
  if (word) {
    res.json(word);
  } else {
    res.status(404).json({ message: "Sanaa ei löydy" });
  }
});

// POST /words -> lisää uuden sanaparin
// body: { "fin": "koira", "eng": "dog" }
app.post("/words", (req, res) => {
  const { fin, eng } = req.body;
  if (!fin || !eng) {
    return res.status(400).json({ message: "Anna sekä fin että eng" });
  }
  addWord(fin, eng);
  res.json({ message: "Sana lisätty onnistuneesti", fin, eng });
});

// kuuntelee porttia 3000
app.listen(3000, () => {
  console.log("Sanakirja-API kuuntelee portissa 3000");
});
