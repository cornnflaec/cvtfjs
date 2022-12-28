const fs = require("fs").promises;
const path = require("path");
const vision = require("@microsoft/customvision-tfjs-node");

const createCsvWriter = require('csv-writer').createObjectCsvWriter;


const modelPath = "stat_model"; // stat model
// const directory = "sample_stat"; // 
const directory = "test___safi";
// const directory = "test__duplicate_predict";
// const directory = "test___2";
const filePath = './logs.csv';

const csvWriter = createCsvWriter({
    path: filePath,
    header: [
        {id: 'filename', title: 'Filename'},
        {id: 'label', title: 'Label'},
        {id: 'probability', title: 'Probability'},
      ],
      fieldDelimiter: ","
  })

const probabilityThreshold = 0.5;


(async () => {
    // Initialize the model and load the trained model from the file
    const model = new vision.ObjectDetectionModel();
    await model.loadModelAsync("file://" + path.join(modelPath, "model.json"));
    // Read the files in the directory
    const files = await fs.readdir(directory)
    let allModifiedClassifications = [];
    // Array to store the filenames that failed to get predictions
    const noPredictionFiles = [];
   // const allPredictions = {};
  
  
    for (const file of files) {
        // Read the image file
        const image = await fs.readFile(path.join(directory, file));   
        // Make predictions on the image
        const result = await model.executeAsync(image);
        // Check if there are any predictions
        if (result[0].length === 0) {
          console.log(`No predictions for file ${file}`);
          continue;
        }
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
      
         const modifiedClassifications = [];

  
        const predictionsByLabel = objectClassifications.reduce((acc, prediction) => {
          const { label } = prediction;
          if (acc[label]) {
            acc[label].push(prediction);
          } else {
            acc[label] = [prediction];
          }
          return acc;
        }, {});
       
     
        const filteredClassifications = objectClassifications.filter((item) => item.probability >= probabilityThreshold);
console.log(filteredClassifications.map((item) => `${item.label}: ${item.probability}`).join("\n"));
 const labelProbabilities = {};
 for (const prediction of objectClassifications) {
   const {label, probability} = prediction;
   if (probability >= probabilityThreshold) {
     if (labelProbabilities[label]) {
       labelProbabilities[label] += probability;
     } else {
       labelProbabilities[label] = probability;
     }
   }
 }

 const labelCounts = {};
 for (const prediction of objectClassifications) {
   const {label, probability} = prediction;
   if (labelCounts[label]) {
     labelCounts[label] += 1;
   } else {
     labelCounts[label] = 1;
   }
   if (labelProbabilities[label]) {
     labelProbabilities[label] += probability;
   } else {
     labelProbabilities[label] = probability;
    }
  }
 

  // const noPredictionFiles = files.filter((file) => !allModifiedClassifications.find((obj) => obj.filename === file));
   // Calculate the average probability for each label
   // Calculate the average probability for each label
   const labelAverages = {};
   for (const label in labelProbabilities) {
     labelAverages[label] = labelProbabilities[label] / labelCounts[label];
   }
   
   // Find the label with the highest average probability
   let highestProbability = 0;
   let highestProbabilityLabel;
   for (const label in labelAverages) {
     if (labelAverages[label] > highestProbability) {
       highestProbability = labelAverages[label];
       highestProbabilityLabel = label;
     }
   }
   
   // If there is a label with an average probability greater than the threshold, add it to the modifiedClassifications array
   if (highestProbability >= probabilityThreshold) {
     modifiedClassifications.push({filename: file, label: highestProbabilityLabel, probability: highestProbability});
   } else {
     // If there is no label with an average probability greater than the threshold, add a "no prediction" object to the modifiedClassifications array
     modifiedClassifications.push({filename: file, label: "no prediction", probability: 0});
   }
   

  console.log(`filename ${file}`)
  // const modifiedClassifications = filteredClassifications.map((item) => ({filename: file, label: item.label, probability: item.probability}));
  // const noPredictionObjects = noPredictionFiles.map((filename) => ({filename, label: "no prediction", probability: 0}));
  

  allModifiedClassifications = allModifiedClassifications.concat(modifiedClassifications);
  
  // Check if the filename already exists in allModifiedClassifications
  const noPredictionObjects = noPredictionFiles
  .filter((filename) => !allModifiedClassifications.find((obj) => obj.filename === filename))
  .map((filename) => ({filename, label: "no prediction", probability: 0}));
  
  // Check if the filename already exists in allModifiedClassifications
  if (!allModifiedClassifications.includes(file)) {
    allModifiedClassifications = allModifiedClassifications.concat(noPredictionObjects);
  }
  
  
  
  // Modify the filteredClassifications array to include the filename
  allModifiedClassifications = allModifiedClassifications.concat(noPredictionObjects);
 
  

}





csvWriter.writeRecords(allModifiedClassifications);
  
    //   await fs.writeFile(path.join(logsPath, "logs.csv"), logs);7

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