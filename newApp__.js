const fs = require("fs").promises;
const path = require("path");
const vision = require("@microsoft/customvision-tfjs-node");
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

async function processFile(file) {
  // Read the image file
  const image = await fs.readFile(path.join(directory, file))
  const imageTensor = vision.node.decodeJpeg(image);

  // Make predictions on the image
  const result = model.execute(imageTensor);

  // Read the labels from the labels.txt file
  const labels = (await fs.readFile(path.join(modelPath, "labels.txt"), "utf8")).split("\n")

  // Create an array to store the predicted labels and probabilities
  let objectClassifications = [];
  for (let i = 0; i < result[0].length; i++) {
    // Get the label index (this will correspond to the labels.txt file)
    const labelIndex = result[2][i];
    // Get the label
    const label = labels[labelIndex];
    // Add the bounding box coordinates, probability, and label to the classification data
    objectClassifications.push(new ObjectClassification(result[0][i], result[1][i], label));
  }

  // Filter the classifications to only include those with a probability above the threshold
  const filteredClassifications = objectClassifications.filter((item) => item.probability >= probabilityThreshold);

  // Modify the filteredClassifications array to include the filename
  const modifiedClassifications = filteredClassifications.map((item) => ({filename: file, label: item.label, probability: item.probability}));
  return modifiedClassifications;
}

(async () => {
  // Initialize the model and load the trained model from the file
  const model = new vision.ObjectDetectionModel();
  await model.loadModelAsync("file://" + path.join(modelPath, "model.json"));
  // Read the files in the directory
  const files = await fs.readdir(directory);

  // Process the files one by one and store the classifications in an array
  let allModifiedClassifications = [];
  for (const file of files) {
    const modifiedClassifications = await processFile(file);
    allModifiedClassifications = allModifiedClassifications.concat(modifiedClassifications);
  }

  // Write the classifications to the CSV file
  csvWriter.writeRecords(allModifiedClassifications);
});