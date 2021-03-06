chartobj = [];
matches = []; //Holds exact string/substring matches
dict2 = []; //Reference Dictionary
bgs = [
  //Sets of backgrounds, currently Unused
  "https://play.pokemonshowdown.com/sprites/gen6bgs/bg-aquacordetown.jpg",
  "https://play.pokemonshowdown.com/sprites/gen6bgs/bg-beach.jpg",
  "https://play.pokemonshowdown.com/sprites/gen6bgs/bg-city.jpg",
  "https://play.pokemonshowdown.com/sprites/gen6bgs/bg-dampcave.jpg",
  "https://play.pokemonshowdown.com/sprites/gen6bgs/bg-darkbeach.jpg",
  "https://play.pokemonshowdown.com/sprites/gen6bgs/bg-darkcity.jpg",
  "https://play.pokemonshowdown.com/sprites/gen6bgs/bg-darkmeadow.jpg",
  "https://play.pokemonshowdown.com/sprites/gen6bgs/bg-deepsea.jpg",
  "https://play.pokemonshowdown.com/sprites/gen6bgs/bg-desert.jpg",
  "https://play.pokemonshowdown.com/sprites/gen6bgs/bg-earthycave.jpg",
  "https://play.pokemonshowdown.com/sprites/gen6bgs/bg-elite4drake.jpg",
  "https://play.pokemonshowdown.com/sprites/gen6bgs/bg-forest.jpg",
  "https://play.pokemonshowdown.com/sprites/gen6bgs/bg-icecave.jpg",
  "https://play.pokemonshowdown.com/sprites/gen6bgs/bg-leaderwallace.jpg",
  "https://play.pokemonshowdown.com/sprites/gen6bgs/bg-library.jpg",
  "https://play.pokemonshowdown.com/sprites/gen6bgs/bg-meadow.jpg",
  "https://play.pokemonshowdown.com/sprites/gen6bgs/bg-orasdesert.jpg",
  "https://play.pokemonshowdown.com/sprites/gen6bgs/bg-orassea.jpg",
  "https://play.pokemonshowdown.com/sprites/gen6bgs/bg-skypillar.jpg"
];

cpmlist={
  1:0.094,
  2:0.16639787,
  3:0.21573247,
  4:0.25572005,
  5:0.29024988,
  6:0.3210876,
  7:0.34921268,
  8:0.3752356,
  9:0.39956728,
  10:0.4225,
  11:0.44310755,
  12:0.4627984,
  13:0.48168495,
  14:0.49985844,
  15:0.51739395,
  16:0.5343543,
  17:0.5507927,
  18:0.5667545,
  19:0.5822789,
  20:0.5974,
  21:0.6121573,
  22:0.6265671,
  23:0.64065295,
  24:0.65443563,
  25:0.667934,
  26:0.6811649,
  27:0.69414365,
  28:0.7068842,
  29:0.7193991,
  30:0.7317,
  31:0.7377695,
  32:0.74378943,
  33:0.74976104,
  34:0.7556855,
  35:0.76156384,
  36:0.76739717,
  37:0.7731865,
  38:0.77893275,
  39:0.784637,
  40:0.7903
}

/* $.get(
  "/php/pokedex.php", {}, //Build Dictionary
  function (data, status) {
    dictparsed = JSON.parse(data);
    dict2 = dictparsed;
  }
); */

$.getJSON('php/pokedex.json', function (data) {
  dict2 = data;
})

/* Calculate Luvenshtein Distance between two words using a very elementay approach.
        Limitations - 
            1. Doesn't work if a.length>b.length as it fails to iterate all the way over b
            2. Results have not been verified but still serve the purpose and is therefore used
        Future Development - 
            1. Reimplement using proper algorithm
            2. Add distinct weights to misspellings (muk -> mak), skipping (vibrava -> vibrva), doubling(zweilous -> zweillous) and other errors
            3. Include ways to compensate for phonetically-similar letters (il<->ill) */
function dist(a, b) {
  al = a.length;
  bl = b.length;
  //console.log(al+" "+bl)
  i = 0;
  ib = 0;
  cnt = 0;
  //console.log("Checking till pos "+(Math.min(al,bl)-1))
  while (i < Math.min(al, bl)) {
    if (b.includes(a[i])) {
      ib = b.search(a[i]);
      b = b.substring(0, ib) + "0" + b.substring(ib + 1);
      //console.log("Matched in "+a+" at "+a[i]+" at "+i+" with "+b+" at "+ib+"\n")
      cnt = cnt + 1;
    }
    i = i + 1;
  }
  //console.log(cnt)
  cnt = bl - cnt + bl - al;
  //alert(cnt);
  return cnt;
}

function dist2(a, b) {
  //Workarund for the length limitation of dist, point of access for dist
  c = 1;
  if (a.length > b.length) {
    c = a;
    a = b;
    b = c;
    c = -1;
  }
  while (a.length < b.length) {
    a += " ";
  }
  d = Math.abs(dist(a, b));

  return d;
}

