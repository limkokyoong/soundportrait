let C = 0;
let song;
let amplitude;
let N = 20;
let x = 40;
let y = 40;
let latLonData = []; // Array to store lat/lon data from the Excel file

// Function to dynamically load and play the audio file
function loadSoundFromFile() {
  if (window.audioFile) {
    song = loadSound(URL.createObjectURL(window.audioFile), function() {
      console.log("Audio file loaded and playing.");
      song.play();
    }, function(err) {
      console.error("Error loading audio:", err);
    });
  } else {
    console.error("No audio file uploaded.");
  }
}

// Function to handle Excel file upload and extract latitude and longitude data
function loadExcelFile(event) {
  let file = event.target.files[0];
  let reader = new FileReader();

  reader.onload = function(e) {
    let data = new Uint8Array(e.target.result);
    let workbook = XLSX.read(data, { type: 'array' });

    // Assuming the first sheet contains the lat/lon data
    let firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convert the sheet into JSON
    let rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    // Assuming latitude and longitude are in specific columns, e.g., 0 (latitude), 1 (longitude)
    rows.forEach(row => {
      if (row[0] && row[1]) {
        latLonData.push({
          lat: row[0],
          lon: row[1]
        });
      }
    });

    console.log("Extracted Lat/Lon Data:", latLonData);
  };

  reader.readAsArrayBuffer(file);
}

function setup() {
  // Create the canvas
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 400);
  canvas.style('z-index', '-1');
  background(C);
  stroke(255);

  // Create a new Amplitude analyzer
  amplitude = new p5.Amplitude();
}

function draw() {
  // background(0);

  if (song && song.isPlaying()) {
    let audioLevel = amplitude.getLevel(); // Get the audio amplitude level
    let M = audioLevel * N; // Calculate the size of the ellipse based on audio amplitude

    stroke(255);
    strokeWeight(M);

    // Draw a line and ellipse moving across the canvas
    if (y <= height - 100) {
      line(x - 5, y - 5, x + 5, y + 5);
      ellipse(x, y, M * 10, M * 10);
      x += 25;
    }
    if (x > width - 100) {
      x = 440;
      y += 10;
    }
    if (y >= height - 40) {
      // Reset when the ellipse reaches the bottom of the canvas
      x = 440;
      y = 40;
      background(0);
    }
  }

  // Display the extracted lat/lon data on the canvas
  noStroke();
  fill(C);
  rect(0,0,400,800);
  fill(255);
  textSize(12);
  textAlign(LEFT, TOP);
  
  latLonData.forEach((data, index) => {
    text(`Lat: ${data.lat}, Lon: ${data.lon}`, 20, 20 + index * 20);
  });
}

function mousePressed() {
  if (song && song.isPlaying()) {
    song.pause();
  } else if (song) {
    song.play();
  }
}

// Detect when a key is pressed
function keyPressed() {
  if (key === 's') {
    saveCanvasAsPDF(); // Call the function to save the canvas as a PDF
  }
}

// Function to save the canvas as a PDF
function saveCanvasAsPDF() {
  let pdf = createPDF();
  pdf.beginRecord(); // Begin recording the canvas for the PDF

  // Redraw the canvas content in the PDF
  background(0);
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  
  latLonData.forEach((data, index) => {
    text(`Lat: ${data.lat}, Lon: ${data.lon}`, 20, 20 + index * 20);
  });

  pdf.endRecord(); // End recording and save the PDF
  pdf.save();      // Save the generated PDF file
}
