const fs = require("fs").promises;
const path = require("path");
const vision = require("@microsoft/customvision-tfjs-node")

const modelPath = "stat_model" // stat model
const directory = "sample_stat"

const probabilityThreshold = 0.5;


(async () => {
    // Initialize the model and load the trained model from the file
    const model = new vision.ObjectDetectionModel();
    await model.loadModelAsync("file://" + path.join(modelPath, "model.json"));
    // Read the files in the directory
    const files = await fs.readdir(directory)
    // Iterate over the files in the directory
    for (const file of files) {
        // Read the image file
        const image = await fs.readFile(path.join(directory, file))
        // Make predictions on the image
        const result = await model.executeAsync(image)
        // Read the labels from the labels.txt file
        const labels = (await fs.readFile(path.join(modelPath, "labels.txt"), "utf8")).split("\n")
        // Create an array to store the predicted labels and probabilities
        let objectClassifications = [];
        // Iterate over the predicted labels and probabilities
        for (let i = 0; i < result[0].length; i++) {
            // Get the label index (this will correspond to the labels.txt file)
            const labelIndex = result[2][i];
            // Get the label
			  // Get the label text value from the labels.txt array created previously
			  const label = labels[labelIndex];
			  // Add the bounding box coordinates, probability, and label to the classification data
			  objectClassifications.push(new ObjectClassification(result[0][i], result[1][i], label));
		  }
  
		  // Filter the predicted labels and probabilities to include only those with a probability greater than or equal to the probabilityThreshold value
		  const filteredClassifications = objectClassifications.filter((item) => item.probability >= probabilityThreshold);
		  // Print the file name and the filtered predicted labels and probabilities to the console
		  console.log(`File: ${file}`)
		  console.log(filteredClassifications.map((item) => `${item.label}: ${item.probability}`).join("\n"));
	  }
	  console.log("Done!");
  })()
  
  class ObjectClassification {
	  constructor(bounds, probability, label) {
		  this.bounds = {
			  "x1": bounds[0],
			  "y1": bounds[1],
			  "x2": bounds[2],
			  "y2": bounds[3]
		  };
		  this.probability = probability;
		  this.label = label;
	  }
  }