function rankgrader2(w) {
  //Aggregate best matches for given w. Also responsible for their formattting
  if (w == "") {
    //To avoid errors attempting to access empty text
    document.getElementById("suggestiontext").innerHTML = "";
    matches = "";
    return;
  }
  w = w[0].toUpperCase() + w.substring(1); //Capitalise first letters to match with dictionary, prob unecessary
  j = 0; //Counter for loops, i not used as it seems to access some random unrelated value
  rank = []; //Holds rank of each word in dictionary
  rankmin = 100; //Max rank threshold for it to be added to list, arbirtary
  sugg = ""; //Suggestion text
  sugg0 = ""; //Matches text, including substring matches
  suggid = -1; //Positon of suggestion
  suggadd = ""; //Temp var to hold suggestions during formatting
  suggraw0 = []; //Raw, unformated matches returned at end
  suggraw = []; //Raw, unformatted suggestions returned at end
  dictlocal = dict2; //Local copy of dictionary, likely unused
  while (j < dict2.length) {
    rank[j] = dist2(w, dict2[j].name);
    if (dict2[j].name.toLowerCase().includes(w.toLowerCase())) {
      //Substring matches, ignore case both ways
      suggadd = dict2[j].name;
      suggadd = "<span onclick='setentry(this.innerText)' class='filler'>" + suggadd + "</span>"
      suggraw0.push(suggadd);
      if (dict2[j].forms) {
        //Add data & icons if forms exist
        suggadd = "<b>" + suggadd + "</b>";
        switch (dict2[j].forms[1].spriteSuffix) {
          case "mega":
          case "mega-x":
          case "mega-y":
            suggadd +=
              "<img src='https://play.pokemonshowdown.com/sprites/misc/mega.png'>";
            break;
          case "primal":
            if (dict2[j].name == "Groudon") {
              suggadd +=
                "<img src='https://play.pokemonshowdown.com/sprites/misc/omega.png'>";
            } else if (dict2[j].name == "Kyogre") {
              suggadd +=
                "<img src='https://play.pokemonshowdown.com/sprites/misc/alpha.png'>";
            }
            break;
          default:
            break;
        }
      }
      //suggadd="<span value=\'"+suggraw[(suggraw0.length-1)]+" \' onclick=filltext('"+suggraw[(suggraw0.length-1)]+"')>"+suggadd+"</span>";
      //console.log("<span value=\'"+suggraw[(suggraw0.length-1)]+" \' onclick=filltext('"+suggraw[(suggraw0.length-1)]+"')>"+suggadd+"</span>")
      sugg0 += " " + suggadd;
      suggid = j;
      dictlocal = dict2;
      j = j + 1;
      continue;
    }
    if (rank[j] < rankmin) {
      //Higher confidence term found
      rankmin = rank[j];
      suggadd = dict2[j].name;
      suggadd = "<span onclick='setentry(this.innerText)' class='filler'>" + suggadd + "</span>"
      suggraw = [];
      suggraw.push(suggadd);
      //document.getElementById("options").innerHTML="<option value=\'"+suggadd+"\'>"
      if (dict2[j].forms) {
        suggadd = "<b>" + suggadd + "</b>";
        switch (dict2[j].forms[1].spriteSuffix) {
          case "mega":
          case "mega-x":
          case "mega-y":
            suggadd +=
              "<img src='https://play.pokemonshowdown.com/sprites/misc/mega.png'>";
            break;
          case "primal":
            if (dict2[j].name == "Groudon") {
              suggadd +=
                "<img src='https://play.pokemonshowdown.com/sprites/misc/omega.png'>";
            } else if (dict2[j].name == "Kyogre") {
              suggadd +=
                "<img src='https://play.pokemonshowdown.com/sprites/misc/alpha.png'>";
            }
            break;
          default:
            break;
        }
      }

      sugg = "";
      //suggadd="<span value=\'"+suggraw[(suggraw.length-1)]+" \' onclick=filltext('"+suggraw[(suggraw.length-1)]+"')>"+suggadd+"</span>";
      sugg += " " + suggadd;
      suggid = j;
      dictlocal = dict2;
      j = j + 1;
      continue;
    } else if (rank[j] == rankmin) {
      //Matching priority trem found
      suggadd = dict2[j].name;
      suggadd = "<span onclick='setentry(this.innerText)' class='filler'>" + suggadd + "</span>"
      suggraw.push(suggadd);
      //document.getElementById("options").innerHTML+="<option value=\'"+suggadd+"\'>"
      if (dict2[j].forms) {
        suggadd = "<b>" + suggadd + "</b>";
        switch (dict2[j].forms[1].spriteSuffix) {
          case "mega":
          case "mega-x":
          case "mega-y":
            suggadd +=
              "&nbsp<img src='https://play.pokemonshowdown.com/sprites/misc/mega.png'>";
            break;
          case "primal":
            if (dict2[j].name == "Groudon") {
              suggadd +=
                "&nbsp<img src='https://play.pokemonshowdown.com/sprites/misc/omega.png'>";
            } else if (dict2[j].name == "Kyogre") {
              suggadd +=
                "&nbsp<img src='https://play.pokemonshowdown.com/sprites/misc/alpha.png'>";
            }
            break;
          default:
            break;
        }
      }
      //suggadd="<span value=\'"+suggraw[(suggraw.length-1)]+" \' onclick=filltext('"+suggraw[(suggraw.length-1)]+"')>"+suggadd+"</span>";
      sugg += " " + suggadd;
      dictlocal = dict2;
      j = j + 1;
      continue;
    }
    dictlocal = dict2; //Refresh Local Dictionary
    j = j + 1;
  }
  document.getElementById("suggestiontext").innerHTML =
    "<b>Matches:</b> " + sugg0 + "<br><b>Suggestions:</b> " + sugg; //Print suggestions
  matches = sugg.split(" ");
  //console.log(suggraw0+"\n"+suggraw)
  //console.log(suggraw);
  //console.log(suggraw0);
  return [suggraw0, suggraw];
}

function checkforms(pkname) {
  q = 0;
  otherform = [];
  while (q < dict2.length) {
    if (dict2[q].name.toLowerCase().replace("-", "").replace("-", "").replace(" ", "").replace(":", "").replace(".", "") == pkname.toLowerCase().replace("-", "").replace("-", "").replace(" ", "").replace(":", "").replace(".", "")) {
      document.getElementById("entry").setCustomValidity("");
      if (dict2[q].forms) {
        q1 = 0;
        while (q1 < dict2[q].forms.length) {
          if (dict2[q].forms[q1].spriteSuffix) {
            switch (dict2[q].forms[q1].spriteSuffix.toLowerCase()) {
              case "":
                document.getElementById("Mega").disabled = true;
                document.getElementById("Primal").disabled = true;
                document.getElementById("Ultra").disabled = true;
                document.getElementById("Mega").checked = false;
                document.getElementById("Primal").checked = false;
                document.getElementById("Ultra").checked = false;
                break;
              case "mega":
                document.getElementById("Mega").disabled = false;
                document.getElementById("Primal").disabled = true;
                document.getElementById("Ultra").disabled = true;
                document.getElementById("Mega").checked = false;
                document.getElementById("Primal").checked = false;
                document.getElementById("Ultra").checked = false;
                //console.log("Can Mega Evolve");
                break;
              case "primal":
                document.getElementById("Mega").disabled = true;
                document.getElementById("Primal").disabled = false;
                document.getElementById("Ultra").disabled = true;
                document.getElementById("Mega").checked = false;
                document.getElementById("Primal").checked = false;
                document.getElementById("Ultra").checked = false;
                //console.log("Can undergo Primal Reversion");
                break;
              case "ultra":
                document.getElementById("Mega").disabled = true;
                document.getElementById("Primal").disabled = true;
                document.getElementById("Ultra").disabled = false;
                document.getElementById("Mega").checked = false;
                document.getElementById("Primal").checked = false;
                document.getElementById("Ultra").checked = false;
                //console.log("Can Ultra Burst");
                break;
              case "mega-x":
              case "mega-y":
                document.getElementById("Mega").disabled = false;
                document.getElementById("Primal").disabled = true;
                document.getElementById("Ultra").disabled = true;
                document.getElementById("Mega").checked = false;
                document.getElementById("Primal").checked = false;
                document.getElementById("Ultra").checked = false;
                //console.log("Can Mega Evolve");
                otherform.push(
                  dict2[q].forms[q1].spriteSuffix.split("-")[1].toUpperCase()
                );
                break;
              default:
                document.getElementById("Mega").disabled = true;
                document.getElementById("Primal").disabled = true;
                document.getElementById("Ultra").disabled = true;
                document.getElementById("Mega").checked = false;
                document.getElementById("Primal").checked = false;
                document.getElementById("Ultra").checked = false;
                otherform.push(dict2[q].forms[q1].spriteSuffix);
                //console.log(
                //  "Has other form: " + dict2[q].forms[q1].spriteSuffix
                //);
                break;
            }
          } else {
            document.getElementById("Mega").disabled = true;
            document.getElementById("Primal").disabled = true;
            document.getElementById("Ultra").disabled = true;
            document.getElementById("Mega").checked = false;
            document.getElementById("Primal").checked = false;
            document.getElementById("Ultra").checked = false;
            otherform.push("normal");
            //console.log("Has normal form");
          }
          q1 = q1 + 1;
        }
      }
      break;
    } else {
      document.getElementById("Mega").disabled = true;
      document.getElementById("Primal").disabled = true;
      document.getElementById("Ultra").disabled = true;
      document.getElementById("Mega").checked = false;
      document.getElementById("Primal").checked = false;
      document.getElementById("Ultra").checked = false;
      document.getElementById("entry").setCustomValidity("Invalid Field");
    }
    q = q + 1;
  }
  q = 0;
  ////console.log("Starting Editing");
  document.getElementById("Formselect").innerHTML = "";
  while (q < otherform.length) {
    otherform[q] = otherform[q][0].toUpperCase() + otherform[q].substring(1);
    document.getElementById("Formselect").innerHTML +=
      "<option value='" + otherform[q] + "'>" + otherform[q] + "</option>";
    q = q + 1;
  }
}
/* function checktyping(pkname) {
  q = 0;
  otherform = [];
  while (q < dict2.length) {
    if (dict2[q].name.toLowerCase() == pkname.toLowerCase()) {

    }
  }
}
 */
