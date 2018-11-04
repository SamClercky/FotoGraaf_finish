// Wacht met het gebruiken van plugins tot alle plugins zijn ingeladen
document.addEventListener("deviceready", init, false);
// Initialiseer een aantal globale variabelen
let knopElement = null;
let fotoElement = null;

function init() {
  // Nu is het mogelijk om plugins aan te roepen :-)
  // Haal de id's op
  knopElement = document.getElementById("knop");
  fotoElement = document.getElementById("foto");

  // Voeg een listener toe aan het knop element
  knopElement.addEventListener("click", neemFoto);
}

function neemFoto() {
  // console.log(navigator.device.capture != undefined); // True als het object bestaat
  navigator.camera.getPicture(fotoSuccess, fotoError, {
    quality: 100, // Kwaliteit van de foto
    destinationType: Camera.DestinationType.FILE_URI, // Wat voor een antwoord er moet gegeven worden
    sourceType: Camera.PictureSourceType.CAMERA, // Wat er moet worden gebruikt als bron voor de foto
    encodingType: Camera.EncodingType.JPEG, // Formaat waarin de foto moet worden gemaakt
    cameraDirection: 1 // Welke camera er moet worden gebruikt
  });
}

// Wordt aangeroepen als er succesvol een foto is gemaakt
function fotoSuccess(mediaBestanden) {
  // Toon de afbeelding op het scherm
  // Voeg alleen data:image/jpeg;base64 toe als je via de browser werkt
  fotoElement.src = /*"data:image/jpeg;base64," +*/ mediaBestanden;

  // Verplaats de afbeelding van de temp-map naar een permanente map
  verplaatsNaarGalerij(mediaBestanden);
}

// Wordt aangeroepen als er een fout is opgeworpen
function fotoError(error) {
  // Maak een notificatie als er een error is en print het naar de console voor debuging
  navigator.notification.alert(`Error code: ${error}`, null, "Foto Error");
  console.error(error);
}

// Maakt een willekeurige unique naam mbv de datum
function maakNaam(prefix) {
  return prefix + Date.now();
}

// Functie bedoeld om een bestand naar eender de welke map te verplaatsen
// bestandURI is de uri die je krijgt wanneer je een foto maakt (zie hierboven)
function verplaatsNaarGalerij(bestandURI) {
  // Haal het opgegeven bestand op
  window.resolveLocalFileSystemURL(
    bestandURI,
    function(bestandData) { // bij succes
      // externalRootDirectory => map met Documenten, Afbeeldingen, ...
      const nieuwBestand = cordova.file.externalRootDirectory + "FotoGraaf"; // bepaal de uiteindelijke map
      const oudBestand = bestandURI;
      const ext = "." + oudBestand.split(".").pop(); // haal de extentie op van het bestand

      nieuwBestandsNaam = maakNaam("img_") + ext; // genereer een nieuwe naam
      haalMap(nieuwBestand) // Haal een referentie op naar de map waar je alles wil opslaan
        .then(mapData => { // mapData => Informatie over de map
          console.log(mapData); // Print de mapinfo naar de console
          bestandData.moveTo( // Verplaats het bestand
            mapData, // Info over de bestemming
            nieuwBestandsNaam, // Naam van het nieuwe bestand
            () => {
              console.log("Gelukt!"); // Bij succes
            },
            err => console.error("mislukt: " + err) // Bij een fout
          );
        })
        .catch(err => console.error(err)); // Als de map niet kon worden aangemaakt
    },
    err => console.error("err r71: " + err.code) // bij een fout
  );
}

// Haal een map op
function haalMap(naam) {
  const korteNaam = naam.replace(/^.*[\\\/]/, '') // Haal het laatste stuk van de nieuwe map op
  console.log(korteNaam);
  return new Promise((res, rej) => { // Gebruik een promise voor het gemak
    window.resolveLocalFileSystemURL( // Haal de plaats op waar er een nieuwe map zal worden gemaakt
      cordova.file.externalRootDirectory,
      rootMapData => { // Bij succes
        rootMapData.getDirectory(
          korteNaam,
          { create: true }, // Als de map nog niet bestaat, maak hem dan aan
          mapData => res(mapData), // Bij succes
          err => rej(`Kon de map ${naam} niet aanmaken: code ${err.code}`) // Bij een fout
        );
      },
      err => // Bij een fout
        rej(
          `Kon ${cordova.file.externalRootDirectory} niet vinden: code ${
            err.code
          }`
        )
    );
  });
}

