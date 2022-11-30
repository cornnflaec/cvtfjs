// print filename and prediction 
const modelPath = "stat_model" // stat model
const imagePath = "thermostat_image"
const directory = "sample_pics"

const probabilityThreshold = 0.5 

const vision = require("@microsoft/customvision-tfjs-node")

const fs = require("fs").promises;
const path = require("path");

(async () => {
    const model = new vision.ObjectDetectionModel();
    await model.loadModelAsync("file://" + path.join(modelPath, "model.json"));
    // const image = await fs.readdir(directory)
    const image = await fs.readFile(path.join(imagePath, "images (5).jpg"))
    const result = await model.executeAsync(image)
    const labels = (await fs.readFile(path.join(modelPath, "labels.txt"), "utf8")).split("\n")
    let objectClassifications = [];

    for (let i = 0; i < result[0].length; i++) {
		// Get the label index (this will correspond to the labels.txt file)
		const labelIndex = result[2][i];
		// Get the label text value from the labels.txt array created previously
		const label = labels[labelIndex];
		// Add the bounding box coordinates, probability, and label to the classification data
		objectClassifications.push(new ObjectClassification(result[0][i], result[1][i], label));
        
	}

	console.log(objectClassifications.filter((item) => item.probability >= probabilityThreshold).map((item) => `${item.label}: ${item.probability}`).join("\n"));
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
}4