statsbase = [];

function checkstats(w) {
  /* w = w.toLowerCase().replace("-", "").replace("-", "").replace(" ", "").replace(":", "").replace(".", ""); */
  w=remspecs(w);
  console.log("I'M HEREEEEEEE - "+w)
  wbs = BattlePokedex[w].baseStats;
  document.getElementById("hp").innerHTML = wbs.hp;
  document.getElementById("atk").innerHTML = wbs.atk;
  document.getElementById("def").innerHTML = wbs.def;
  document.getElementById("spa").innerHTML = wbs.spa;
  document.getElementById("spd").innerHTML = wbs.spd;
  document.getElementById("spe").innerHTML = wbs.spe;
  document.getElementById("hpbar").value = wbs.hp;
  document.getElementById("atkbar").value = wbs.atk;
  document.getElementById("defbar").value = wbs.def;
  document.getElementById("spabar").value = wbs.spa;
  document.getElementById("spdbar").value = wbs.spd;
  document.getElementById("spebar").value = wbs.spe;
  document.getElementById("tot").innerHTML =
    wbs.hp + wbs.atk + wbs.def + wbs.spa + wbs.spd + wbs.spe;
  document.getElementById("totbar").value =
    wbs.hp + wbs.atk + wbs.def + wbs.spa + wbs.spd + wbs.spe;
  statsbase = wbs;
  //console.log(wbs.hp);
}

function sender() {
  text = document.getElementById("entry").value;
  text = text[0].toUpperCase() + text.substring(1);

  document.title=text;

  opt = document.getElementsByClassName("transf");
  formval = document.getElementById("Formselect").value;
  //console.log(text);
  pkname = text;
  pkform = formval;
  switch (text) {
    case "Jangmo-o":
    case "Hakamo-o":
    case "Kommo-o":
      text = text.split("-")[0] + text.split("-")[1];
      pkname = text;
      //console.log(text);
      break;
    case "Mr. mime":
      text = "mrmime";
      pkname = text;
      break;
    case "Mime jr.":
      text = "mimejr";
      pkname = text;
      break;
    case "Farfetch'd":
      text = "farfetchd";
      pkname = text;
      break;
  }
  if (opt[0].checked) {
    text += "-Mega";
    pkform = "mega";
  }
  if (opt[1].checked) {
    text += "-Primal";
    pkform = "primal"
    //return text;
  }
  if (opt[2].checked) {
    text += "-Ultra";
    pkform = "ultra";
    //return text;
  }
  switch (formval) {
    case "":
      //text=text;
      break;
    case "Normal":
    case "Baile":
    case "Midday":
    case "Solo":
      text += "";
      break;
    case "Pom-pom":
      text += "-pompom";
      break;
    default:
      switch (text) {
        case "Necrozma-Ultra":
        case "Groudon-Primal":
        case "Kyogre-Primal":
          break;
        case "Charizard-Mega":
        case "Mewtwo-Mega":
          text += formval;
          break;
        default:
          text += "-" + formval;
          break;
      }
      //text+="-"+formval;
      break;
  }
  //console.log("PK: "+pkname+pkform+" "+text)
  ashwdn = text.toLowerCase();
  if (ashwdn.includes(" ")) {
    ashwdn = ashwdn.split(" ")[0] + ashwdn.split(" ")[1];
  }
  //console.log("PkShwdn: "+ashwdn);

  document.getElementById("xyani-front").innerHTML =
    '<img src="https://play.pokemonshowdown.com/sprites/xyani/' +
    ashwdn +
    '.gif" onerror="this.onerror=null;this.src=\'https://play.pokemonshowdown.com/sprites/itemicons/0.png\';">';
  document.getElementById("xyani-front-shiny").innerHTML =
    '<img src="https://play.pokemonshowdown.com/sprites/xyani-shiny/' +
    ashwdn +
    '.gif" onerror="this.onerror=null;this.src=\'https://play.pokemonshowdown.com/sprites/itemicons/0.png\';">';
  document.getElementById("xyani-back").innerHTML =
    '<img src="https://play.pokemonshowdown.com/sprites/xyani-back/' +
    ashwdn +
    '.gif" onerror="this.onerror=null;this.src=\'https://play.pokemonshowdown.com/sprites/itemicons/0.png\';">';
  document.getElementById("xyani-back-shiny").innerHTML =
    '<img src="https://play.pokemonshowdown.com/sprites/xyani-back-shiny/' +
    ashwdn +
    '.gif" onerror="this.onerror=null;this.src=\'https://play.pokemonshowdown.com/sprites/itemicons/0.png\';" onerror="fixbroken("xyani-back-shiny")>';
  
  checkstats(text);
  //pkabl(text);
  return text;
}

