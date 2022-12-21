const fs = require("fs").promises;
const path = require("path");
const vision = require("@microsoft/customvision-tfjs-node");
// const { CsvWriter } = require("csv-writer/src/lib/csv-writer");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


const modelPath = "stat_model"; // stat model
const directory = "sample_stat"; // 
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
   // const allPredictions = {};
  
  
    for (const file of files) {
        // Read the image file
        const image = await fs.readFile(path.join(directory, file))

        
        // Make predictions on the image
        const result = await model.executeAsync(image)
        
        // Read the labels from the labels.txt file
        const labels = (await fs.readFile(path.join(modelPath, "labels.txt"), "utf8")).split("\n")
        // Create an array to store the predicted labels and probabilities
        let objectClassifications = [];
         const allPredictions = {};
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
      
       
       
    //     const modifiedClassifications = filteredClassifications.map((item) => ({file: file, label: item.label, probability: item.probability}));
  
 //const filteredClassifications = objectClassifications.filter((item) => item.probability >= probabilityThreshold);
 const labelProbabilities = {};
 for (const prediction of objectClassifications) {
   const {label, probability} = prediction;
   if (labelProbabilities[label]) {
     labelProbabilities[label] += probability;
 } 
else {
     labelProbabilities[label] = probability;
  }
 }
 const filteredClassifications = [];
 for (const label in labelProbabilities) {
   const averageProbability = labelProbabilities[label];
   if (averageProbability >= probabilityThreshold) {
     filteredClassifications.push({label, probability: averageProbability});
   }
 }

            console.log(`filename ${file}`)
            console.log(filteredClassifications.map((item) => `${item.label}: ${item.probability}`).join("\n"));
            // Modify the filteredClassifications array to include the filename
            const modifiedClassifications = filteredClassifications.map((item) => ({filename: file, label: item.label, probability: item.probability}));
            allModifiedClassifications = allModifiedClassifications.concat(modifiedClassifications);
                
    }
    
    //   await fs.writeFile(path.join(logsPath, "logs.csv"), logs);7
    csvWriter.writeRecords(allModifiedClassifications);
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