function statcalc() {
  band = document.getElementById("band").checked;
  specs = document.getElementById("specs").checked;
  scarf = document.getElementById("scarf").checked;
  lifeorb = document.getElementById("lifeorb").checked;
  vest = document.getElementById("vest").checked;
  eviolite = document.getElementById("eviolite").checked;
  power = document.getElementById("power").checked;
  solar = document.getElementById("solar").checked;
  surfer = document.getElementById("surfer").checked;

  hpb = document.getElementById("hp").innerHTML * 1;
  hplvl = document.getElementById("hplvl").value * 1;
  hpiv = document.getElementById("hpiv").value * 1;
  hpev = document.getElementById("hpev").value * 1;
  //hpnat=document.getElementById("hpnat").value*0.1+1;
  hp =
    Math.floor(((2 * hpb + hpiv + Math.floor(hpev / 4)) * hplvl) / 100) +
    hplvl +
    10;
  if (document.getElementById("entry").value.toLowerCase() == 'shedinja') {
    hp = 1;
  }

  atkb = document.getElementById("atk").innerHTML * 1;
  atklvl = document.getElementById("atklvl").value * 1;
  atkiv = document.getElementById("atkiv").value * 1;
  atkev = document.getElementById("atkev").value * 1;
  atknat = document.getElementById("atknat").value;
  atkmod = document.getElementById("atkmod").value;
  atk = Math.floor(
    (Math.floor(((2 * atkb + atkiv + Math.floor(atkev / 4)) * atklvl) / 100) +
      5) *
    atknat
  );
  if (atkmod > 0) {
    atk = Math.floor(atk * ((2 + Math.abs(atkmod)) / 2));
  } else {
    atk = Math.floor(atk * (2 / (2 + Math.abs(atkmod))));
  }
  if (band) {
    atk = Math.floor(atk * 1.5);
  }
  if (power) {
    atk = Math.floor(atk * 2);
  }
  if (lifeorb) {
    atk = Math.floor(atk * 1.3);
  }

  defb = document.getElementById("def").innerHTML * 1;
  deflvl = document.getElementById("deflvl").value * 1;
  defiv = document.getElementById("defiv").value * 1;
  defev = document.getElementById("defev").value * 1;
  defnat = document.getElementById("defnat").value;
  defmod = document.getElementById("defmod").value;
  def = Math.floor(
    (Math.floor(((2 * defb + defiv + Math.floor(defev / 4)) * deflvl) / 100) +
      5) *
    defnat
  );
  if (defmod > 0) {
    def = Math.floor(def * ((2 + Math.abs(defmod)) / 2));
  } else {
    def = Math.floor(def * (2 / (2 + Math.abs(defmod))));
  }
  if (eviolite) {
    def = Math.floor(def * 1.5);
  }

  spab = document.getElementById("spa").innerHTML * 1;
  spalvl = document.getElementById("spalvl").value * 1;
  spaiv = document.getElementById("spaiv").value * 1;
  spaev = document.getElementById("spaev").value * 1;
  spanat = document.getElementById("spanat").value;
  spamod = document.getElementById("spamod").value;
  spa = Math.floor(
    (Math.floor(((2 * spab + spaiv + Math.floor(spaev / 4)) * spalvl) / 100) +
      5) *
    spanat
  );
  if (spamod > 0) {
    spa = Math.floor(spa * ((2 + Math.abs(spamod)) / 2));
  } else {
    spa = Math.floor(spa * (2 / (2 + Math.abs(spamod))));
  }
  if (specs) {
    spa = Math.floor(spa * 1.5);
  }
  if (lifeorb) {
    spa = Math.floor(spa * 1.3);
  }
  if (solar) {
    spa = Math.floor(spa * 1.5);
  }

  spdb = document.getElementById("spd").innerHTML * 1;
  spdlvl = document.getElementById("spdlvl").value * 1;
  spdiv = document.getElementById("spdiv").value * 1;
  spdev = document.getElementById("spdev").value * 1;
  spdnat = document.getElementById("spdnat").value;
  spdmod = document.getElementById("spdmod").value;
  spd = Math.floor(
    (Math.floor(((2 * spdb + spdiv + Math.floor(spdev / 4)) * spdlvl) / 100) +
      5) *
    spdnat
  );
  if (spdmod > 0) {
    spd = Math.floor(spd * ((2 + Math.abs(spdmod)) / 2));
  } else {
    spd = Math.floor(spd * (2 / (2 + Math.abs(spdmod))));
  }
  if (eviolite || vest) {
    spd = Math.floor(spd * 1.5);
  }

  speb = document.getElementById("spe").innerHTML * 1;
  spelvl = document.getElementById("spelvl").value * 1;
  speiv = document.getElementById("speiv").value * 1;
  speev = document.getElementById("speev").value * 1;
  spenat = document.getElementById("spenat").value;
  spemod = document.getElementById("spemod").value;
  spe = Math.floor(
    (Math.floor(((2 * speb + speiv + Math.floor(speev / 4)) * spelvl) / 100) +
      5) *
    spenat
  );
  if (spemod > 0) {
    spe = Math.floor(spe * ((2 + Math.abs(spemod)) / 2));
  } else {
    spe = Math.floor(spe * (2 / (2 + Math.abs(spemod))));
  }
  if (scarf) {
    spe = Math.floor(spe * 1.5);
  }
  if (surfer) {
    spe = Math.floor(spe * 2);
  }

  document.getElementById("hpval").innerHTML = hp;
  document.getElementById("atkval").innerHTML = atk;
  document.getElementById("defval").innerHTML = def;
  document.getElementById("spaval").innerHTML = spa;
  document.getElementById("spdval").innerHTML = spd;
  document.getElementById("speval").innerHTML = spe;

  document.getElementById("totev").innerHTML = hpev + atkev + defev + spaev + spdev + speev;

  /* -------------------------------------------- */
  
  atkivgo=document.getElementById("atkivgo").value;
  defivgo=document.getElementById("defivgo").value;
  staivgo=document.getElementById("staivgo").value;
  stalvlgo=document.getElementById("stalvlgo").value;
  atklvlgo=document.getElementById("atklvlgo").value;
  deflvlgo=document.getElementById("deflvlgo").value;
  cplvlgo=document.getElementById("cplvlgo").value;

  if(atklvlgo%1==0.5) {
    atkcpm=Math.sqrt((cpmlist[Math.floor(atklvlgo)]**2 + cpmlist[Math.ceil(atklvlgo)]**2)/2);
  }
  else {
    atkcpm=cpmlist[atklvlgo];
  }

  if(deflvlgo%1==0.5) {
    defcpm=Math.sqrt((cpmlist[Math.floor(deflvlgo)]**2 + cpmlist[Math.ceil(deflvlgo)]**2)/2);
  }
  else {
    defcpm=cpmlist[deflvlgo];
  }

  if(stalvlgo%1==0.5) {
    stacpm=Math.sqrt((cpmlist[Math.floor(stalvlgo)]**2 + cpmlist[Math.ceil(stalvlgo)]**2)/2);
  }
  else {
    stacpm=cpmlist[stalvlgo];
  }

  if(cplvlgo%1==0.5) {
    cpcpm=Math.sqrt((cpmlist[Math.floor(cplvlgo)]**2 + cpmlist[Math.ceil(cplvlgo)]**2)/2);
  }
  else {
    cpcpm=cpmlist[cplvlgo];
  }

  scaatk=Math.round((7*Math.max(atkb,spab)+1*Math.min(atkb,spab))/4);
  scadef=Math.round((5*Math.max(defb,spdb)+3*Math.min(defb,spdb))/4);
  scaspe=(1+((speb-75)/500));

  batkgo=Math.round(scaatk*scaspe);
  bdefgo=Math.round(scadef*scaspe);
  bstago=Math.floor(1.75*hpb+50);

  atkgo=(batkgo)*atkcpm+(atkivgo)*atkcpm;
  defgo=(bdefgo)*defcpm+(defivgo)*defcpm;
  stago=(bstago)*stacpm+(staivgo)*stacpm;
  /* atkgo=Math.round(atkgo);
  defgo=Math.round(defgo);
  stago=Math.round(stago); */
  cpgo=(atkgo*Math.sqrt(defgo)*Math.sqrt(stago))/10;
  cpgomax=(((batkgo+15)*atkcpm)*Math.sqrt((bdefgo+15)*defcpm)*Math.sqrt((bstago+15)*stacpm))/10;

  document.getElementById("batkgo").innerHTML=Math.floor(batkgo);
  document.getElementById("bdefgo").innerHTML=Math.floor(bdefgo);
  document.getElementById("bstago").innerHTML=Math.floor(bstago);

  document.getElementById("atkbargo").value=batkgo;
  document.getElementById("defbargo").value=bdefgo;
  document.getElementById("stabargo").value=bstago;
  document.getElementById("cpbargo").value=Math.floor(cpgo);
  document.getElementById("cpbargo").max=Math.floor(cpgomax);

  document.getElementById("atkgo").innerHTML=Math.floor(atkgo);
  document.getElementById("defgo").innerHTML=Math.floor(defgo);
  document.getElementById("stago").innerHTML=Math.floor(stago);
  document.getElementById("cpgo").innerHTML=Math.floor(cpgo);

  return [hp, atk, def, spa, spd, spe];
}

function synclvlsgo() {
  lvl=document.getElementById("cplvlgo").value;
  document.getElementById("atklvlgo").value=lvl;
  document.getElementById("deflvlgo").value=lvl;
  document.getElementById("stalvlgo").value=lvl;
}

function syncivs() {
  iv = document.getElementById("totiv").value;
  document.getElementById("hpiv").value = iv;
  document.getElementById("atkiv").value = iv;
  document.getElementById("defiv").value = iv;
  document.getElementById("spaiv").value = iv;
  document.getElementById("spdiv").value = iv;
  document.getElementById("speiv").value = iv;
}

function synclvls() {
  lvl = document.getElementById("totlvl").value;
  document.getElementById("hplvl").value = lvl;
  document.getElementById("atklvl").value = lvl;
  document.getElementById("deflvl").value = lvl;
  document.getElementById("spalvl").value = lvl;
  document.getElementById("spdlvl").value = lvl;
  document.getElementById("spelvl").value = lvl;
}

function syncmods() {
  mod = document.getElementById("totmod").value;
  //document.getElementById("hpmod").value=mod
  document.getElementById("atkmod").value = mod;
  document.getElementById("defmod").value = mod;
  document.getElementById("spamod").value = mod;
  document.getElementById("spdmod").value = mod;
  document.getElementById("spemod").value = mod;
}

function filltext(w) {
  document.getElementById("entry").value = w;
  //console.log("Autofill: " + w);
  rankgrader2(w);
  checkforms(w);
}

function plot(st) {
  stm = Math.max(st.atk, st.def, st.spa, st.spd, st.spe);
  var ctx = document.getElementById("myChart").getContext("2d");

  var myChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: ["Atk", "Def", "Sp Atk", "Sp Def", "Spe"],
      datasets: [{
        //label: 'Base Stats',
        data: [
          (st.atk / stm) * 100,
          (st.def / stm) * 100,
          (st.spa / stm) * 100,
          (st.spd / stm) * 100,
          (st.spe / stm) * 100
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)"
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)"
        ],
        borderWidth: 1
      }]
    },
    options: {
      scaleLabel: {
        display: true
      },
      legend: {
        display: false
      },
      scale: {
        ticks: {
          display: false,
          beginAtZero: true,
          min: 0,
          max: 100,
          stepsize: 1
        },
        yAxes: [{
          ticks: {
            display: false,
            beginAtZero: true,
            min: 0,
            max: 100,
            stepsize: 1,
            callback: function (value, index, values) {
              return value;
            }
          }
        }]
      }
    }
  });
  chartobj = myChart;
}

function starter() {
  inlineReq=new URLSearchParams(window.location.search);
  if(inlineReq.has('name')) {
    specname=inlineReq.get('name');
  }
  else {
    specname="Venusaur";
  }
  document.getElementById("entry").value = specname;
  rankgrader2(specname);
  checkforms(specname);
  sender();
  statcalc();
  plot(wbs);
  getsets();
  pkabl();
  learnset();
}

function updtr() {
  stm = Math.max(
    statsbase.atk,
    statsbase.def,
    statsbase.spa,
    statsbase.spd,
    statsbase.spe
  );
  chartobj.data.datasets[0].data[0] = (statsbase.atk / stm) * 100;
  chartobj.data.datasets[0].data[1] = (statsbase.def / stm) * 100;
  chartobj.data.datasets[0].data[2] = (statsbase.spa / stm) * 100;
  chartobj.data.datasets[0].data[3] = (statsbase.spd / stm) * 100;
  chartobj.data.datasets[0].data[4] = (statsbase.spe / stm) * 100;
  chartobj.update();
}

function randpoke() {
  document.getElementById("Formselect").innerHTML = "";
  document.getElementById("Mega").disabled = true;
  document.getElementById("Mega").checked = false;
  document.getElementById("Primal").disabled = true;
  document.getElementById("Mega").checked = false;
  document.getElementById("Ultra").disabled = true;
  document.getElementById("Mega").checked = false;
  n = Math.random();
  n = Math.round(n * dict2.length)
  pokename = dict2[n].name;
  pokename = pokename.split(" ")[0];
  if (pokename == "Mr.") {
    pokename = "Mr. Mime";
  }
  if (pokename == "Mime") {
    pokename = "Mime Jr.";
  }
  document.getElementById("entry").value = pokename;
  sender();
  statcalc();
  updtr();
  rankgrader2(pokename);
  checkforms(pokename);
  pkabl();
  getsets();
  learnset();
}

function checktyping(pkname, pkform) {
  q = 0;
  types = "";
  while (q < dict2.length) {
    if (remspecs(pkname) == remspecs(dict2[q].name)) {
      j = 0;
      if (dict2[q].forms) {
        while (j < dict2[q].forms.length) {
          //console.log(dict2[q].forms[j]);
          if (dict2[q].forms[j].spriteSuffix) {
            if (remspecs(dict2[q].forms[j].spriteSuffix) == remspecs(pkform)) {
              types = dict2[q].forms[j].types;
              break;
            } else {
              types = dict2[q].types;
            }
          }
          j = j + 1;
        }
      } else {
        types = dict2[q].types;
      }
    }
    q = q + 1;
  }
  return types;
}

function bstbst() { //Beast Boost
  atk = Number(document.getElementById("atkval").innerText);
  def = Number(document.getElementById("defval").innerText);
  spa = Number(document.getElementById("spaval").innerText);
  spd = Number(document.getElementById("spdval").innerText);
  spe = Number(document.getElementById("speval").innerText);
  statval = [atk, def, spa, spd, spe];
  statname = ['atk', 'def', 'spa', 'spd', 'spe']
  maxstat = Math.max(atk, def, spa, spd, spe);
  statname = statname[statval.indexOf(maxstat)];
  //console.log(statname);
  statmod = Number(document.getElementById(statname + 'mod').value);
  //console.log(statmod);
  statmod = statmod + 1;
  document.getElementById(statname + 'mod').value = Math.min(statmod, 6);
}

function intimidate() {
  statmod = Number(document.getElementById('atkmod').value);
  //console.log(statmod);
  statmod = statmod - 1;
  document.getElementById('atkmod').value = Math.max(statmod, -6);
}

function pkabl() {
  // //console.log("Ability of "+a)
  /*   pkname=a.split('-')[0].toLowerCase();
    pkform=a.split('-')[1]; */
  pkname = remspecs(document.getElementById("entry").value);
  pkform = getform();
  abl = [];
  abll = [];
  ablH = [];
  desc = [];
  descH = [];
  typing = [];
  if (pkform == "normal") {
    pkform = "";
  }
  switch (pkname) {
    case "burmy":
    case "floette":
    case "florges":
    case "deerling":
    case "sawsbuck":
    case "oricorio":
      if (pkform != "eternal" || pkform == "baile") {
        pkname = pkname;
        break;
      }
    default:
      pkname = pkname + pkform;
  }
  pkname = pkname.replace("-", "");
  if (BattlePokedex[pkname]) {
    abl = BattlePokedex[pkname].abilities;
    //console.log(BattlePokedex[pkname].abilities);
  } else {
    abl = {
      0: "noability"
    };
    //console.log("Pokémon not Found");
  }
  //console.log(abl);
  document.getElementById("abl").innerHTML = "<b>Abilities:</b><br>";
  abll.push(abl[0]);
  desc.push(BattleAbilities[remspecs(abl[0])].shortDesc);
  document.getElementById("abl").innerHTML += "<b>" + abl[0] + ":</b> " + BattleAbilities[remspecs(abl[0])].shortDesc;
  if (abl[1]) {
    abll.push(abl[1]);
    desc.push(BattleAbilities[abl[1].toLowerCase().replace(" ", "")].shortDesc);
    document.getElementById("abl").innerHTML += "<br><b>" + abl[1] + ":</b> " + BattleAbilities[remspecs(abl[1])].shortDesc;
  }
  if (abl['H']) {
    ablH.push(abl['H'])
    descH.push(BattleAbilities[abl['H'].toLowerCase().replace(" ", "")].shortDesc);
    document.getElementById("abl").innerHTML += "<br>(Hidden) <b>" + abl['H'] + ":</b> " + BattleAbilities[remspecs(abl['H'])].shortDesc;
  }
  //console.log(desc);
  //return [abll,ablH,desc,descH];
  if (BattlePokedex[pkname]) {
    typing = BattlePokedex[pkname].types;
  }
  /* else {
    typing=[""];
  } */
  document.getElementById('typing').innerHTML = typing[0];
  if (typing[1]) {
    document.getElementById('typing').innerHTML += " " + typing[1];
  }
  if (BattlePokedex[pkname.toLowerCase().replace("-", "").replace("-", "").replace(" ", "").replace(":", "").replace(".", "")].prevo) {
    txt = BattlePokedex[pkname.toLowerCase().replace("-", "").replace("-", "").replace(" ", "").replace(":", "").replace(".", "")].prevo;
    txt = txt[0].toUpperCase() + txt.substring(1);
    document.getElementById("preevo").innerHTML = "Evolves from: ".bold() + "<span onclick='setentry(this.innerText)' class='filler'>" + BattlePokedex[txt.toLowerCase()].species + "</span>";
  } else {
    document.getElementById("preevo").innerHTML = "Has no pre-evolution";
  }
  if (BattlePokedex[pkname.toLowerCase().replace("-", "").replace("-", "").replace(" ", "").replace(":", "").replace(".", "")].evos) {
    txt = BattlePokedex[pkname.toLowerCase().replace("-", "").replace("-", "").replace(" ", "").replace(":", "").replace(".", "")].evos[0];
    txt = txt[0].toUpperCase() + txt.substring(1);
    document.getElementById("evo").innerHTML = "Evolves to: ".bold() + "<span onclick='setentry(this.innerText)' class='filler'>" + BattlePokedex[txt.toLowerCase()].species + "</span>";
    q = 1;
    while (BattlePokedex[pkname.toLowerCase().replace("-", "").replace("-", "").replace(" ", "").replace(":", "").replace(".", "")].evos[q]) {
      txt = BattlePokedex[pkname.toLowerCase().replace("-", "").replace("-", "").replace(" ", "").replace(":", "").replace(".", "")].evos[q];
      txt = txt[0].toUpperCase() + txt.substring(1);
      if (!BattlePokedex[txt.toLowerCase()].forme) {
        document.getElementById("evo").innerHTML += ", " + "<span onclick='setentry(this.innerText)' class='filler'>" + BattlePokedex[txt.toLowerCase()].species + "</span>";
      }
      q = q + 1;
    }
  } else {
    document.getElementById("evo").innerHTML = "Has no evolution";
  }

  weaktype=getWeaks(typing);
  a=null;
  for(a in weaktype) {
    if(document.getElementById(a)) {
      document.getElementById(a).innerHTML=weaktype[a];
    }
  }
}

function getform() {
  form = "";
  opt = document.getElementsByClassName("transf");
  if (opt[0].checked) {
    form = "mega";
    if (document.getElementById("Formselect").value != 'Normal') {
      form += document.getElementById("Formselect").value;
    }
  } else if (opt[1].checked) {
    form = "primal";
  } else if (opt[2].checked) {
    form = "ultra";
  } else {
    form = document.getElementById("Formselect").value;
  }
  return form.toLowerCase();
}

function setnature() {
  nat = document.getElementById("nature").value;
  document.getElementById("atknat").value = '1.0';
  document.getElementById("defnat").value = '1.0'
  document.getElementById("spanat").value = '1.0'
  document.getElementById("spdnat").value = '1.0'
  document.getElementById("spenat").value = '1.0'
  switch (NATURES[nat][0]) {
    case 'at':
      document.getElementById("atknat").value = '1.1';
      break;
    case 'df':
      document.getElementById("defnat").value = '1.1';
      break;
    case 'sa':
      document.getElementById("spanat").value = '1.1';
      break;
    case 'sd':
      document.getElementById("spdnat").value = '1.1';
      break;
    case 'sp':
      document.getElementById("spenat").value = '1.1';
      break;

    default:

      break;
  }
  switch (NATURES[nat][1]) {
    case 'at':
      document.getElementById("atknat").value = '0.9';
      break;
    case 'df':
      document.getElementById("defnat").value = '0.9';
      break;
    case 'sa':
      document.getElementById("spanat").value = '0.9';
      break;
    case 'sd':
      document.getElementById("spdnat").value = '0.9';
      break;
    case 'sp':
      document.getElementById("spenat").value = '0.9';
      break;

    default:

      break;
  }
}

function getnature() {
  nat = '';
  z = [document.getElementById('atknat').value, document.getElementById('defnat').value, document.getElementById('spanat').value, document.getElementById('spdnat').value, document.getElementById('spenat').value];
  znat = ['', 'at', 'df', 'sa', 'sd', 'sp']
  zpos = z.indexOf('1.1') + 1;
  zneg = z.indexOf('0.9') + 1;
  z1 = [znat[zpos], znat[zneg]];
  //console.log(zpos+' '+zneg);
  //console.log(z1);
  for (a in NATURES) {
    //console.log('Testing '+a);
    if (NATURES[a][0] == z1[0] && NATURES[a][1] == z1[1]) {
      //console.log(a);
      document.getElementById('nature').value = a;
      break;
    }
  }
  document.getElementById("Hello").inn
}

function setentry(a) {
  document.getElementById("entry").value = a;

  rankgrader2(a);
  checkforms(a)
  sender();
  statcalc();
  updtr();
  pkabl();
  getsets();
  learnset();
}

function getsets() {
  /* pkname = document.getElementById("entry").value.toLowerCase().replace("-", "").replace("-", "").replace(" ", "").replace(":", "").replace(".", ""); */
  pkname = remspecs(document.getElementById("entry").value);
  pkform = getform();
  txt = "";
  if (pkform == "normal") {
    pkform = "";
  }
  //console.log(pkform);
  switch (pkname) {
    case "burmy":
    case "floette":
    case "florges":
    case "deerling":
    case "sawsbuck":
    case "oricorio":
      if (pkform != "eternal" || pkform == "baile") {
        //console.log("Entered")
        pkname = pkname;
        break;
      }
    default:
      pkname = pkname + pkform;
      break;
  }
  console.log(pkname);
  for (a in SETDEX_SM) {
    //console.log(a.toLowerCase().replace("-",""));
    if (remspecs(a) == pkname) {

      for (b in SETDEX_SM[a]) {
        console.log(SETDEX_SM[a][b].moves)
        txt += "<span class='setdata'>"
        txt += "<b>" + b + "</b><br>"
        txt += "<b>Level:</b> " + SETDEX_SM[a][b].level;
        txt += "<br><b>Item:</b> " + SETDEX_SM[a][b].item;
        txt += "<br><b>Nature:</b> " + SETDEX_SM[a][b].nature;
        txt += "<br><b>Ability:</b> " + SETDEX_SM[a][b].ability;
        txt += "<br><b>Moves:</b><br>" + SETDEX_SM[a][b].moves[0] + "<br>" + SETDEX_SM[a][b].moves[1] + "<br>" + SETDEX_SM[a][b].moves[2] + "<br>" + SETDEX_SM[a][b].moves[3];
        txt += "<br><input class='importbtn' type='button' value='Import Set' onclick=\'importsets(\" " + a + "\",\"" + b + "\")\'>"
        console.log("importsets(\'" + a + "\',\'" + b + "\')")
        //console.log(alert(SETDEX_SM[a][b].level));
        txt += "</span>"
      }
    }
  }
  document.getElementById("sets").innerHTML = txt;
}

function importsets(a1, b1) {
  console.log(a1 + ' ' + b1);
  //a=SETDEX_SM[a1][b1];
  //console.log(a.level);
  c = null;
  for (a in SETDEX_SM) {
    if (remspecs(a) == remspecs(a1)) {
      for (b in SETDEX_SM[a]) {
        if (remspecs(b) == remspecs(b1)) {
          c = SETDEX_SM[a][b];
        }
      }
    }
  }
  console.log(c.evs);
  document.getElementById("totlvl").value = c.level;
  synclvls();
  document.getElementById("nature").value = c.nature;
  setnature();
  document.getElementById("atkev").value = 0;
  document.getElementById("defev").value = 0;
  document.getElementById("spaev").value = 0;
  document.getElementById("spdev").value = 0;
  document.getElementById("speev").value = 0;
  document.getElementById("hpev").value = 0;

  document.getElementById("atkiv").value = 31;
  document.getElementById("defiv").value = 31;
  document.getElementById("spaiv").value = 31;
  document.getElementById("spdiv").value = 31;
  document.getElementById("speiv").value = 31;
  document.getElementById("hpiv").value = 31;

  if (c.evs.at) {
    document.getElementById("atkev").value = Number(c.evs.at);
  }
  if (c.evs.df) {
    document.getElementById("defev").value = Number(c.evs.df);
  }
  if (c.evs.sa) {
    document.getElementById("spaev").value = Number(c.evs.sa);
  }
  if (c.evs.sd) {
    document.getElementById("spdev").value = Number(c.evs.sd);
  }
  if (c.evs.sp) {
    document.getElementById("speev").value = Number(c.evs.sp);
  }
  if (c.evs.hp) {
    document.getElementById("hpev").value = Number(c.evs.hp);
  }

  if (c.ivs) { //console.log(c.ivs);

    if (!isNaN(c.ivs.at)) {
      //console.log(c.ivs);
      document.getElementById("atkiv").value = Number(c.ivs.at);
    }
    if (!isNaN(c.ivs.df)) {
      //console.log(c.ivs);
      document.getElementById("defiv").value = Number(c.ivs.df);
    }
    if (!isNaN(c.ivs.sa)) {
      //console.log(c.ivs);
      document.getElementById("spaiv").value = Number(c.ivs.sa);
    }
    if (!isNaN(c.ivs.sd)) {
      //console.log(c.ivs);
      document.getElementById("spdiv").value = Number(c.ivs.sd);
    }
    if (!isNaN(c.ivs.sp)) {
      //console.log(c.ivs);
      document.getElementById("speiv").value = Number(c.ivs.sp);
    }
    if (!isNaN(c.ivs.hp)) {
      //console.log(c.ivs);
      document.getElementById("hpiv").value = Number(c.ivs.hp);
    }
  }

  statcalc();
  return c;
}

function resetstats() {
  document.getElementById("totlvl").value = 100;
  synclvls();
  document.getElementById("nature").value = 'Bashful';
  setnature();
  document.getElementById("atkev").value = 0;
  document.getElementById("defev").value = 0;
  document.getElementById("spaev").value = 0;
  document.getElementById("spdev").value = 0;
  document.getElementById("speev").value = 0;
  document.getElementById("hpev").value = 0;

  document.getElementById("atkiv").value = 31;
  document.getElementById("defiv").value = 31;
  document.getElementById("spaiv").value = 31;
  document.getElementById("spdiv").value = 31;
  document.getElementById("speiv").value = 31;
  document.getElementById("hpiv").value = 31;
}

/* function removeSpecials(a, specials = [" ", ":", "-", ".","'"], ignorecase = true) {
  w=removeSpecial(a);
  return w.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
} */

/* function removeSpecials(a, specials = [" ", ":", "-", "."], ignorecase = true) {
  list = specials;
  w = af(a);
  for (i in list) {
    //console.log(list[i]);
    while (w.includes(list[i])) {
      w = w.replace(list[i], "");
      //console.log(w);
    }
  }
  if (ignorecase) {
    return w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  }
  return w;
} */

function remspecs(a,specs=[" ", ":", "-", "."],igcase=true) {
  let w=a.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  let i=0;
  for(i in specs) {
    while(w.includes(specs[i])) {
      w=w.replace(specs[i],"");
    }
  }
  if(igcase) {
    return w.toLowerCase();
  }
  return w;
}

/* function removeSpecials(text,specials=[" ",":","-",".","'"],ignorecase=true) {
  let list=specials;
  let w1=text.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  return w1;
} */

function learnset() {
  pkname=remspecs(document.getElementById("entry").value);
  set=BattleLearnsets[pkname].learnset;
  text="<div><table class='moves'><tr class='moveheader'><th>Name</th><th>Power</th><th>Accuracy</th><th>Category</th><th>Type</th><th>Z Power</th><th>Max PP</th><th>Contest Type</th><th>Description</th></tr></tr>";
  for(move in BattleMovedex) {
    console.log(BattleMovedex[move].name);
    if(remspecs(move).includes("hiddenpower")) {
      text+="<tr>";
      text+="<td>"+BattleMovedex[move].name+"</td>";
      if(BattleMovedex["hiddenpower"].basePower!=0)  {text+="<td>"+BattleMovedex["hiddenpower"].basePower+"</td>";} else{text+="<td>-</td>";}
      if(BattleMovedex["hiddenpower"].accuracy!=true)  {text+="<td>"+BattleMovedex["hiddenpower"].accuracy+"</td>";} else{text+="<td>-</td>";}
      text+="<td>"+BattleMovedex["hiddenpower"].category+"</td>";
      text+="<td>"+BattleMovedex["hiddenpower"].type+"</td>";
      if(BattleMovedex["hiddenpower"].zMovePower)  {text+="<td>"+BattleMovedex["hiddenpower"].zMovePower+"</td>";} else{text+="<td>-</td>";}
      text+="<td>"+BattleMovedex["hiddenpower"].pp+"</td>";
      text+="<td>"+BattleMovedex["hiddenpower"].contestType+"</td>";
      if(BattleMovedex["hiddenpower"].desc)  {text+="<td>"+BattleMovedex["hiddenpower"].desc+"</td>";} else {text+="<td>"+BattleMovedex["hiddenpower"].shortDesc+"</td>";}
      text+="</tr>"
      console.log("True");
    }
    else if(remspecs(move) in set) {
      text+="<tr>";
      text+="<td>"+BattleMovedex[move].name+"</td>";
      if(BattleMovedex[move].basePower!=0)  {text+="<td>"+BattleMovedex[move].basePower+"</td>";} else{text+="<td>-</td>";}
      if(BattleMovedex[move].accuracy!=true)  {text+="<td>"+BattleMovedex[move].accuracy+"</td>";} else{text+="<td>-</td>";}
      text+="<td>"+BattleMovedex[move].category+"</td>";
      text+="<td>"+BattleMovedex[move].type+"</td>";
      if(BattleMovedex[move].zMovePower)  {text+="<td>"+BattleMovedex[move].zMovePower+"</td>";} else{text+="<td>-</td>";}
      text+="<td>"+BattleMovedex[move].pp+"</td>";
      text+="<td>"+BattleMovedex[move].contestType+"</td>";
      if(BattleMovedex[move].desc)  {text+="<td>"+BattleMovedex[move].desc+"</td>";} else {text+="<td>"+BattleMovedex[move].shortDesc+"</td>";}
      text+="</tr>"   
      console.log("True");
    }
    //console.log(BattleMovedex[move].name);
  }
  text+="</table></div>";
  document.getElementById("learnset").innerHTML=text;
  return set;
}
function getWeakTypes(theType,initChart={
  "Bug": 1,
  "Dark": 1,
  "Dragon": 1,
  "Electric": 1,
  "Fairy": 1,
  "Fighting": 1,
  "Fire": 1,
  "Flying": 1,
  "Ghost": 1,
  "Grass": 1,
  "Ground": 1,
  "Ice": 1,
  "Normal": 1,
  "Poison": 1,
  "Psychic": 1,
  "Rock": 1,
  "Steel": 1,
  "Water": 1
}) {
  typing=remspecs(theType);
  typing=typing[0].toUpperCase()+typing.substring(1);
  types=initChart;
  if(BattleTypeChart[typing]) {
    for(type in BattleTypeChart[typing].damageTaken) {
      switch(BattleTypeChart[typing].damageTaken[type].toString()) {
        case "0":
          types[type]=types[type]*1;
          break;
        case "1":
          types[type]=types[type]*2;
          break;
        case "2":
          types[type]=types[type]*0.5;
          break;
        case "3":
          types[type]=types[type]*0;
          break;
        default:
          types[type]=-1;
      }
    }
  }
  return types;
}
function getWeaks(Types) {
  weaks={
    "Bug": 1,
    "Dark": 1,
    "Dragon": 1,
    "Electric": 1,
    "Fairy": 1,
    "Fighting": 1,
    "Fire": 1,
    "Flying": 1,
    "Ghost": 1,
    "Grass": 1,
    "Ground": 1,
    "Ice": 1,
    "Normal": 1,
    "Poison": 1,
    "Psychic": 1,
    "Rock": 1,
    "Steel": 1,
    "Water": 1
  };
  w=0;
  weaks=getWeakTypes(Types[0]);
  if(Types[1]) {
    weaks=getWeakTypes(Types[1],weaks);
  }
  return weaks;
}

function fixbroken(a) {
  document.getElementById(a).innerHTML='<div class="loader"></div>';
}

function foulplaydmg(roll=100) {
  l=document.getElementById("totlvl").value;
  a=parseInt(document.getElementById("atkval").innerHTML);
  bp=95;
  d=parseInt(document.getElementById("defval").innerHTML);
  weak=parseFloat(document.getElementById("Dark").innerHTML);
  typing=document.getElementById("typing").innerHTML.split(" ");
  stab=1;
  /* for(type in typing) {
    if(typing[type]=="Dark") {
      stab=1.5;
      break;
    }
  } */
  /* roll=100; */
  dmg=((((0.4*l+2)*a*bp)/(d*50))+2)*stab*weak*(roll/100);
  return dmg;
}